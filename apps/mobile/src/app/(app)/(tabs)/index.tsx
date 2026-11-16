import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { getTransactions, getWallet } from '@/api/services';
import { Banner } from '@/components/Banner';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { ErrorView, LoadingView } from '@/components/State';
import { TransactionRow } from '@/components/TransactionRow';
import { formatCoin, formatInr, formatUsd } from '@/lib/money';
import { useResource } from '@/lib/useResource';
import { colors, radius } from '@/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

const ACTIONS: { label: string; icon: IconName; href: Href; tint: string }[] = [
  { label: 'Buy Coins', icon: 'add-circle-outline', href: '/buy', tint: colors.primary },
  { label: 'Sell to Bank', icon: 'business-outline', href: '/sell', tint: colors.primaryDeep },
  { label: 'Transfer', icon: 'paper-plane-outline', href: '/transfer', tint: colors.sky },
];

export default function WalletScreen() {
  const router = useRouter();
  const { data, error, loading, refreshing, reload, refresh } = useResource(
    async (signal) => {
      const [overview, txs] = await Promise.all([getWallet(signal), getTransactions('ALL', 1, 5, signal)]);
      return { overview, transactions: txs.transactions };
    },
    [],
    { refetchOnFocus: true },
  );

  if (loading && !data) return <LoadingView label="Loading your wallet…" />;
  if (!data) return <ErrorView message={error ?? 'Could not load your wallet.'} onRetry={reload} />;

  const { overview, transactions } = data;
  const { wallet, rates, valuation, kycStatus } = overview;
  const verified = kycStatus === 'APPROVED';

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      {error ? <Banner tone="warning" message={`Couldn't refresh: ${error}`} /> : null}
      {wallet.isFrozen ? (
        <Banner
          tone="error"
          title="Wallet frozen"
          message="Your wallet is frozen, so transactions are disabled. Contact support for help."
        />
      ) : null}

      <View style={styles.walletCard}>
        <View style={styles.walletTop}>
          <Text style={styles.walletTitle}>SIcoinX DIGITAL WALLET</Text>
          <View style={styles.kycBadge}>
            <Text style={styles.kycBadgeText}>{verified ? 'KYC VERIFIED' : 'KYC PENDING'}</Text>
          </View>
        </View>
        <Text style={styles.address} selectable>
          {wallet.address}
        </Text>
        <View style={styles.balanceRow}>
          <Text style={styles.balance} adjustsFontSizeToFit numberOfLines={1}>
            {formatCoin(wallet.coinBalance)}
          </Text>
          <Text style={styles.ticker}>SI</Text>
        </View>
        <Text style={styles.valuation}>
          ≈ {formatInr(valuation.inr)} ({formatUsd(valuation.usd)})
        </Text>
      </View>

      <Card style={styles.rates}>
        <View style={styles.rateCol}>
          <Text style={styles.rateLabel}>BUY</Text>
          <Text style={styles.rateValue}>{formatInr(rates.buyPriceInr)}</Text>
        </View>
        <View style={styles.rateDivider} />
        <View style={styles.rateCol}>
          <Text style={styles.rateLabel}>SELL</Text>
          <Text style={styles.rateValue}>{formatInr(rates.sellPriceInr)}</Text>
        </View>
        <View style={styles.rateDivider} />
        <View style={styles.rateCol}>
          <Text style={styles.rateLabel}>USD RATE</Text>
          <Text style={styles.rateValue}>₹{rates.inrPerUsd}</Text>
        </View>
      </Card>

      <View style={styles.actions}>
        {ACTIONS.map((a) => (
          <Pressable
            key={a.label}
            onPress={() => router.push(a.href)}
            accessibilityRole="button"
            accessibilityLabel={a.label}
            style={({ pressed }) => [styles.action, pressed && styles.pressed]}
          >
            <Ionicons name={a.icon} size={26} color={a.tint} />
            <Text style={styles.actionLabel}>{a.label}</Text>
          </Pressable>
        ))}
      </View>

      <View style={styles.ecosystem}>
        <View style={styles.ecosystemIcon}>
          <Ionicons name="git-network-outline" size={22} color={colors.white} />
        </View>
        <View style={styles.ecosystemText}>
          <Text style={styles.ecosystemTitle}>Connected ecosystem</Text>
          <Text style={styles.ecosystemBody}>
            Send SIcoinX to connected platforms such as YouPeak and YouPeak Shop from the Transfer screen.
          </Text>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Recent transactions</Text>
        <Pressable onPress={() => router.navigate('/history')} hitSlop={10} accessibilityRole="link">
          <Text style={styles.viewAll}>View all</Text>
        </Pressable>
      </View>

      {transactions.length === 0 ? (
        <Card>
          <Text style={styles.empty}>No transactions yet. Your purchases and transfers will appear here.</Text>
        </Card>
      ) : (
        <View style={styles.list}>
          {transactions.map((tx) => (
            <TransactionRow key={tx.id} tx={tx} />
          ))}
        </View>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  walletCard: {
    backgroundColor: colors.primary,
    borderRadius: radius.xl,
    padding: 20,
    gap: 10,
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 6,
  },
  walletTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  walletTitle: { color: 'rgba(255,255,255,0.75)', fontSize: 11, fontWeight: '800', letterSpacing: 0.6 },
  kycBadge: { backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: 999, paddingHorizontal: 9, paddingVertical: 3 },
  kycBadgeText: { color: colors.white, fontSize: 10, fontWeight: '800' },
  address: { color: colors.white, fontSize: 12, fontWeight: '700', fontFamily: 'monospace' },
  balanceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 6, marginTop: 6 },
  balance: { color: colors.white, fontSize: 34, fontWeight: '900', flexShrink: 1 },
  ticker: { color: 'rgba(255,255,255,0.75)', fontSize: 16, fontWeight: '800' },
  valuation: { color: 'rgba(255,255,255,0.8)', fontSize: 12, fontWeight: '600' },
  rates: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, gap: 0 },
  rateCol: { flex: 1, alignItems: 'center', gap: 2 },
  rateLabel: { fontSize: 10, fontWeight: '800', color: colors.muted, letterSpacing: 0.5 },
  rateValue: { fontSize: 14, fontWeight: '800', color: colors.text },
  rateDivider: { width: 1, height: 28, backgroundColor: colors.border },
  actions: { flexDirection: 'row', gap: 10 },
  action: {
    flex: 1,
    alignItems: 'center',
    gap: 6,
    paddingVertical: 14,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.85 },
  actionLabel: { fontSize: 11, fontWeight: '700', color: colors.text },
  ecosystem: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    backgroundColor: colors.paleBlue,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  ecosystemIcon: {
    width: 40,
    height: 40,
    borderRadius: radius.md,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ecosystemText: { flex: 1, gap: 2 },
  ecosystemTitle: { fontSize: 13, fontWeight: '800', color: colors.text },
  ecosystemBody: { fontSize: 11, color: colors.muted, lineHeight: 16 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: colors.text },
  viewAll: { fontSize: 12, fontWeight: '700', color: colors.primary },
  list: { gap: 8 },
  empty: { fontSize: 12, color: colors.muted, textAlign: 'center' },
});
