import type { PropsWithChildren } from 'react';
import { StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { colors, radius } from '@/theme';

export function Card({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionLabel({ children }: PropsWithChildren) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

interface KeyValueRowProps {
  label: string;
  value: string;
  bold?: boolean;
  selectable?: boolean;
}

export function KeyValueRow({ label, value, bold = false, selectable = false }: KeyValueRowProps) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text selectable={selectable} style={[styles.rowValue, bold && styles.rowValueBold]}>
        {value}
      </Text>
    </View>
  );
}

type PillTone = 'neutral' | 'success' | 'warning' | 'danger' | 'info';

const pillTones: Record<PillTone, { bg: string; fg: string }> = {
  neutral: { bg: '#F1F5F9', fg: colors.muted },
  success: { bg: colors.successBg, fg: colors.success },
  warning: { bg: colors.warningBg, fg: colors.warning },
  danger: { bg: colors.dangerBg, fg: colors.danger },
  info: { bg: colors.paleBlue, fg: colors.primary },
};

export function Pill({ label, tone = 'neutral' }: { label: string; tone?: PillTone }) {
  const t = pillTones[tone];
  return (
    <View style={[styles.pill, { backgroundColor: t.bg }]}>
      <Text style={[styles.pillText, { color: t.fg }]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 18,
    gap: 14,
  },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: colors.muted, letterSpacing: 0.6, textTransform: 'uppercase' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, paddingVertical: 4 },
  rowLabel: { fontSize: 12, color: colors.muted },
  rowValue: { flexShrink: 1, fontSize: 13, fontWeight: '600', color: colors.text, textAlign: 'right' },
  rowValueBold: { fontWeight: '800' },
  pill: { alignSelf: 'flex-start', paddingHorizontal: 9, paddingVertical: 3, borderRadius: 999 },
  pillText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.3 },
});
