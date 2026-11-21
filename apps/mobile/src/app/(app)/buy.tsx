import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { messageOf } from '@/api/client';
import { createBuyOrder, getRates, verifyPayment } from '@/api/services';
import type { BuyOrderIntent, PaymentMethod, PurchaseReceipt } from '@/api/types';
import { Backdrop } from '@/components/Backdrop';
import { Banner } from '@/components/Banner';
import { Button } from '@/components/Button';
import { Card, KeyValueRow, SectionLabel } from '@/components/Card';
import { ChoiceList, QuickAmounts, type Option } from '@/components/Choices';
import { Screen } from '@/components/Screen';
import { Sheet } from '@/components/Sheet';
import { ErrorView, LoadingView } from '@/components/State';
import { TextField } from '@/components/TextField';
import { track } from '@/lib/analytics';
import { formatCoin, formatInr, multiplyToInr, sanitizeDecimalInput } from '@/lib/money';
import { useResource } from '@/lib/useResource';
import { validateCoinAmount } from '@/lib/validation';
import { colors, radius } from '@/theme';

const METHODS: Option<PaymentMethod>[] = [
  { value: 'RAZORPAY_UPI', label: 'UPI (Google Pay, PhonePe, Paytm)', icon: 'phone-portrait-outline' },
  { value: 'RAZORPAY_CARD', label: 'Debit / Credit card', icon: 'card-outline' },
  { value: 'RAZORPAY_NETBANKING', label: 'Net banking', icon: 'business-outline' },
];

const QUICK = ['100', '500', '1000', '5000'];

export default function BuyScreen() {
  const router = useRouter();
  const rates = useResource((signal) => getRates(signal), []);

  const [amount, setAmount] = useState('100');
  const [method, setMethod] = useState<PaymentMethod>('RAZORPAY_UPI');
  const [creating, setCreating] = useState(false);
  const [paying, setPaying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [order, setOrder] = useState<BuyOrderIntent | null>(null);
  const [receipt, setReceipt] = useState<PurchaseReceipt | null>(null);

  if (rates.loading && !rates.data) return <LoadingView label="Loading rates…" />;
  if (!rates.data) return <ErrorView message={rates.error ?? 'Could not load rates.'} onRetry={rates.reload} />;

  const r = rates.data;

  if (receipt) {
    return (
      <Screen insetBottom>
        <Card style={styles.receipt}>
          <View style={styles.successBadge}>
            <Ionicons name="checkmark" size={38} color={colors.white} />
          </View>
          <Text style={styles.receiptTitle}>Coins credited to your wallet</Text>
          <Text style={styles.receiptSub}>Purchase receipt</Text>
          <View style={styles.receiptRows}>
            <KeyValueRow label="Receipt no." value={receipt.receiptNumber} selectable />
            <KeyValueRow label="Order no." value={receipt.orderNumber} selectable />
            <KeyValueRow label="Coins credited" value={`+${formatCoin(receipt.coinAmount)} SI`} bold />
            <KeyValueRow label="Rate" value={`${formatInr(receipt.pricePerCoinInr)} / SI`} />
            <KeyValueRow label="Total paid" value={formatInr(receipt.totalInr)} bold />
          </View>
          <Button title="Back to wallet" onPress={() => router.back()} style={styles.fullWidth} />
        </Card>
      </Screen>
    );
  }

  const total = multiplyToInr(amount, r.buyPriceInr);
  const amountProblem = validateCoinAmount(amount, { min: r.minBuyCoins, max: r.maxBuyCoins });
  const busy = creating || paying;

  const startPayment = async () => {
    if (busy) return;
    if (amountProblem) {
      setError(amountProblem);
      return;
    }
    setCreating(true);
    setError(null);
    try {
      const created = await createBuyOrder(amount.trim(), method);
      if (!created.testSignatureHelper || !created.testPaymentId) {
        setError(
          'This server is configured for live Razorpay payments, which this app build cannot open yet. ' +
            'Please buy coins from the SIcoinX website for now.',
        );
        return;
      }
      setOrder(created);
    } catch (e) {
      setError(messageOf(e));
    } finally {
      setCreating(false);
    }
  };

  const confirmPayment = async () => {
    if (!order || paying) return;
    setPaying(true);
    setError(null);
    try {
      const verified = await verifyPayment({
        buyOrderId: order.buyOrderId,
        razorpayOrderId: order.razorpayOrder.id,
        razorpayPaymentId: order.testPaymentId!,
        razorpaySignature: order.testSignatureHelper!,
      });
      track('purchase', {
        currency: 'INR',
        value: Number(order.totalInr),
        transaction_id: order.orderNumber,
        payment_method: method,
      });
      setOrder(null);
      setReceipt(
        verified.receipt ?? {
          receiptNumber: order.receiptNumber,
          orderNumber: order.orderNumber,
          date: new Date().toISOString(),
          coinAmount: order.coinAmount,
          totalInr: order.totalInr,
          pricePerCoinInr: order.pricePerCoinInr,
          gatewayPaymentId: order.testPaymentId!,
          status: 'COMPLETED',
        },
      );
    } catch (e) {
      setOrder(null);
      setError(messageOf(e));
    } finally {
      setPaying(false);
    }
  };

  return (
    <Screen insetBottom>
      <View style={styles.rateStrip}>
        <Backdrop />
        <View>
          <Text style={styles.rateLabel}>Buying rate</Text>
          <Text style={styles.rateValue}>1 SI = {formatInr(r.buyPriceInr)}</Text>
        </View>
        <View style={styles.instant}>
          <Ionicons name="flash" size={13} color={colors.white} />
          <Text style={styles.instantText}>Instant credit</Text>
        </View>
      </View>

      {!r.enableBuying ? (
        <Banner tone="warning" message="Coin purchases are temporarily paused by the platform." />
      ) : null}
      {error ? <Banner tone="error" message={error} /> : null}

      <Card>
        <TextField
          label="Coins to purchase"
          value={amount}
          onChangeText={(t) => {
            setAmount(sanitizeDecimalInput(t));
            setError(null);
          }}
          keyboardType="decimal-pad"
          suffix="SI"
          large
          hint={`Min ${r.minBuyCoins} · Max ${r.maxBuyCoins} SI per purchase`}
          error={amount.length > 0 ? amountProblem : null}
          editable={!busy}
        />
        <QuickAmounts
          amounts={QUICK}
          onPick={(a) => {
            setAmount(a);
            setError(null);
          }}
        />
        <View style={styles.totalRow}>
          <Text style={styles.totalLabel}>Total to pay</Text>
          <Text style={styles.totalValue}>{formatInr(total)}</Text>
        </View>
      </Card>

      <View style={styles.methods}>
        <SectionLabel>Payment method</SectionLabel>
        <ChoiceList options={METHODS} value={method} onChange={setMethod} />
      </View>

      <Button
        title={`Pay ${formatInr(total)}`}
        icon="lock-closed"
        onPress={startPayment}
        loading={creating}
        disabled={!r.enableBuying || amountProblem !== null}
      />

      <Sheet visible={order !== null} title="Confirm payment" onClose={() => setOrder(null)} locked={paying}>
        {order ? (
          <>
            <Banner
              tone="info"
              title="Sandbox payment"
              message="This server runs Razorpay in sandbox mode. No real money is charged."
            />
            <View>
              <KeyValueRow label="Order" value={order.orderNumber} selectable />
              <KeyValueRow label="Coins" value={`${formatCoin(order.coinAmount)} SI`} />
              <KeyValueRow label="Amount" value={formatInr(order.totalInr)} bold />
            </View>
            <Button title={`Simulate payment of ${formatInr(order.totalInr)}`} onPress={confirmPayment} loading={paying} />
            <Button title="Cancel" variant="ghost" onPress={() => setOrder(null)} disabled={paying} />
          </>
        ) : null}
      </Sheet>
    </Screen>
  );
}

const styles = StyleSheet.create({
  rateStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    backgroundColor: colors.navy,
    borderRadius: radius.lg,
    overflow: 'hidden',
  },
  rateLabel: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.75)' },
  rateValue: { fontSize: 20, fontWeight: '900', color: colors.white, letterSpacing: -0.4, marginTop: 2 },
  instant: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(18, 146, 79, 0.85)',
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  instantText: { fontSize: 11, fontWeight: '800', color: colors.white },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  totalLabel: { fontSize: 13, color: colors.muted, fontWeight: '600' },
  totalValue: { fontSize: 22, fontWeight: '900', color: colors.primary, letterSpacing: -0.4 },
  methods: { gap: 10 },
  receipt: { alignItems: 'center', paddingVertical: 28 },
  successBadge: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center' },
  receiptTitle: { fontSize: 20, fontWeight: '900', color: colors.text, textAlign: 'center', letterSpacing: -0.3 },
  receiptSub: { fontSize: 13, color: colors.muted, marginTop: -8 },
  receiptRows: { alignSelf: 'stretch' },
  fullWidth: { alignSelf: 'stretch' },
});
