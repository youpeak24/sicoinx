import type { PropsWithChildren } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  type StyleProp,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors } from '@/theme';

interface ScreenProps {
  refreshing?: boolean;
  onRefresh?: () => void;
  /** Add the bottom safe-area inset (screens without a tab bar). */
  insetBottom?: boolean;
  /** Add the top safe-area inset (screens without a header). */
  insetTop?: boolean;
  /** Drop the default horizontal padding (screens that draw full-bleed sections). */
  flush?: boolean;
  background?: string;
  contentStyle?: StyleProp<ViewStyle>;
}

/** Scrollable, keyboard-aware screen body with optional pull-to-refresh. */
export function Screen({
  children,
  refreshing = false,
  onRefresh,
  insetBottom = false,
  insetTop = false,
  flush = false,
  background = colors.canvas,
  contentStyle,
}: PropsWithChildren<ScreenProps>) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView
      style={[styles.fill, { backgroundColor: background }]}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={0}
    >
      <ScrollView
        style={[styles.fill, { backgroundColor: background }]}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[
          styles.content,
          flush && styles.flush,
          { paddingTop: 16 + (insetTop ? insets.top : 0), paddingBottom: 28 + (insetBottom ? insets.bottom : 0) },
          contentStyle,
        ]}
        refreshControl={
          onRefresh ? (
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={colors.primary} colors={[colors.primary]} />
          ) : undefined
        }
      >
        {children}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1 },
  content: { paddingHorizontal: 20, gap: 16 },
  flush: { paddingHorizontal: 0 },
});
