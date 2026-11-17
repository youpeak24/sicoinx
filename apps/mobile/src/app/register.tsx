import { Link, useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import { StyleSheet, Switch, Text, View, type TextInputInstance } from 'react-native';

import { messageOf } from '@/api/client';
import { register } from '@/api/services';
import { useSession } from '@/auth/session';
import { Banner } from '@/components/Banner';
import { BrandMark } from '@/components/Brand';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
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
  const router = useRouter();
  const { signIn } = useSession();

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
      const session = await register({ name, email, password });
      await signIn(session.token, session.user);
      track('sign_up', { method: 'password' });
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
        <BrandMark size={64} />
        <Text style={styles.title}>Create your wallet</Text>
        <Text style={styles.subtitle}>One account for the whole SI Coin ecosystem</Text>
      </View>

      {error ? <Banner tone="error" message={error} /> : null}

      <Card>
        <TextField
          label="Full name"
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
          <Text style={styles.termsText}>I accept the Terms of Service and Privacy Policy.</Text>
        </View>
      </Card>

      <Button title="Create account" onPress={submit} loading={loading} />

      <View style={styles.footer}>
        <Text style={styles.footerText}>Already have an account? </Text>
        <Link href="/sign-in" replace style={styles.link}>
          Sign in
        </Link>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flexGrow: 1, justifyContent: 'center' },
  header: { alignItems: 'center', gap: 6, marginBottom: 8 },
  title: { fontSize: 24, fontWeight: '800', color: colors.text, marginTop: 8 },
  subtitle: { fontSize: 13, color: colors.muted, textAlign: 'center' },
  terms: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  termsText: { flex: 1, fontSize: 12, color: colors.muted, lineHeight: 17 },
  footer: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  footerText: { fontSize: 13, color: colors.muted },
  link: { fontSize: 13, fontWeight: '700', color: colors.primary },
});
