import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useSession } from '@/auth/session';
import { firstNameOf, greetingFor } from '@/lib/profile';
import { colors, shadow } from '@/theme';
import { Avatar } from './Avatar';

/** Title bar for the main tabs (Activity, Verification, Support, Account). */
export function PageHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  const insets = useSafeAreaInsets();
  return (
    <View style={[styles.page, { paddingTop: insets.top + 14 }]}>
      <Text style={styles.pageTitle} accessibilityRole="header">
        {title}
      </Text>
      {subtitle ? <Text style={styles.pageSubtitle}>{subtitle}</Text> : null}
    </View>
  );
}

/** Greeting row for the wallet home: avatar (opens Account), name, and the notifications bell. */
export function HomeHeader({ unread = 0 }: { unread?: number }) {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, identity } = useSession();
  const name = user?.name || identity?.displayName || identity?.email || '';

  return (
    <View style={[styles.home, { paddingTop: insets.top + 12 }]}>
      <Pressable
        onPress={() => router.navigate('/account')}
        accessibilityRole="button"
        accessibilityLabel="Open your account"
        style={styles.homeWho}
        hitSlop={6}
      >
        <Avatar name={name} size={46} />
        <View style={styles.homeText}>
          <Text style={styles.greeting}>{greetingFor(new Date().getHours())}</Text>
          <Text style={styles.homeName} numberOfLines={1}>
            {firstNameOf(name)}
          </Text>
        </View>
      </Pressable>

      <Pressable
        onPress={() => router.push('/notifications')}
        accessibilityRole="button"
        accessibilityLabel={unread > 0 ? `Notifications, ${unread} unread` : 'Notifications'}
        style={({ pressed }) => [styles.bell, pressed && styles.bellPressed]}
      >
        <Ionicons name="notifications-outline" size={22} color={colors.text} />
        {unread > 0 ? (
          <View style={styles.badge}>
            <Text style={styles.badgeText}>{unread > 9 ? '9+' : unread}</Text>
          </View>
        ) : null}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  page: { paddingHorizontal: 20, paddingBottom: 6, backgroundColor: colors.canvas, gap: 2 },
  pageTitle: { fontSize: 28, fontWeight: '800', color: colors.text, letterSpacing: -0.7 },
  pageSubtitle: { fontSize: 13, color: colors.muted },
  home: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 20, paddingBottom: 6 },
  homeWho: { flexDirection: 'row', alignItems: 'center', gap: 12, flexShrink: 1 },
  homeText: { flexShrink: 1, gap: 1 },
  greeting: { fontSize: 12, color: colors.muted, fontWeight: '600' },
  homeName: { fontSize: 19, fontWeight: '800', color: colors.text, letterSpacing: -0.3 },
  bell: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: colors.surface,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadow.soft,
  },
  bellPressed: { opacity: 0.8 },
  badge: {
    position: 'absolute',
    top: 4,
    right: 3,
    minWidth: 18,
    height: 18,
    paddingHorizontal: 4,
    borderRadius: 9,
    backgroundColor: colors.danger,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: colors.surface,
  },
  badgeText: { color: colors.white, fontSize: 9, fontWeight: '800' },
});
