import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, Text, View, type TextInputInstance } from 'react-native';

import { messageOf } from '@/api/client';
import { executeTransfer, getWallet } from '@/api/services';
import type { DestinationApp, DestinationType } from '@/api/types';
import { Banner } from '@/components/Banner';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { SegmentedChoice, type Option } from '@/components/Choices';
import { Screen } from '@/components/Screen';
import { ErrorView, LoadingView } from '@/components/State';
import { TextField } from '@/components/TextField';
import { track } from '@/lib/analytics';
import { formatCoin, sanitizeDecimalInput } from '@/lib/money';
import { useResource } from '@/lib/useResource';
import { validateCoinAmount, validateNote, validateRecipient } from '@/lib/validation';
import { colors } from '@/theme';

const DESTINATIONS: Option<DestinationType>[] = [
  { value: 'INTERNAL_USER', label: 'SIcoinX user', icon: 'person-outline' },
  { value: 'ECOSYSTEM_APP', label: 'Ecosystem app', icon: 'git-network-outline' },
];

const APPS: Option<DestinationApp>[] = [
  { value: 'YOUPEAK', label: 'YouPeak', icon: 'radio-outline' },
  { value: 'YOUPEAK_ECOMMERCE', label: 'YouPeak Shop', icon: 'bag-handle-outline' },
];

export default function TransferScreen() {
  const router = useRouter();
  const wallet = useResource((signal) => getWallet(signal), []);

  const [destinationType, setDestinationType] = useState<DestinationType>('INTERNAL_USER');
  const [destinationApp, setDestinationApp] = useState<DestinationApp>('YOUPEAK');
  const [recipient, setRecipient] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<{ amount: string; reference: string } | null>(null);

  const amountRef = useRef<TextInputInstance>(null);
  const noteRef = useRef<TextInputInstance>(null);

  if (wallet.loading && !wallet.data) return <LoadingView label="Loading wallet…" />;
  if (!wallet.data) return <ErrorView message={wallet.error ?? 'Could not load your wallet.'} onRetry={wallet.reload} />;

  const balance = wallet.data.wallet.coinBalance;
  const frozen = wallet.data.wallet.isFrozen;
  const amountProblem = validateCoinAmount(amount, { available: balance });

  const reset = () => {
    setSent(null);
    setRecipient('');
    setAmount('');
    setNote('');
    wallet.reload();
  };

  if (sent) {
    return (
      <Screen insetBottom>
        <Card style={styles.done}>
          <Text style={styles.doneTitle}>Transfer complete</Text>
          <Text style={styles.doneBody}>
            Sent {sent.amount} SI.{'\n'}Reference {sent.reference}
          </Text>
          <Button title="Make another transfer" variant="secondary" onPress={reset} style={styles.fullWidth} />
          <Button title="Back to wallet" onPress={() => router.back()} style={styles.fullWidth} />
        </Card>
      </Screen>
    );
  }

  const submit = async () => {
    if (submitting) return;
    const problem = validateRecipient(recipient) ?? amountProblem ?? validateNote(note);
    if (problem) {
      setError(problem);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const result = await executeTransfer({
        destinationType,
        destinationApp,
        recipientIdentifier: recipient.trim(),
        coinAmount: amount.trim(),
        note,
      });
      track('coin_transfer', { destination: destinationType === 'ECOSYSTEM_APP' ? destinationApp : 'INTERNAL_USER' });
      setSent({ amount: formatCoin(amount), reference: result.transfer.transferNumber });
    } catch (e) {
      setError(messageOf(e));
    } finally {
      setSubmitting(false);
    }
  };

  const toApp = destinationType === 'ECOSYSTEM_APP';

  return (
    <Screen insetBottom>
      {frozen ? <Banner tone="error" message="Your wallet is frozen. Contact support to make transfers." /> : null}
      {error ? <Banner tone="error" message={error} /> : null}

      <SegmentedChoice options={DESTINATIONS} value={destinationType} onChange={setDestinationType} />
      {toApp ? <SegmentedChoice options={APPS} value={destinationApp} onChange={setDestinationApp} /> : null}

      <Card>
        <TextField
          label={toApp ? 'YouPeak username or email' : 'Recipient email or wallet ID'}
          value={recipient}
          onChangeText={setRecipient}
          placeholder={toApp ? 'user@youpeak.live' : 'name@example.com or SICX-…'}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="next"
          onSubmitEditing={() => amountRef.current?.focus()}
          editable={!submitting}
        />
        <TextField
          label="Amount"
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
          inputRef={amountRef}
          editable={!submitting}
        />
        <TextField
          label="Note (optional)"
          value={note}
          onChangeText={setNote}
          placeholder="e.g. Subscription payment"
          maxLength={200}
          returnKeyType="done"
          inputRef={noteRef}
          editable={!submitting}
        />
      </Card>

      <Button title="Send coins" icon="paper-plane" onPress={submit} loading={submitting} disabled={frozen} />
      <View>
        <Text style={styles.footnote}>Transfers within the ecosystem are final and cannot be reversed.</Text>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  done: { alignItems: 'center', paddingVertical: 28 },
  doneTitle: { fontSize: 18, fontWeight: '900', color: colors.text, textAlign: 'center' },
  doneBody: { fontSize: 13, color: colors.muted, textAlign: 'center', lineHeight: 20 },
  fullWidth: { alignSelf: 'stretch' },
  footnote: { fontSize: 11, color: colors.muted, textAlign: 'center' },
});
