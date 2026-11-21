import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import type { TextInputInstance } from 'react-native';

import { messageOf } from '@/api/client';
import { changeFirebasePassword } from '@/auth/actions';
import { Banner } from '@/components/Banner';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { validateNewPassword } from '@/lib/validation';

interface FieldErrors {
  current?: string | null;
  next?: string | null;
  confirm?: string | null;
}

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const nextRef = useRef<TextInputInstance>(null);
  const confirmRef = useRef<TextInputInstance>(null);

  const save = async () => {
    if (saving) return;
    const errors: FieldErrors = {
      current: current ? null : 'Enter your current password.',
      next: validateNewPassword(next) ?? (next === current ? 'Choose a password you have not used here before.' : null),
      confirm: confirm === next ? null : 'Passwords do not match.',
    };
    setFieldErrors(errors);
    if (Object.values(errors).some(Boolean)) return;

    setSaving(true);
    setError(null);
    try {
      await changeFirebasePassword(current, next);
      setDone(true);
      setCurrent('');
      setNext('');
      setConfirm('');
    } catch (e) {
      setError(messageOf(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen insetBottom>
      {error ? <Banner tone="error" message={error} /> : null}
      {done ? (
        <Banner tone="success" title="Password changed" message="Use your new password the next time you sign in." />
      ) : null}

      <Card>
        <TextField
          label="Current password"
          icon="lock-closed-outline"
          value={current}
          onChangeText={setCurrent}
          error={fieldErrors.current}
          secret
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="current-password"
          textContentType="password"
          returnKeyType="next"
          onSubmitEditing={() => nextRef.current?.focus()}
          editable={!saving}
        />
        <TextField
          label="New password"
          icon="key-outline"
          value={next}
          onChangeText={setNext}
          error={fieldErrors.next}
          hint="At least 8 characters, with an uppercase letter and a number."
          secret
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="next"
          inputRef={nextRef}
          onSubmitEditing={() => confirmRef.current?.focus()}
          editable={!saving}
        />
        <TextField
          label="Confirm new password"
          icon="key-outline"
          value={confirm}
          onChangeText={setConfirm}
          error={fieldErrors.confirm}
          secret
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="new-password"
          textContentType="newPassword"
          returnKeyType="go"
          inputRef={confirmRef}
          onSubmitEditing={save}
          editable={!saving}
        />
      </Card>

      <Button title="Update password" icon="shield-checkmark-outline" onPress={save} loading={saving} />
      {done ? <Button title="Done" variant="ghost" onPress={() => router.back()} /> : null}
    </Screen>
  );
}
