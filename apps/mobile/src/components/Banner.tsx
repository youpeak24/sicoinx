import { Ionicons } from '@expo/vector-icons';
import { StyleSheet, Text, View } from 'react-native';

import { colors, radius } from '@/theme';

type Tone = 'error' | 'success' | 'warning' | 'info';

const tones: Record<Tone, { bg: string; border: string; fg: string; icon: 'alert-circle' | 'checkmark-circle' | 'warning' | 'information-circle' }> = {
  error: { bg: colors.dangerBg, border: colors.dangerBorder, fg: colors.danger, icon: 'alert-circle' },
  success: { bg: colors.successBg, border: colors.successBorder, fg: colors.success, icon: 'checkmark-circle' },
  warning: { bg: colors.warningBg, border: colors.warningBorder, fg: colors.warning, icon: 'warning' },
  info: { bg: colors.paleBlue, border: colors.border, fg: colors.primaryDeep, icon: 'information-circle' },
};

interface BannerProps {
  tone: Tone;
  title?: string;
  message: string;
}

export function Banner({ tone, title, message }: BannerProps) {
  const t = tones[tone];
  return (
    <View
      style={[styles.box, { backgroundColor: t.bg, borderColor: t.border }]}
      accessibilityRole={tone === 'error' ? 'alert' : undefined}
      accessibilityLiveRegion="polite"
    >
      <Ionicons name={t.icon} size={20} color={t.fg} style={styles.icon} />
      <View style={styles.text}>
        {title ? <Text style={[styles.title, { color: t.fg }]}>{title}</Text> : null}
        <Text style={[styles.message, { color: t.fg }]}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flexDirection: 'row', gap: 10, padding: 12, borderRadius: radius.md, borderWidth: 1 },
  icon: { marginTop: 1 },
  text: { flex: 1, gap: 2 },
  title: { fontSize: 13, fontWeight: '800' },
  message: { fontSize: 13, lineHeight: 18 },
});
