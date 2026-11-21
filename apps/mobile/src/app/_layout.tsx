import { SplashScreen, Stack, useSegments } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { StyleSheet, View } from 'react-native';

import { SessionProvider, useSession } from '@/auth/session';
import { Button } from '@/components/Button';
import { ErrorView } from '@/components/State';
import { trackScreen } from '@/lib/analytics';
import { colors } from '@/theme';

// Keep the splash screen up until the saved session has been restored.
void SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  return (
    <SessionProvider>
      <StatusBar style="dark" />
      <SplashGate />
      <ScreenTracker />
      <RootNavigator />
    </SessionProvider>
  );
}

function SplashGate() {
  const { status } = useSession();
  useEffect(() => {
    if (status !== 'loading') SplashScreen.hide();
  }, [status]);
  return null;
}

/** Logs a screen_view per route. Uses the route template, so ids such as ticket/[id] never reach analytics. */
function ScreenTracker() {
  const segments = useSegments();
  // Drop route-group segments such as "(app)" and "(tabs)".
  const screen = (segments as string[]).filter((s) => !/^\(.*\)$/.test(s)).join('/') || 'wallet';
  useEffect(() => {
    trackScreen(screen);
  }, [screen]);
  return null;
}

function RootNavigator() {
  const { status, retry, signOut } = useSession();
  const signedIn = status === 'signedIn';
  const unverified = status === 'unverified';
  const signedOut = !signedIn && !unverified;

  return (
    <>
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.canvas } }}>
        <Stack.Protected guard={signedIn}>
          <Stack.Screen name="(app)" />
        </Stack.Protected>
        <Stack.Protected guard={unverified}>
          <Stack.Screen name="verify-email" />
        </Stack.Protected>
        <Stack.Protected guard={signedOut}>
          <Stack.Screen name="sign-in" />
          <Stack.Screen name="register" />
          <Stack.Screen name="forgot-password" />
        </Stack.Protected>
      </Stack>

      {status === 'unreachable' ? (
        <View style={styles.overlay}>
          <ErrorView
            title="Can't reach SIcoinX"
            message="We couldn't verify your saved session because the server is unreachable. Check your connection and try again."
            onRetry={retry}
          />
          <View style={styles.overlayAction}>
            <Button title="Sign out" variant="outline" onPress={() => void signOut()} />
          </View>
        </View>
      ) : null}
    </>
  );
}

const styles = StyleSheet.create({
  overlay: { ...StyleSheet.absoluteFill, backgroundColor: colors.canvas, justifyContent: 'center' },
  overlayAction: { position: 'absolute', left: 32, right: 32, bottom: 48 },
});
