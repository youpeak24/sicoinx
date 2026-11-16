import { Stack } from 'expo-router';

import { colors } from '@/theme';

export default function AppLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.primary,
        headerTitleStyle: { color: colors.text, fontWeight: '800', fontSize: 16 },
        headerShadowVisible: false,
        headerBackButtonDisplayMode: 'minimal',
        contentStyle: { backgroundColor: colors.canvas },
      }}
    >
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      <Stack.Screen name="buy" options={{ title: 'Buy SIcoinX' }} />
      <Stack.Screen name="sell" options={{ title: 'Sell & Bank Cashout' }} />
      <Stack.Screen name="transfer" options={{ title: 'Ecosystem Transfer' }} />
      <Stack.Screen name="ticket/[id]" options={{ title: 'Support Ticket' }} />
    </Stack>
  );
}
