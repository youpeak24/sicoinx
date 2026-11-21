import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ComponentProps } from 'react';
import type { ColorValue } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { PageHeader } from '@/components/Headers';
import { colors } from '@/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

/** Outline icon when idle, filled icon when the tab is active. */
function tabIcon(idle: IconName, active: IconName) {
  function TabIcon({ color, size, focused }: { color: ColorValue; size: number; focused: boolean }) {
    return <Ionicons name={focused ? active : idle} size={size} color={color as string} />;
  }
  return TabIcon;
}

export default function TabsLayout() {
  const insets = useSafeAreaInsets();
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.faint,
        // An explicit line height: React Navigation's default label box is shorter than an 11px font and clips it.
        tabBarLabelStyle: { fontSize: 11, lineHeight: 14, fontWeight: '700' },
        // Explicit height (icon + label + padding) plus the device's bottom inset, so labels are never clipped.
        tabBarStyle: {
          height: 64 + insets.bottom,
          paddingTop: 8,
          paddingBottom: Math.max(insets.bottom, 8),
          backgroundColor: colors.surface,
          borderTopWidth: 0,
          boxShadow: '0px -6px 22px rgba(14, 27, 61, 0.08)',
        },
        sceneStyle: { backgroundColor: colors.canvas },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{ title: 'Wallet', headerShown: false, tabBarIcon: tabIcon('wallet-outline', 'wallet') }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: 'Activity',
          header: () => <PageHeader title="Activity" subtitle="Your purchases, sales and transfers" />,
          tabBarIcon: tabIcon('receipt-outline', 'receipt'),
        }}
      />
      <Tabs.Screen
        name="kyc"
        options={{
          title: 'Verify',
          header: () => <PageHeader title="Verification" subtitle="Confirm your identity to unlock payouts" />,
          tabBarIcon: tabIcon('shield-checkmark-outline', 'shield-checkmark'),
        }}
      />
      <Tabs.Screen
        name="support"
        options={{
          title: 'Support',
          header: () => <PageHeader title="Support" subtitle="We're here to help" />,
          tabBarIcon: tabIcon('headset-outline', 'headset'),
        }}
      />
      <Tabs.Screen
        name="account"
        options={{
          title: 'Account',
          header: () => <PageHeader title="Account" />,
          tabBarIcon: tabIcon('person-circle-outline', 'person-circle'),
        }}
      />
    </Tabs>
  );
}
