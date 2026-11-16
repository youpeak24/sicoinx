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
              <Ionicons name={opt.icon} size={20} color={selected ? colors.primary : colors.muted} />
            ) : null}
            <Text style={[styles.rowLabel, selected && styles.rowLabelSelected]}>{opt.label}</Text>
            {selected ? <Ionicons name="checkmark-circle" size={20} color={colors.primary} /> : null}
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

const styles = StyleSheet.create({
  list: { gap: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 14,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  rowSelected: { borderColor: colors.primary, backgroundColor: colors.paleBlue },
  rowLabel: { flex: 1, fontSize: 13, fontWeight: '700', color: colors.text },
  rowLabelSelected: { color: colors.primary },
  segments: { flexDirection: 'row', gap: 10 },
  segment: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 12,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  segmentSelected: { borderColor: colors.primary, backgroundColor: colors.paleBlue },
  segmentLabel: { fontSize: 12, fontWeight: '700', color: colors.text },
  segmentLabelSelected: { color: colors.primary },
  pills: { paddingHorizontal: 16, paddingVertical: 12, gap: 8 },
  pill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  pillSelected: { backgroundColor: colors.primary, borderColor: colors.primary },
  pillLabel: { fontSize: 12, fontWeight: '700', color: colors.muted },
  pillLabelSelected: { color: colors.white },
});
