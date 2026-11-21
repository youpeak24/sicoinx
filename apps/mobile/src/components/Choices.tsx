import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '@/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

export interface Option<T extends string> {
  value: T;
  label: string;
  icon?: IconName;
}

interface ChoiceListProps<T extends string> {
  options: Option<T>[];
  value: T;
  onChange: (value: T) => void;
}

/** Vertical list of selectable rows (payment methods, ID types…). */
export function ChoiceList<T extends string>({ options, value, onChange }: ChoiceListProps<T>) {
  return (
    <View style={styles.list} accessibilityRole="radiogroup">
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            style={[styles.row, selected && styles.rowSelected]}
          >
            {opt.icon ? (
              <View style={[styles.rowIcon, selected && styles.rowIconSelected]}>
                <Ionicons name={opt.icon} size={18} color={selected ? colors.white : colors.muted} />
              </View>
            ) : null}
            <Text style={[styles.rowLabel, selected && styles.rowLabelSelected]}>{opt.label}</Text>
            <View style={[styles.radio, selected && styles.radioSelected]}>
              {selected ? <View style={styles.radioDot} /> : null}
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Two or more equal-width segments (INTERNAL_USER / ECOSYSTEM_APP…). */
export function SegmentedChoice<T extends string>({ options, value, onChange }: ChoiceListProps<T>) {
  return (
    <View style={styles.segments} accessibilityRole="radiogroup">
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            accessibilityRole="radio"
            accessibilityState={{ selected }}
            style={[styles.segment, selected && styles.segmentSelected]}
          >
            {opt.icon ? (
              <Ionicons name={opt.icon} size={16} color={selected ? colors.primary : colors.muted} />
            ) : null}
            <Text style={[styles.segmentLabel, selected && styles.segmentLabelSelected]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

/** Horizontally scrolling filter pills. */
export function FilterPills<T extends string>({ options, value, onChange }: ChoiceListProps<T>) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.pills}
      keyboardShouldPersistTaps="handled"
    >
      {options.map((opt) => {
        const selected = opt.value === value;
        return (
          <Pressable
            key={opt.value}
            onPress={() => onChange(opt.value)}
            accessibilityRole="button"
            accessibilityState={{ selected }}
            style={[styles.pill, selected && styles.pillSelected]}
          >
            <Text style={[styles.pillLabel, selected && styles.pillLabelSelected]}>{opt.label}</Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

/** Small tappable amount shortcuts (e.g. 100 / 500 / 1000). */
export function QuickAmounts({
  amounts,
  onPick,
  suffix = 'SI',
}: {
  amounts: string[];
  onPick: (amount: string) => void;
  suffix?: string;
}) {
  return (
    <View style={styles.quick}>
      {amounts.map((a) => (
        <Pressable
          key={a}
          onPress={() => onPick(a)}
          accessibilityRole="button"
          accessibilityLabel={`${a} ${suffix}`}
          style={({ pressed }) => [styles.quickChip, pressed && styles.quickChipPressed]}
        >
          <Text style={styles.quickText}>
            {a} {suffix}
          </Text>
        </Pressable>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  list: { gap: 10 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  rowSelected: { borderColor: colors.primary, backgroundColor: colors.paleBlue },
  rowIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: colors.tint,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rowIconSelected: { backgroundColor: colors.primary },
  rowLabel: { flex: 1, fontSize: 14, fontWeight: '700', color: colors.text },
  rowLabelSelected: { color: colors.primaryDeep },
  radio: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioSelected: { borderColor: colors.primary },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: colors.primary },
  segments: {
    flexDirection: 'row',
    gap: 6,
    padding: 5,
    backgroundColor: '#E9EFFB',
    borderRadius: radius.md + 2,
  },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 11,
    borderRadius: radius.md,
  },
  segmentSelected: { backgroundColor: colors.surface, boxShadow: '0px 2px 8px rgba(14, 27, 61, 0.1)' },
  segmentLabel: { fontSize: 13, fontWeight: '700', color: colors.muted },
  segmentLabelSelected: { color: colors.primary },
  pills: { paddingHorizontal: 20, paddingVertical: 12, gap: 8 },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: radius.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pillSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillLabel: { fontSize: 13, fontWeight: '700', color: colors.muted },
  pillLabelSelected: { color: colors.white },
  quick: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  quickChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.pill,
    backgroundColor: colors.paleBlue,
  },
  quickChipPressed: { opacity: 0.7 },
  quickText: { fontSize: 13, fontWeight: '700', color: colors.primary },
});
