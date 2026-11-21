import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps, PropsWithChildren } from 'react';
import { Pressable, StyleSheet, Text, View, type StyleProp, type ViewStyle } from 'react-native';

import { chips, colors, radius, shadow, type ChipTone } from '@/theme';

export function Card({ children, style }: PropsWithChildren<{ style?: StyleProp<ViewStyle> }>) {
  return <View style={[styles.card, style]}>{children}</View>;
}

export function SectionLabel({ children }: PropsWithChildren) {
  return <Text style={styles.sectionLabel}>{children}</Text>;
}

interface SectionHeaderProps {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function SectionHeader({ title, actionLabel, onAction }: SectionHeaderProps) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle} accessibilityRole="header">
        {title}
      </Text>
      {actionLabel && onAction ? (
        <Pressable onPress={onAction} hitSlop={10} accessibilityRole="link" accessibilityLabel={actionLabel}>
          <Text style={styles.sectionAction}>{actionLabel}</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

/** Rounded square with an icon, tinted by tone. */
export function IconChip({
  name,
  tone = 'blue',
  size = 40,
}: {
  name: ComponentProps<typeof Ionicons>['name'];
  tone?: ChipTone;
  size?: number;
}) {
  const t = chips[tone];
  return (
    <View style={[styles.chip, { width: size, height: size, borderRadius: size * 0.34, backgroundColor: t.bg }]}>
      <Ionicons name={name} size={size * 0.5} color={t.fg} />
    </View>
  );
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
  neutral: { bg: '#EDF1F8', fg: colors.muted },
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
    borderColor: '#EEF2FA',
    padding: 18,
    gap: 14,
    ...shadow.card,
  },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: colors.muted, letterSpacing: 0.7, textTransform: 'uppercase' },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  sectionTitle: { fontSize: 16, fontWeight: '800', color: colors.text, letterSpacing: -0.2 },
  sectionAction: { fontSize: 13, fontWeight: '700', color: colors.primary },
  chip: { alignItems: 'center', justifyContent: 'center' },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, paddingVertical: 6 },
  rowLabel: { fontSize: 13, color: colors.muted },
  rowValue: { flexShrink: 1, fontSize: 13, fontWeight: '600', color: colors.text, textAlign: 'right' },
  rowValueBold: { fontWeight: '800' },
  pill: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.pill },
  pillText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.4 },
});
