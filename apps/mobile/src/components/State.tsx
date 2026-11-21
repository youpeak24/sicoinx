import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme';
import { Button } from './Button';

export function LoadingView({ label = 'Loading…' }: { label?: string }) {
  return (
    <View style={styles.center} accessibilityLabel={label} accessibilityLiveRegion="polite">
      <ActivityIndicator size="large" color={colors.primary} />
      <Text style={styles.muted}>{label}</Text>
    </View>
  );
}

function IconBubble({ name, tone }: { name: ComponentProps<typeof Ionicons>['name']; tone: 'neutral' | 'danger' }) {
  return (
    <View style={[styles.bubble, tone === 'danger' && styles.bubbleDanger]}>
      <Ionicons name={name} size={30} color={tone === 'danger' ? colors.danger : colors.primary} />
    </View>
  );
}

interface ErrorViewProps {
  message: string;
  onRetry?: () => void;
  title?: string;
}

export function ErrorView({ message, onRetry, title = 'Something went wrong' }: ErrorViewProps) {
  return (
    <View style={styles.center}>
      <IconBubble name="cloud-offline-outline" tone="danger" />
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.muted, styles.centerText]}>{message}</Text>
      {onRetry ? <Button title="Try again" variant="secondary" icon="refresh" onPress={onRetry} small /> : null}
    </View>
  );
}

interface EmptyViewProps {
  icon: ComponentProps<typeof Ionicons>['name'];
  title: string;
  message?: string;
}

export function EmptyView({ icon, title, message }: EmptyViewProps) {
  return (
    <View style={styles.center}>
      <IconBubble name={icon} tone="neutral" />
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={[styles.muted, styles.centerText]}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 12, padding: 32 },
  bubble: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.paleBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  bubbleDanger: { backgroundColor: colors.dangerBg },
  title: { fontSize: 17, fontWeight: '800', color: colors.text, textAlign: 'center', letterSpacing: -0.2 },
  muted: { fontSize: 13, color: colors.muted },
  centerText: { textAlign: 'center', lineHeight: 20 },
});
