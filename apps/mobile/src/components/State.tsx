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

interface ErrorViewProps {
  message: string;
  onRetry?: () => void;
  title?: string;
}

export function ErrorView({ message, onRetry, title = 'Something went wrong' }: ErrorViewProps) {
  return (
    <View style={styles.center}>
      <Ionicons name="cloud-offline-outline" size={44} color={colors.muted} />
      <Text style={styles.title}>{title}</Text>
      <Text style={[styles.muted, styles.centerText]}>{message}</Text>
      {onRetry ? <Button title="Try again" variant="secondary" icon="refresh" onPress={onRetry} /> : null}
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
      <Ionicons name={icon} size={44} color={colors.muted} />
      <Text style={styles.title}>{title}</Text>
      {message ? <Text style={[styles.muted, styles.centerText]}>{message}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: 10, padding: 32 },
  title: { fontSize: 15, fontWeight: '800', color: colors.text, textAlign: 'center' },
  muted: { fontSize: 13, color: colors.muted },
  centerText: { textAlign: 'center', lineHeight: 19 },
});
