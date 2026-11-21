import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { messageOf } from '@/api/client';
import { resendVerificationEmail } from '@/auth/actions';
import { useSession } from '@/auth/session';
import { AuthShell } from '@/components/AuthShell';
import { Banner } from '@/components/Banner';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { colors } from '@/theme';

/**
 * Shown when the server will only link this sign-in to an existing SI Coin account after the email address is
 * verified (so nobody can take over an account by registering its address).
 */
export default function VerifyEmailScreen() {
  const { identity, refresh, signOut } = useSession();
  const [checking, setChecking] = useState(false);
  const [resending, setResending] = useState(false);
  const [message, setMessage] = useState<{ tone: 'success' | 'error' | 'info'; text: string } | null>(null);

  const check = async () => {
    if (checking) return;
    setChecking(true);
    setMessage(null);
    try {
      const status = await refresh();
      if (status === 'unverified') {
        setMessage({ tone: 'info', text: "We can't see the verification yet. Open the link in the email, then tap this button again." });
      } else if (status === 'unreachable') {
        setMessage({ tone: 'error', text: 'We could not reach the SIcoinX server. Please try again.' });
      }
      // On success the route guard moves the user into the app.
    } catch (e) {
      setMessage({ tone: 'error', text: messageOf(e) });
    } finally {
      setChecking(false);
    }
  };

  const resend = async () => {
    if (resending) return;
    setResending(true);
    setMessage(null);
    try {
      await resendVerificationEmail();
      setMessage({ tone: 'success', text: `Verification email sent to ${identity?.email ?? 'your inbox'}.` });
    } catch (e) {
      setMessage({ tone: 'error', text: messageOf(e) });
    } finally {
      setResending(false);
    }
  };

  return (
    <AuthShell title="Verify your email" subtitle="One quick step to secure your wallet">
      {message ? <Banner tone={message.tone} message={message.text} /> : null}

      <Card>
        <Text style={styles.body}>
          We sent a verification link to <Text style={styles.strong}>{identity?.email ?? 'your email address'}</Text>.
          Open it on any device, then come back and tap the button below.
        </Text>
      </Card>

      <Button title="I've verified my email" icon="checkmark-circle-outline" onPress={check} loading={checking} />
      <Button title="Resend verification email" variant="secondary" icon="mail-outline" onPress={resend} loading={resending} />
      <Button title="Use a different account" variant="ghost" onPress={() => void signOut()} />
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  body: { fontSize: 14, color: colors.textSoft, lineHeight: 22 },
  strong: { fontWeight: '800', color: colors.text },
});
