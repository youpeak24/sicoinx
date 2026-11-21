import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps, PropsWithChildren, ReactNode } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { chips, colors, radius, shadow, type ChipTone } from '@/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

interface ListRowProps {
  icon: IconName;
  tone?: ChipTone;
  title: string;
  subtitle?: string;
  /** Right-aligned content such as a Pill or a value. Replaces the chevron when `onPress` is absent. */
  right?: ReactNode;
  onPress?: () => void;
  destructive?: boolean;
  /** Last row in a group hides its divider. */
  last?: boolean;
  testID?: string;
}

/** One tappable row of a settings-style list. */
export function ListRow({
  icon,
  tone = 'blue',
  title,
  subtitle,
  right,
  onPress,
  destructive = false,
  last = false,
  testID,
}: ListRowProps) {
  const t = destructive ? chips.rose : chips[tone];
  return (
    <Pressable
      testID={testID}
      onPress={onPress}
      disabled={!onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={subtitle ? `${title}, ${subtitle}` : title}
      style={({ pressed }) => [styles.row, !last && styles.divider, pressed && styles.pressed]}
    >
      <View style={[styles.icon, { backgroundColor: t.bg }]}>
        <Ionicons name={icon} size={20} color={t.fg} />
      </View>
      <View style={styles.text}>
        <Text style={[styles.title, destructive && styles.titleDanger]}>{title}</Text>
        {subtitle ? (
          <Text style={styles.subtitle} numberOfLines={2}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {right}
      {onPress && !destructive ? <Ionicons name="chevron-forward" size={18} color={colors.faint} /> : null}
    </Pressable>
  );
}

/** Rounded card that groups ListRows under an optional heading. */
export function ListGroup({ title, children }: PropsWithChildren<{ title?: string }>) {
  return (
    <View style={styles.group}>
      {title ? <Text style={styles.groupTitle}>{title}</Text> : null}
      <View style={styles.groupBody}>{children}</View>
    </View>
  );
}

const styles = StyleSheet.create({
  group: { gap: 8 },
  groupTitle: { fontSize: 12, fontWeight: '700', color: colors.muted, letterSpacing: 0.7, textTransform: 'uppercase', paddingHorizontal: 4 },
  groupBody: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#EEF2FA',
    overflow: 'hidden',
    ...shadow.soft,
  },
  row: { flexDirection: 'row', alignItems: 'center', gap: 14, paddingHorizontal: 16, paddingVertical: 14 },
  divider: { borderBottomWidth: 1, borderBottomColor: '#EEF2FA' },
  pressed: { backgroundColor: colors.tint },
  icon: { width: 40, height: 40, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: 2 },
  title: { fontSize: 15, fontWeight: '700', color: colors.text },
  titleDanger: { color: colors.danger },
  subtitle: { fontSize: 12, color: colors.muted, lineHeight: 17 },
});
