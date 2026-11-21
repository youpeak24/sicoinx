import { Link } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text } from 'react-native';

import { messageOf } from '@/api/client';
import { sendPasswordReset } from '@/auth/actions';
import { AuthShell } from '@/components/AuthShell';
import { Banner } from '@/components/Banner';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { TextField } from '@/components/TextField';
import { validateEmail } from '@/lib/validation';
import { colors } from '@/theme';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sentTo, setSentTo] = useState<string | null>(null);

  const submit = async () => {
    if (loading) return;
    const problem = validateEmail(email);
    setFieldError(problem);
    if (problem) return;

    setLoading(true);
    setError(null);
    try {
      await sendPasswordReset(email);
      setSentTo(email.trim());
    } catch (e) {
      setError(messageOf(e));
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell
      title="Reset password"
      subtitle="Enter your email and we'll send you a link to choose a new password"
      footer={
        <Link href="/sign-in" replace style={styles.link}>
          Back to sign in
        </Link>
      }
    >
      {error ? <Banner tone="error" message={error} /> : null}
      {sentTo ? (
        <Banner
          tone="success"
          title="Check your inbox"
          message={`If an account exists for ${sentTo}, a password reset link is on its way. It may take a minute to arrive; check your spam folder too.`}
        />
      ) : null}

      <Card>
        <TextField
          label="Email address"
          icon="mail-outline"
          value={email}
          onChangeText={setEmail}
          error={fieldError}
          placeholder="you@example.com"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
          returnKeyType="go"
          onSubmitEditing={submit}
          editable={!loading}
        />
      </Card>

      <Button title={sentTo ? 'Send again' : 'Send reset link'} icon="send-outline" onPress={submit} loading={loading} />
      <Text style={styles.note}>The link comes from SIcoinX and opens a secure page to set your new password.</Text>
    </AuthShell>
  );
}

const styles = StyleSheet.create({
  link: { fontSize: 14, fontWeight: '700', color: colors.primary },
  note: { fontSize: 12, color: colors.muted, textAlign: 'center', lineHeight: 18 },
});
