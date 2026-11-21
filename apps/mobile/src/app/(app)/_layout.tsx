import { Stack } from 'expo-router';

import { colors } from '@/theme';

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.canvas },
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.text, fontWeight: '800', fontSize: 17 },
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: colors.canvas },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="buy" options={{ title: 'Buy SIcoinX' }} />
      <Stack.Screen name="sell" options={{ title: 'Sell & Bank Cashout' }} />
      <Stack.Screen name="transfer" options={{ title: 'Send Coins' }} />
      <Stack.Screen name="ticket/[id]" options={{ title: 'Support Ticket' }} />
      <Stack.Screen name="edit-profile" options={{ title: 'Edit Profile' }} />
      <Stack.Screen name="change-password" options={{ title: 'Change Password' }} />
      <Stack.Screen name="notifications" options={{ title: 'Notifications' }} />
      <Stack.Screen name="about" options={{ title: 'About SIcoinX' }} />
    </Stack>
  );
}
