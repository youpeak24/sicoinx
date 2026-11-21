import { Ionicons } from '@expo/vector-icons';
import type { ComponentProps } from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { colors, radius, shadow } from '@/theme';
import { Button } from './Button';

interface ConfirmDialogProps {
  visible: boolean;
  title: string;
  message: string;
  confirmLabel: string;
  cancelLabel?: string;
  /** Styles the confirm button as a destructive action (e.g. sign out). */
  destructive?: boolean;
  icon?: ComponentProps<typeof Ionicons>['name'];
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

/**
 * Cross-platform confirmation dialog. React Native's Alert.alert only shows its buttons on Android and iOS; on the
 * web preview its callbacks never fire, which made "Sign out" silently do nothing there. This modal works everywhere.
 */
export function ConfirmDialog({
  visible,
  title,
  message,
  confirmLabel,
  cancelLabel = 'Cancel',
  destructive = false,
  icon = 'help-circle-outline',
  loading = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={loading ? undefined : onCancel}
    >
      <View style={styles.center}>
        <Pressable style={styles.backdrop} onPress={loading ? undefined : onCancel} accessibilityLabel="Dismiss" />
        <View style={styles.dialog} accessibilityRole="alert">
          <View style={[styles.iconWrap, destructive && styles.iconWrapDanger]}>
            <Ionicons name={icon} size={26} color={destructive ? colors.danger : colors.primary} />
          </View>
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.message}>{message}</Text>
          <View style={styles.actions}>
            <Button title={cancelLabel} variant="outline" onPress={onCancel} disabled={loading} style={styles.action} />
            <Button
              title={confirmLabel}
              variant={destructive ? 'danger' : 'primary'}
              onPress={onConfirm}
              loading={loading}
              style={styles.action}
            />
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24 },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: colors.overlay },
  dialog: {
    width: '100%',
    maxWidth: 380,
    backgroundColor: colors.surface,
    borderRadius: radius.xl,
    padding: 22,
    alignItems: 'center',
    gap: 8,
    ...shadow.raised,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.paleBlue,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  iconWrapDanger: { backgroundColor: colors.dangerBg },
  title: { fontSize: 18, fontWeight: '800', color: colors.text, textAlign: 'center', letterSpacing: -0.2 },
  message: { fontSize: 14, color: colors.muted, textAlign: 'center', lineHeight: 21, marginBottom: 10 },
  actions: { flexDirection: 'row', gap: 10, alignSelf: 'stretch' },
  action: { flex: 1 },
});
