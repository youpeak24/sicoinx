import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, Text, View, type TextInputInstance } from 'react-native';

import { messageOf } from '@/api/client';
import { getRates, getWallet, submitSellRequest } from '@/api/services';
import { Banner } from '@/components/Banner';
import { Button } from '@/components/Button';
import { Card, SectionLabel } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { ErrorView, LoadingView } from '@/components/State';
import { TextField } from '@/components/TextField';
import { track } from '@/lib/analytics';
import { formatCoin, formatInr, multiplyToInr, sanitizeDecimalInput } from '@/lib/money';
import { useResource } from '@/lib/useResource';
import { validateBankDetails, validateCoinAmount } from '@/lib/validation';
import { colors, radius } from '@/theme';

export default function SellScreen() {
  const router = useRouter();
  const data = useResource(async (signal) => {
    const [rates, overview] = await Promise.all([getRates(signal), getWallet(signal)]);
    return { rates, overview };
  }, []);

  const [amount, setAmount] = useState('');
  const [accountName, setAccountName] = useState('');
  const [bankName, setBankName] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [ifsc, setIfsc] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<string | null>(null);

  const bankRef = useRef<TextInputInstance>(null);
  const accountRef = useRef<TextInputInstance>(null);
  const ifscRef = useRef<TextInputInstance>(null);

  if (data.loading && !data.data) return <LoadingView label="Loading rates…" />;
  if (!data.data) return <ErrorView message={data.error ?? 'Could not load rates.'} onRetry={data.reload} />;

  const { rates, overview } = data.data;
  const balance = overview.wallet.coinBalance;
  const payout = multiplyToInr(amount, rates.sellPriceInr);
  const amountProblem = validateCoinAmount(amount, {
    min: rates.minSellCoins,
    max: rates.maxSellCoins,
    available: balance,
  });
  const frozen = overview.wallet.isFrozen;

  if (orderNumber) {
    return (
      <Screen insetBottom>
        <Card style={styles.done}>
          <View style={styles.successBadge}>
            <Ionicons name="checkmark" size={38} color={colors.white} />
          </View>
          <Text style={styles.doneTitle}>Payout request submitted</Text>
          <Text style={styles.doneBody}>
            Order {orderNumber} is queued for review and bank settlement. You can follow it under Activity.
          </Text>
          <Button title="Back to wallet" onPress={() => router.back()} style={styles.fullWidth} />
        </Card>
      </Screen>
    );
  }

  const submit = async () => {
    if (submitting) return;
    const problem =
      amountProblem ?? validateBankDetails({ accountName, bankName, accountNumber, ifsc });
    if (problem) {
      setError(problem);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const result = await submitSellRequest({
        coinAmount: amount.trim(),
        bankAccountName: accountName.trim(),
        bankName: bankName.trim(),
        accountNumber: accountNumber.trim(),
        ifscCode: ifsc.trim().toUpperCase(),
      });
      track('sell_request', { currency: 'INR', value: Number(payout) });
      setOrderNumber(result.sellOrder.orderNumber);
    } catch (e) {
      setError(messageOf(e));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Screen insetBottom>
      <View style={styles.rateStrip}>
        <View>
          <Text style={styles.rateLabel}>Selling rate</Text>
          <Text style={styles.rateValue}>1 SI = {formatInr(rates.sellPriceInr)}</Text>
        </View>
        <View style={styles.settlement}>
          <Ionicons name="business" size={13} color={colors.primary} />
          <Text style={styles.settlementText}>Bank settlement</Text>
        </View>
      </View>

      {!rates.enableSelling ? (
        <Banner tone="warning" message="Selling and withdrawals are temporarily paused by the platform." />
      ) : null}
      {overview.kycStatus !== 'APPROVED' ? (
        <Banner
          tone="info"
          message="Payouts may require completed KYC verification. You can submit it from the Verify tab."
        />
      ) : null}
      {frozen ? <Banner tone="error" message="Your wallet is frozen. Contact support to sell coins." /> : null}
      {error ? <Banner tone="error" message={error} /> : null}

      <Card>
        <TextField
          label="Coins to sell"
          value={amount}
          onChangeText={(t) => {
            setAmount(sanitizeDecimalInput(t));
            setError(null);
          }}
          keyboardType="decimal-pad"
          suffix="SI"
          large
          placeholder="0"
          hint={`Available: ${formatCoin(balance)} SI`}
          error={amount.length > 0 ? amountProblem : null}
          editable={!submitting}
        />
        <View style={styles.payoutRow}>
          <Text style={styles.payoutLabel}>Payout to bank</Text>
          <Text style={styles.payoutValue}>{formatInr(payout)}</Text>
        </View>
        <Button
          title="Sell my full balance"
          variant="secondary"
          small
          onPress={() => setAmount(balance.replace(/(\.\d*?)0+$/, '$1').replace(/\.$/, ''))}
          disabled={submitting}
        />
      </Card>

      <Card>
        <SectionLabel>Receiving bank account</SectionLabel>
        <TextField
          label="Account holder name"
          icon="person-outline"
          value={accountName}
          onChangeText={setAccountName}
          autoCapitalize="words"
          returnKeyType="next"
          onSubmitEditing={() => bankRef.current?.focus()}
          editable={!submitting}
        />
        <TextField
          label="Bank name"
          icon="business-outline"
          value={bankName}
          onChangeText={setBankName}
          placeholder="e.g. HDFC Bank"
          autoCapitalize="words"
          returnKeyType="next"
          inputRef={bankRef}
          onSubmitEditing={() => accountRef.current?.focus()}
          editable={!submitting}
        />
        <TextField
          label="Account number"
          icon="keypad-outline"
          value={accountNumber}
          onChangeText={(t) => setAccountNumber(t.replace(/\D/g, ''))}
          keyboardType="number-pad"
          maxLength={20}
          returnKeyType="next"
          inputRef={accountRef}
          onSubmitEditing={() => ifscRef.current?.focus()}
          editable={!submitting}
        />
        <TextField
          label="IFSC code"
          icon="barcode-outline"
          value={ifsc}
          onChangeText={(t) => setIfsc(t.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 11))}
          placeholder="HDFC0001234"
          autoCapitalize="characters"
          autoCorrect={false}
          returnKeyType="done"
          inputRef={ifscRef}
          editable={!submitting}
        />
      </Card>

      <Button
        title={`Request payout of ${formatInr(payout)}`}
        icon="arrow-down-circle-outline"
        onPress={submit}
        loading={submitting}
        disabled={!rates.enableSelling || frozen}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  rateStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 18,
    backgroundColor: colors.paleBlue,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#CFE0FF',
  },
  rateLabel: { fontSize: 12, fontWeight: '700', color: colors.muted },
  rateValue: { fontSize: 20, fontWeight: '900', color: colors.text, letterSpacing: -0.4, marginTop: 2 },
  settlement: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: colors.surface,
    borderRadius: radius.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  settlementText: { fontSize: 11, fontWeight: '800', color: colors.primary },
  payoutRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  payoutLabel: { fontSize: 13, color: colors.muted, fontWeight: '600' },
  payoutValue: { fontSize: 22, fontWeight: '900', color: colors.success, letterSpacing: -0.4 },
  done: { alignItems: 'center', paddingVertical: 28 },
  successBadge: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.success, alignItems: 'center', justifyContent: 'center' },
  doneTitle: { fontSize: 20, fontWeight: '900', color: colors.text, textAlign: 'center', letterSpacing: -0.3 },
  doneBody: { fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 21 },
  fullWidth: { alignSelf: 'stretch' },
});
