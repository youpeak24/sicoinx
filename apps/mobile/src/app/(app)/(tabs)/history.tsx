import { useFocusEffect } from 'expo-router';
import { useCallback, useRef, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, View } from 'react-native';

import { messageOf } from '@/api/client';
import { getTransactions } from '@/api/services';
import type { Pagination, Transaction } from '@/api/types';
import { Banner } from '@/components/Banner';
import { Button } from '@/components/Button';
import { KeyValueRow, Pill } from '@/components/Card';
import { FilterPills, type Option } from '@/components/Choices';
import { Sheet } from '@/components/Sheet';
import { EmptyView, ErrorView, LoadingView } from '@/components/State';
import { TransactionRow } from '@/components/TransactionRow';
import { formatDateTime, shortHash, statusLabel, txTypeLabel } from '@/lib/format';
import { formatCoin } from '@/lib/money';
import { colors } from '@/theme';

const PAGE_SIZE = 20;

const FILTERS: Option<string>[] = [
  { value: 'ALL', label: 'All' },
  { value: 'BUY_COIN', label: 'Purchases' },
  { value: 'SELL_COIN', label: 'Sales' },
  { value: 'TRANSFER_OUT', label: 'Sent' },
  { value: 'TRANSFER_IN', label: 'Received' },
  { value: 'ECOSYSTEM_DEBIT', label: 'YouPeak' },
];

export default function HistoryScreen() {
  const [filter, setFilter] = useState('ALL');
  const [items, setItems] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<Transaction | null>(null);

  // Guards against responses from a previous filter arriving late.
  const generation = useRef(0);
  const filterRef = useRef('ALL');

  const loadFirstPage = useCallback(async (mode: 'initial' | 'refresh' | 'silent') => {
    const gen = ++generation.current;
    if (mode === 'initial') {
      setLoading(true);
      setError(null);
    } else if (mode === 'refresh') {
      setRefreshing(true);
    }
    try {
      const page = await getTransactions(filterRef.current, 1, PAGE_SIZE);
      if (gen !== generation.current) return;
      setItems(page.transactions);
      setPagination(page.pagination);
      setError(null);
    } catch (e) {
      if (gen !== generation.current) return;
      setError(messageOf(e));
    } finally {
      if (gen === generation.current) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, []);

  const selectFilter = (next: string) => {
    if (next === filterRef.current) return;
    filterRef.current = next;
    setFilter(next);
    setItems([]);
    setPagination(null);
    void loadFirstPage('initial');
  };

  // The first focus performs the initial load; later focuses (e.g. returning from
  // buy/sell/transfer) silently pick up new activity.
  const focusedOnce = useRef(false);
  useFocusEffect(
    useCallback(() => {
      void loadFirstPage(focusedOnce.current ? 'silent' : 'initial');
      focusedOnce.current = true;
    }, [loadFirstPage]),
  );

  const loadMore = async () => {
    if (loadingMore || loading || !pagination || pagination.page >= pagination.totalPages) return;
    const gen = generation.current;
    setLoadingMore(true);
    try {
      const page = await getTransactions(filterRef.current, pagination.page + 1, PAGE_SIZE);
      if (gen !== generation.current) return;
      setItems((prev) => {
        const seen = new Set(prev.map((t) => t.id));
        return [...prev, ...page.transactions.filter((t) => !seen.has(t.id))];
      });
      setPagination(page.pagination);
    } catch (e) {
      if (gen === generation.current) setError(messageOf(e));
    } finally {
      setLoadingMore(false);
    }
  };

  const header = (
    <View>
      <FilterPills options={FILTERS} value={filter} onChange={selectFilter} />
      {error && items.length > 0 ? (
        <View style={styles.bannerWrap}>
          <Banner tone="warning" message={error} />
        </View>
      ) : null}
    </View>
  );

  let body;
  if (loading && items.length === 0) {
    body = <LoadingView label="Loading transactions…" />;
  } else if (error && items.length === 0) {
    body = <ErrorView message={error} onRetry={() => void loadFirstPage('initial')} />;
  } else {
    body = (
      <FlatList
        data={items}
        keyExtractor={(tx) => tx.id}
        renderItem={({ item }) => <TransactionRow tx={item} onPress={setSelected} />}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        contentContainerStyle={items.length === 0 ? styles.emptyContent : styles.listContent}
        ListEmptyComponent={
          <EmptyView
            icon="receipt-outline"
            title="No transactions found"
            message="Nothing matches this filter yet."
          />
        }
        ListFooterComponent={loadingMore ? <ActivityIndicator style={styles.footer} color={colors.primary} /> : undefined}
        onEndReached={loadMore}
        onEndReachedThreshold={0.4}
        refreshing={refreshing}
        onRefresh={() => void loadFirstPage('refresh')}
        showsVerticalScrollIndicator={false}
      />
    );
  }

  return (
    <View style={styles.fill}>
      {header}
      <View style={styles.fill}>{body}</View>

      <Sheet visible={selected !== null} title="Transaction receipt" onClose={() => setSelected(null)}>
        {selected ? (
          <>
            <Pill
              label={statusLabel(selected.status).toUpperCase()}
              tone={selected.status === 'CONFIRMED' ? 'success' : selected.status === 'FAILED' ? 'danger' : 'warning'}
            />
            <View>
              <KeyValueRow label="Type" value={txTypeLabel(selected.type)} />
              <KeyValueRow label="Amount" value={`${formatCoin(selected.coinAmount, true)} SI`} bold />
              {selected.fiatAmount ? <KeyValueRow label="Fiat value" value={selected.fiatAmount} /> : null}
              <KeyValueRow label="Balance after" value={`${formatCoin(selected.balanceAfter)} SI`} />
              <KeyValueRow label="Description" value={selected.description} />
              <KeyValueRow label="Date" value={formatDateTime(selected.createdAt)} />
              <KeyValueRow label="Transaction hash" value={shortHash(selected.txHash)} selectable />
            </View>
            <Button title="Close" variant="secondary" onPress={() => setSelected(null)} />
          </>
        ) : null}
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.canvas },
  bannerWrap: { paddingHorizontal: 20, paddingBottom: 8 },
  listContent: { paddingHorizontal: 20, paddingBottom: 24 },
  emptyContent: { flexGrow: 1 },
  separator: { height: 10 },
  footer: { paddingVertical: 16 },
});
