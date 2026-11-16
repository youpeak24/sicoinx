import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import type { ColorValue } from 'react-native';
import type { ComponentProps } from 'react';

import { TopBar } from '@/components/TopBar';
import { colors } from '@/theme';

type IconName = ComponentProps<typeof Ionicons>['name'];

function tabIcon(name: IconName) {
  function TabIcon({ color, size }: { color: ColorValue; size: number }) {
    return <Ionicons name={name} size={size} color={color as string} />;
  }
  return TabIcon;
}

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        header: () => <TopBar />,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontSize: 11, fontWeight: '600' },
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border },
        sceneStyle: { backgroundColor: colors.canvas },
      }}
    >
      <Tabs.Screen name="index" options={{ title: 'Wallet', tabBarIcon: tabIcon('wallet-outline') }} />
      <Tabs.Screen name="history" options={{ title: 'History', tabBarIcon: tabIcon('receipt-outline') }} />
      <Tabs.Screen name="kyc" options={{ title: 'KYC', tabBarIcon: tabIcon('shield-checkmark-outline') }} />
      <Tabs.Screen name="support" options={{ title: 'Support', tabBarIcon: tabIcon('headset-outline') }} />
    </Tabs>
  );
}
