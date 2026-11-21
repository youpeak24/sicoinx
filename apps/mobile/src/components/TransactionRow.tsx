import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Transaction } from '@/api/types';
import { formatDateTime, txTypeLabel } from '@/lib/format';
import { formatCoin, isCredit } from '@/lib/money';
import { chips, colors, radius, shadow, type ChipTone } from '@/theme';

interface TransactionRowProps {
  tx: Transaction;
  onPress?: (tx: Transaction) => void;
}

type IconName = ComponentProps<typeof Ionicons>['name'];

/** Icon and tint by ledger type, so purchases, sales and transfers are recognisable at a glance. */
function visualFor(type: string, credit: boolean): { icon: IconName; tone: ChipTone } {
  switch (type) {
    case 'BUY_COIN':
      return { icon: 'add-circle', tone: 'green' };
    case 'SELL_COIN':
      return { icon: 'business', tone: 'amber' };
    case 'TRANSFER_OUT':
      return { icon: 'paper-plane', tone: 'blue' };
    case 'TRANSFER_IN':
      return { icon: 'arrow-down-circle', tone: 'green' };
    case 'ECOSYSTEM_DEBIT':
    case 'ECOSYSTEM_CREDIT':
      return { icon: 'git-network', tone: 'violet' };
    case 'REFUND':
      return { icon: 'return-down-back', tone: 'sky' };
    default:
      return credit ? { icon: 'arrow-down', tone: 'green' } : { icon: 'arrow-up', tone: 'blue' };
  }
}

export function TransactionRow({ tx, onPress }: TransactionRowProps) {
  const credit = isCredit(tx.coinAmount);
  const amount = `${formatCoin(tx.coinAmount, true)} SI`;
  const visual = visualFor(tx.type, credit);
  const tint = chips[visual.tone];

  return (
    <Pressable
      onPress={onPress ? () => onPress(tx) : undefined}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${txTypeLabel(tx.type)}, ${amount}`}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={[styles.icon, { backgroundColor: tint.bg }]}>
        <Ionicons name={visual.icon} size={20} color={tint.fg} />
      </View>
      <View style={styles.middle}>
        <Text style={styles.description} numberOfLines={1}>
          {tx.description || txTypeLabel(tx.type)}
        </Text>
        <Text style={styles.meta} numberOfLines={1}>
          {txTypeLabel(tx.type)} · {formatDateTime(tx.createdAt)}
        </Text>
      </View>
      <Text style={[styles.amount, credit && styles.amountCredit]}>{amount}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#EEF2FA',
    ...shadow.soft,
  },
  pressed: { opacity: 0.85 },
  icon: { width: 42, height: 42, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  middle: { flex: 1, gap: 3 },
  description: { fontSize: 14, fontWeight: '700', color: colors.text },
  meta: { fontSize: 12, color: colors.muted },
  amount: { fontSize: 14, fontWeight: '800', color: colors.text },
  amountCredit: { color: colors.success },
});
