import { Link, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, Text, View, type TextInputInstance } from 'react-native';

import { login } from '@/api/services';
import { messageOf } from '@/api/client';
import { useSession } from '@/auth/session';
import { Banner } from '@/components/Banner';
import { BrandMark } from '@/components/Brand';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { validateEmail, validateLoginPassword } from '@/lib/validation';
import { colors } from '@/theme';

export default function SignInScreen() {
  const router = useRouter();
  const { signIn, notice, clearNotice } = useSession();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [mfaCode, setMfaCode] = useState('');
  const [needsMfa, setNeedsMfa] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ email?: string | null; password?: string | null }>({});
  const passwordRef = useRef<TextInputInstance>(null);

  const submit = async () => {
    if (loading) return;
    const errors = { email: validateEmail(email), password: validateLoginPassword(password) };
    setFieldErrors(errors);
    if (errors.email || errors.password) return;
    if (needsMfa && !/^\d{6}$/.test(mfaCode.trim())) {
      setError('Enter the 6-digit code from your authenticator app.');
      return;
    }

    setLoading(true);
    setError(null);
    clearNotice();
    try {
      const result = await login(email, password, needsMfa ? mfaCode.trim() : undefined);
      if (result.kind === 'mfa') {
        setNeedsMfa(true);
        return;
      }
      await signIn(result.token, result.user);
      router.replace('/');
    } catch (e) {
      setError(messageOf(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <Screen insetTop insetBottom contentStyle={styles.content}>
      <View style={styles.header}>
        <BrandMark size={72} />
        <Text style={styles.title}>Welcome back</Text>
        <Text style={styles.subtitle}>Sign in to your SIcoinX wallet</Text>
      </View>

      {notice ? <Banner tone="warning" message={notice} /> : null}
      {error ? <Banner tone="error" message={error} /> : null}

      <Card>
        <TextField
          label="Email address"
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
          value={password}
          onChangeText={setPassword}
          error={fieldErrors.password}
          placeholder="Your password"
          secret
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="current-password"
          textContentType="password"
          returnKeyType={needsMfa ? 'next' : 'go'}
          onSubmitEditing={needsMfa ? undefined : submit}
          inputRef={passwordRef}
          editable={!loading}
        />
        {needsMfa ? (
          <TextField
            label="Two-factor code"
            value={mfaCode}
            onChangeText={(t) => setMfaCode(t.replace(/\D/g, '').slice(0, 6))}
            hint="Open your authenticator app and enter the 6-digit code."
            placeholder="123456"
            keyboardType="number-pad"
            autoComplete="one-time-code"
            textContentType="oneTimeCode"
            returnKeyType="go"
            onSubmitEditing={submit}
            editable={!loading}
          />
        ) : null}
      </Card>

      <Button title={needsMfa ? 'Verify & sign in' : 'Sign in'} onPress={submit} loading={loading} />

      <View style={styles.footer}>
        <Text style={styles.footerText}>New to SIcoinX? </Text>
        <Link href="/register" style={styles.link}>
          Create an account
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, justifyContent: 'center' },
  header: { alignItems: 'center', gap: 6, marginBottom: 8 },
  title: { fontSize: 24, fontWeight: '800', color: colors.text, marginTop: 8 },
  subtitle: { fontSize: 13, color: colors.muted },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { fontSize: 13, color: colors.muted },
  link: { fontSize: 13, fontWeight: '700', color: colors.primary },
});
