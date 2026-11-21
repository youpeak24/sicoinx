import { Ionicons } from '@expo/vector-icons';
import { useRouter, type Href } from 'expo-router';
import { useState, type ComponentProps } from 'react';
import { Pressable, Share, StyleSheet, Text, View } from 'react-native';

import { getNotifications, getTransactions, getWallet } from '@/api/services';
import { Backdrop } from '@/components/Backdrop';
import { Banner } from '@/components/Banner';
import { Button } from '@/components/Button';
import { Card, IconChip, SectionHeader } from '@/components/Card';
import { HomeHeader } from '@/components/Headers';
import { Screen } from '@/components/Screen';
import { Sheet } from '@/components/Sheet';
import { ErrorView, LoadingView } from '@/components/State';
import { TransactionRow } from '@/components/TransactionRow';
import { formatCoin, formatInr, formatUsd } from '@/lib/money';
import { useResource } from '@/lib/useResource';
import { colors, radius, shadow, type ChipTone } from '@/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

const ACTIONS: { label: string; icon: IconName; tone: ChipTone; href: Href }[] = [
  { label: 'Buy', icon: 'add', tone: 'blue', href: '/buy' },
  { label: 'Sell', icon: 'business-outline', tone: 'amber', href: '/sell' },
  { label: 'Send', icon: 'paper-plane-outline', tone: 'violet', href: '/transfer' },
];

export default function WalletScreen() {
  const router = useRouter();
  const [hidden, setHidden] = useState(false);
  const [receiving, setReceiving] = useState(false);
  const [shareError, setShareError] = useState<string | null>(null);

  const { data, error, loading, refreshing, reload, refresh } = useResource(
    async (signal) => {
      const [overview, txs, notifications] = await Promise.all([
        getWallet(signal),
        getTransactions('ALL', 1, 5, signal),
        // The bell badge is a nice-to-have: never let it break the wallet.
        getNotifications(signal).catch(() => []),
      ]);
      return {
        overview,
        transactions: txs.transactions,
        unread: notifications.filter((n) => !n.isRead).length,
      };
    },
    [],
    { refetchOnFocus: true },
  );

  let body;
  if (loading && !data) {
    body = <LoadingView label="Loading your wallet…" />;
  } else if (!data) {
    body = <ErrorView message={error ?? 'Could not load your wallet.'} onRetry={reload} />;
  } else {
    const { overview, transactions } = data;
    const { wallet, rates, valuation, kycStatus } = overview;
    const verified = kycStatus === 'APPROVED';

    const shareAddress = async () => {
      setShareError(null);
      try {
        await Share.share({ message: `My SIcoinX wallet address: ${wallet.address}` });
      } catch {
        setShareError('Sharing is not available here. Select the address above to copy it.');
      }
    };

    body = (
      <Screen refreshing={refreshing} onRefresh={refresh}>
        {error ? <Banner tone="warning" message={`Couldn't refresh: ${error}`} /> : null}
        {wallet.isFrozen ? (
          <Banner
            tone="error"
            title="Wallet frozen"
            message="Your wallet is frozen, so transactions are disabled. Contact support for help."
          />
        ) : null}

        <View style={styles.hero}>
          <Backdrop />
          <View style={styles.heroTop}>
            <View style={styles.heroLabelRow}>
              <Text style={styles.heroLabel}>Total balance</Text>
              <Pressable
                onPress={() => setHidden((h) => !h)}
                hitSlop={10}
                accessibilityRole="button"
                accessibilityLabel={hidden ? 'Show balance' : 'Hide balance'}
              >
                <Ionicons name={hidden ? 'eye-off-outline' : 'eye-outline'} size={18} color="rgba(255,255,255,0.8)" />
              </Pressable>
            </View>
            <View style={[styles.kycBadge, verified && styles.kycBadgeOk]}>
              <Ionicons
                name={verified ? 'shield-checkmark' : 'shield-outline'}
                size={12}
                color={colors.white}
              />
              <Text style={styles.kycBadgeText}>{verified ? 'Verified' : 'KYC pending'}</Text>
            </View>
          </View>

          <View style={styles.balanceRow}>
            <Text style={styles.balance} adjustsFontSizeToFit numberOfLines={1} testID="wallet-balance">
              {hidden ? '••••••' : formatCoin(wallet.coinBalance)}
            </Text>
            <Text style={styles.ticker}>SI</Text>
          </View>
          <Text style={styles.valuation}>
            {hidden ? '≈ ••••••' : `≈ ${formatInr(valuation.inr)}  ·  ${formatUsd(valuation.usd)}`}
          </Text>

          <View style={styles.addressPill}>
            <Ionicons name="wallet-outline" size={15} color="rgba(255,255,255,0.85)" />
            <Text style={styles.address} numberOfLines={1} selectable>
              {wallet.address}
            </Text>
          </View>
        </View>

        <View style={styles.actions}>
          {ACTIONS.map((a) => (
            <Pressable
              key={a.label}
              onPress={() => router.push(a.href)}
              accessibilityRole="button"
              accessibilityLabel={a.label}
              style={({ pressed }) => [styles.action, pressed && styles.pressed]}
            >
              <IconChip name={a.icon} tone={a.tone} size={48} />
              <Text style={styles.actionLabel}>{a.label}</Text>
            </Pressable>
          ))}
          <Pressable
            onPress={() => setReceiving(true)}
            accessibilityRole="button"
            accessibilityLabel="Receive"
            style={({ pressed }) => [styles.action, pressed && styles.pressed]}
          >
            <IconChip name="download-outline" tone="green" size={48} />
            <Text style={styles.actionLabel}>Receive</Text>
          </Pressable>
        </View>

        <Card style={styles.rates}>
          <View style={styles.rateCol}>
            <Text style={styles.rateLabel}>Buy rate</Text>
            <Text style={styles.rateValue}>{formatInr(rates.buyPriceInr)}</Text>
          </View>
          <View style={styles.rateDivider} />
          <View style={styles.rateCol}>
            <Text style={styles.rateLabel}>Sell rate</Text>
            <Text style={styles.rateValue}>{formatInr(rates.sellPriceInr)}</Text>
          </View>
          <View style={styles.rateDivider} />
          <View style={styles.rateCol}>
            <Text style={styles.rateLabel}>USD rate</Text>
            <Text style={styles.rateValue}>₹{rates.inrPerUsd}</Text>
          </View>
        </Card>

        {!verified ? (
          <Pressable
            onPress={() => router.navigate('/kyc')}
            accessibilityRole="button"
            accessibilityLabel="Complete identity verification"
            style={({ pressed }) => [styles.kycCard, pressed && styles.pressed]}
          >
            <IconChip name="shield-checkmark-outline" tone="amber" size={44} />
            <View style={styles.kycText}>
              <Text style={styles.kycTitle}>
                {kycStatus === 'PENDING' ? 'Verification in review' : 'Complete your verification'}
              </Text>
              <Text style={styles.kycBody}>
                {kycStatus === 'PENDING'
                  ? 'We are reviewing your documents. This usually takes 1–24 hours.'
                  : 'Verify your identity to unlock bank payouts and full limits.'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.warning} />
          </Pressable>
        ) : null}

        <View style={styles.ecosystem}>
          <View style={styles.ecosystemIcon}>
            <Ionicons name="git-network-outline" size={22} color={colors.white} />
          </View>
          <View style={styles.ecosystemText}>
            <Text style={styles.ecosystemTitle}>Connected ecosystem</Text>
            <Text style={styles.ecosystemBody}>
              Send SIcoinX to connected platforms such as YouPeak and YouPeak Shop from the Send screen.
            </Text>
          </View>
        </View>

        <SectionHeader title="Recent transactions" actionLabel="View all" onAction={() => router.navigate('/history')} />

        {transactions.length === 0 ? (
          <Card style={styles.emptyCard}>
            <IconChip name="receipt-outline" tone="slate" size={48} />
            <Text style={styles.emptyTitle}>No transactions yet</Text>
            <Text style={styles.empty}>Your purchases and transfers will appear here.</Text>
            <Button title="Buy your first coins" icon="add" small onPress={() => router.push('/buy')} />
          </Card>
        ) : (
          <View style={styles.list}>
            {transactions.map((tx) => (
              <TransactionRow key={tx.id} tx={tx} />
            ))}
          </View>
        )}

        <Sheet visible={receiving} title="Receive SIcoinX" onClose={() => setReceiving(false)}>
          <Text style={styles.receiveHelp}>
            Share your wallet ID with another SIcoinX user or a connected app so they can send coins to you.
          </Text>
          <View style={styles.receiveBox}>
            <Text style={styles.receiveLabel}>Your wallet ID</Text>
            <Text style={styles.receiveAddress} selectable testID="receive-address">
              {wallet.address}
            </Text>
          </View>
          {shareError ? <Banner tone="info" message={shareError} /> : null}
          <Button title="Share wallet ID" icon="share-social-outline" onPress={() => void shareAddress()} />
          <Button title="Close" variant="ghost" onPress={() => setReceiving(false)} />
        </Sheet>
      </Screen>
    );
  }

  return (
    <View style={styles.fill}>
      <HomeHeader unread={data?.unread ?? 0} />
      {body}
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.canvas },
  hero: {
    backgroundColor: colors.navy,
    borderRadius: radius.xl,
    padding: 22,
    gap: 10,
    overflow: 'hidden',
    boxShadow: '0px 16px 34px rgba(10, 42, 122, 0.35)',
  },
  heroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  heroLabelRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  heroLabel: { color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '700' },
  kycBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  kycBadgeOk: { backgroundColor: 'rgba(18, 146, 79, 0.85)' },
  kycBadgeText: { color: colors.white, fontSize: 11, fontWeight: '800' },
  balanceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 6 },
  balance: { color: colors.white, fontSize: 44, fontWeight: '900', letterSpacing: -1.2, flexShrink: 1 },
  ticker: { color: 'rgba(255,255,255,0.8)', fontSize: 18, fontWeight: '800' },
  valuation: { color: 'rgba(255,255,255,0.82)', fontSize: 13, fontWeight: '600' },
  addressPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    alignSelf: 'flex-start',
    marginTop: 8,
    maxWidth: '100%',
    backgroundColor: 'rgba(255,255,255,0.14)',
    borderRadius: radius.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  address: { color: colors.white, fontSize: 12, fontWeight: '700', fontFamily: 'monospace', flexShrink: 1 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 4 },
  action: { alignItems: 'center', gap: 8, minWidth: 64 },
  pressed: { opacity: 0.8 },
  actionLabel: { fontSize: 12, fontWeight: '700', color: colors.textSoft },
  rates: { flexDirection: 'row', alignItems: 'center', paddingVertical: 14, gap: 0 },
  rateCol: { flex: 1, alignItems: 'center', gap: 3 },
  rateLabel: { fontSize: 11, fontWeight: '700', color: colors.muted },
  rateValue: { fontSize: 15, fontWeight: '800', color: colors.text },
  rateDivider: { width: 1, height: 30, backgroundColor: colors.border },
  kycCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: colors.warningBg,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.warningBorder,
  },
  kycText: { flex: 1, gap: 2 },
  kycTitle: { fontSize: 14, fontWeight: '800', color: colors.warning },
  kycBody: { fontSize: 12, color: colors.textSoft, lineHeight: 17 },
  ecosystem: {
    flexDirection: 'row',
    gap: 12,
    padding: 14,
    backgroundColor: colors.paleBlue,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#CFE0FF',
    alignItems: 'center',
  },
  ecosystemIcon: {
    width: 44,
    height: 44,
    borderRadius: 15,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.glow,
  },
  ecosystemText: { flex: 1, gap: 2 },
  ecosystemTitle: { fontSize: 14, fontWeight: '800', color: colors.text },
  ecosystemBody: { fontSize: 12, color: colors.textSoft, lineHeight: 17 },
  list: { gap: 10 },
  emptyCard: { alignItems: 'center', paddingVertical: 24, gap: 8 },
  emptyTitle: { fontSize: 15, fontWeight: '800', color: colors.text },
  empty: { fontSize: 13, color: colors.muted, textAlign: 'center', marginBottom: 6 },
  receiveHelp: { fontSize: 14, color: colors.muted, lineHeight: 21 },
  receiveBox: { backgroundColor: colors.paleBlue, borderRadius: radius.md, padding: 16, gap: 6 },
  receiveLabel: { fontSize: 11, fontWeight: '800', color: colors.muted, letterSpacing: 0.6, textTransform: 'uppercase' },
  receiveAddress: { fontSize: 16, fontWeight: '800', color: colors.text, fontFamily: 'monospace' },
});
