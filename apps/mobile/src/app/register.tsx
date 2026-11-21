import { Link } from 'expo-router';
import { useRef, useState } from 'react';
import { Linking, StyleSheet, Switch, Text, View, type TextInputInstance } from 'react-native';

import { messageOf } from '@/api/client';
import { useSession } from '@/auth/session';
import { AuthShell } from '@/components/AuthShell';
import { Banner } from '@/components/Banner';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { TextField } from '@/components/TextField';
import { FIREBASE_NOT_CONFIGURED_MESSAGE, WEB_URL } from '@/config';
import { track } from '@/lib/analytics';
import { validateEmail, validateName, validateNewPassword } from '@/lib/validation';
import { colors } from '@/theme';

interface FieldErrors {
  name?: string | null;
  email?: string | null;
  password?: string | null;
  confirm?: string | null;
}

export default function RegisterScreen() {
  const { register, configured } = useSession();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});

  const emailRef = useRef<TextInputInstance>(null);
  const passwordRef = useRef<TextInputInstance>(null);
  const confirmRef = useRef<TextInputInstance>(null);

  const submit = async () => {
    if (loading) return;
    const errors: FieldErrors = {
      name: validateName(name),
      email: validateEmail(email),
      password: validateNewPassword(password),
      confirm: confirm === password ? null : 'Passwords do not match.',
    };
    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) return;
    if (!accepted) {
      setError('You must accept the Terms of Service and Privacy Policy to continue.');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await register({ name, email, password });
      track('sign_up', { method: 'password' });
      // The route guard moves the user into the app (or to email verification) when the session is ready.
    } catch (e) {
      setError(messageOf(e));
      setLoading(false);
    }
  };

  const open = (path: string) => void Linking.openURL(`${WEB_URL}${path}`).catch(() => undefined);

  return (
    <AuthShell
      title="Create your wallet"
      subtitle="One account for the whole SI Coin ecosystem"
      footer={
        <>
          <Text style={styles.footerText}>Already have an account? </Text>
          <Link href="/sign-in" replace style={styles.link}>
            Sign in
          </Link>
        </>
      }
    >
      {!configured ? <Banner tone="error" message={FIREBASE_NOT_CONFIGURED_MESSAGE} /> : null}
      {error ? <Banner tone="error" message={error} /> : null}

      <Card>
        <TextField
          label="Full name"
          icon="person-outline"
          value={name}
          onChangeText={setName}
          error={fieldErrors.name}
          placeholder="Jane Doe"
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          returnKeyType="next"
          onSubmitEditing={() => emailRef.current?.focus()}
          editable={!loading}
        />
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
          inputRef={emailRef}
          onSubmitEditing={() => passwordRef.current?.focus()}
          editable={!loading}
        />
        <TextField
          label="Password"
          icon="lock-closed-outline"
          value={password}
          onChangeText={setPassword}
          error={fieldErrors.password}
          hint="At least 8 characters, with an uppercase letter and a number."
          placeholder="Create a password"
          secret
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="next"
          inputRef={passwordRef}
          onSubmitEditing={() => confirmRef.current?.focus()}
          editable={!loading}
        />
        <TextField
          label="Confirm password"
          icon="lock-closed-outline"
          value={confirm}
          onChangeText={setConfirm}
          error={fieldErrors.confirm}
          placeholder="Repeat your password"
          secret
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="go"
          inputRef={confirmRef}
          onSubmitEditing={submit}
          editable={!loading}
        />
        <View style={styles.terms}>
          <Switch
            value={accepted}
            onValueChange={setAccepted}
            disabled={loading}
            trackColor={{ true: colors.primary, false: colors.border }}
            accessibilityLabel="Accept the Terms of Service and Privacy Policy"
          />
          <Text style={styles.termsText}>
            I accept the{' '}
            <Text style={styles.link} onPress={() => open('/terms')} accessibilityRole="link">
              Terms of Service
            </Text>{' '}
            and{' '}
            <Text style={styles.link} onPress={() => open('/privacy')} accessibilityRole="link">
              Privacy Policy
            </Text>
            .
          </Text>
        </View>
      </Card>

      <Button title="Create account" icon="rocket-outline" onPress={submit} loading={loading} />
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  terms: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  termsText: { flex: 1, fontSize: 13, color: colors.muted, lineHeight: 19 },
  footerText: { fontSize: 14, color: colors.muted },
  link: { fontSize: 13, fontWeight: '700', color: colors.primary },
});
