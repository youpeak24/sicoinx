import { Link } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, Text, View, type TextInputInstance } from 'react-native';

import { messageOf } from '@/api/client';
import { useSession } from '@/auth/session';
import { AuthShell } from '@/components/AuthShell';
import { Banner } from '@/components/Banner';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { TextField } from '@/components/TextField';
import { FIREBASE_NOT_CONFIGURED_MESSAGE } from '@/config';
import { track } from '@/lib/analytics';
import { validateEmail, validateLoginPassword } from '@/lib/validation';
import { colors } from '@/theme';

export default function SignInScreen() {
  const { signIn, notice, clearNotice, configured } = useSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string | null; password?: string | null }>({});
  const passwordRef = useRef<TextInputInstance>(null);

  const submit = async () => {
    if (loading) return;
    const errors = { email: validateEmail(email), password: validateLoginPassword(password) };
    setFieldErrors(errors);
    if (errors.email || errors.password) return;

    setLoading(true);
    setError(null);
    clearNotice();
    try {
      await signIn(email, password);
      track('login', { method: 'password' });
      // The route guard moves the user into the app as soon as the session is ready.
    } catch (e) {
      setError(messageOf(e));
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Welcome back"
      subtitle="Sign in to your SIcoinX wallet"
      footer={
        <>
          <Text style={styles.footerText}>New to SIcoinX? </Text>
          <Link href="/register" style={styles.link}>
            Create an account
          </Link>
        </>
      }
    >
      {!configured ? <Banner tone="error" message={FIREBASE_NOT_CONFIGURED_MESSAGE} /> : null}
      {notice ? <Banner tone="warning" message={notice} /> : null}
      {error ? <Banner tone="error" message={error} /> : null}

      <Card>
        <TextField
          label="Email address"
          icon="mail-outline"
          value={email}
          onChangeText={setEmail}
          error={fieldErrors.email}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="next"
          onSubmitEditing={() => passwordRef.current?.focus()}
          editable={!loading}
        />
        <TextField
          label="Password"
          icon="lock-closed-outline"
          value={password}
          onChangeText={setPassword}
          error={fieldErrors.password}
          placeholder="Your password"
          secret
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="go"
          onSubmitEditing={submit}
          inputRef={passwordRef}
          editable={!loading}
        />
        <View style={styles.forgotRow}>
          <Link href="/forgot-password" style={styles.link}>
            Forgot password?
          </Link>
        </View>
      </Card>

      <Button title="Sign in" icon="log-in-outline" onPress={submit} loading={loading} />
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  forgotRow: { alignItems: 'flex-end', marginTop: -4 },
  footerText: { fontSize: 14, color: colors.muted },
  link: { fontSize: 14, fontWeight: '700', color: colors.primary },
});
