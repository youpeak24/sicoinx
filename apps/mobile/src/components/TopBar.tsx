import { Ionicons } from '@expo/vector-icons';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSession } from '@/auth/session';
import { colors } from '@/theme';
import { BrandLockup } from './Brand';

/** App header for the main tabs: brand on the left, sign-out on the right. */
export function TopBar() {
  const insets = useSafeAreaInsets();
  const { signOut } = useSession();

  const confirmSignOut = () => {
    Alert.alert('Sign out', 'Do you want to sign out of SIcoinX on this device?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Sign out', style: 'destructive', onPress: () => void signOut() },
    ]);
  };

  return (
    <View style={[styles.bar, { paddingTop: insets.top + 8 }]}>
      <BrandLockup />
      <Pressable
        onPress={confirmSignOut}
        hitSlop={12}
        accessibilityRole="button"
        accessibilityLabel="Sign out"
      >
        <Ionicons name="log-out-outline" size={24} color={colors.muted} />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingBottom: 10,
    backgroundColor: colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
});
