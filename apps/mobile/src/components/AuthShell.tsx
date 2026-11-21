import type { PropsWithChildren, ReactNode } from 'react';
import { KeyboardAvoidingView, Platform, ScrollView, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radius } from '@/theme';
import { Backdrop } from './Backdrop';
import { BrandMark } from './Brand';

interface AuthShellProps {
  title: string;
  subtitle: string;
  /** Shown under the form card (links such as "Create an account"). */
  footer?: ReactNode;
}

/**
 * Shared layout for the signed-out screens: a deep-blue hero with the logo and a title, and a white sheet that holds
 * the form and overlaps the hero.
 */
export function AuthShell({ title, subtitle, footer, children }: PropsWithChildren<AuthShellProps>) {
  const insets = useSafeAreaInsets();

  return (
    <KeyboardAvoidingView style={styles.fill} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        style={styles.fill}
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
        keyboardDismissMode={Platform.OS === 'ios' ? 'interactive' : 'on-drag'}
        showsVerticalScrollIndicator={false}
      >
        <View style={[styles.hero, { paddingTop: insets.top + 28 }]}>
          <Backdrop />
          <View style={styles.logoWrap}>
            <BrandMark size={44} />
          </View>
          <Text style={styles.title} accessibilityRole="header">
            {title}
          </Text>
          <Text style={styles.subtitle}>{subtitle}</Text>
        </View>

        <View style={[styles.sheet, { paddingBottom: 28 + insets.bottom }]}>
          {children}
          {footer ? <View style={styles.footer}>{footer}</View> : null}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.navy },
  scroll: { flexGrow: 1 },
  hero: {
    backgroundColor: colors.navy,
    paddingHorizontal: 24,
    paddingBottom: 56,
    alignItems: 'flex-start',
    gap: 8,
    overflow: 'hidden',
  },
  logoWrap: {
    width: 68,
    height: 68,
    borderRadius: 22,
    backgroundColor: colors.white,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    boxShadow: '0px 10px 24px rgba(0, 0, 0, 0.25)',
  },
  title: { fontSize: 30, fontWeight: '800', color: colors.white, letterSpacing: -0.6 },
  subtitle: { fontSize: 14, color: 'rgba(255,255,255,0.78)', lineHeight: 20 },
  sheet: {
    flexGrow: 1,
    marginTop: -28,
    backgroundColor: colors.canvas,
    borderTopLeftRadius: radius.xl + 4,
    borderTopRightRadius: radius.xl + 4,
    paddingHorizontal: 20,
    paddingTop: 24,
    gap: 16,
  },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', flexWrap: 'wrap', marginTop: 4 },
});
