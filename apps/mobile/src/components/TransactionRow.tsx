import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import type { Transaction } from '@/api/types';
import { formatDateTime, txTypeLabel } from '@/lib/format';
import { formatCoin, isCredit } from '@/lib/money';
import { colors, radius } from '@/theme';

interface TransactionRowProps {
  tx: Transaction;
  onPress?: (tx: Transaction) => void;
}

export function TransactionRow({ tx, onPress }: TransactionRowProps) {
  const credit = isCredit(tx.coinAmount);
  const amount = `${formatCoin(tx.coinAmount, true)} SI`;

  return (
    <Pressable
      onPress={onPress ? () => onPress(tx) : undefined}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={`${txTypeLabel(tx.type)}, ${amount}`}
      style={({ pressed }) => [styles.row, pressed && styles.pressed]}
    >
      <View style={[styles.icon, { backgroundColor: credit ? colors.successBg : colors.paleBlue }]}>
        <Ionicons
          name={credit ? 'arrow-down' : 'arrow-up'}
          size={16}
          color={credit ? colors.success : colors.primary}
        />
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
    borderColor: colors.border,
  },
  pressed: { opacity: 0.85 },
  icon: { width: 34, height: 34, borderRadius: radius.sm, alignItems: 'center', justifyContent: 'center' },
  middle: { flex: 1, gap: 2 },
  description: { fontSize: 13, fontWeight: '700', color: colors.text },
  meta: { fontSize: 11, color: colors.muted },
  amount: { fontSize: 13, fontWeight: '800', color: colors.text },
  amountCredit: { color: colors.success },
});
