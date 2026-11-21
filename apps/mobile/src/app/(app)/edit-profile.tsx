import { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { messageOf } from '@/api/client';
import { useSession } from '@/auth/session';
import { Avatar } from '@/components/Avatar';
import { Banner } from '@/components/Banner';
import { Button } from '@/components/Button';
import { Card } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { TextField } from '@/components/TextField';
import { validateName } from '@/lib/validation';

export default function EditProfileScreen() {
  const { user, identity, updateName } = useSession();
  const current = user?.name || identity?.displayName || '';

  const [name, setName] = useState(current);
  const [fieldError, setFieldError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  const changed = name.trim() !== current.trim();

  const save = async () => {
    if (saving) return;
    const problem = validateName(name);
    setFieldError(problem);
    if (problem) return;

    setSaving(true);
    setError(null);
    setSaved(false);
    try {
      await updateName(name);
      setSaved(true);
    } catch (e) {
      setError(messageOf(e));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Screen insetBottom>
      <View style={styles.avatar}>
        <Avatar name={name || current} size={88} />
      </View>

      {error ? <Banner tone="error" message={error} /> : null}
      {saved ? <Banner tone="success" message="Your profile has been updated." /> : null}

      <Card>
        <TextField
          label="Full name"
          icon="person-outline"
          value={name}
          onChangeText={(t) => {
            setName(t);
            setSaved(false);
          }}
          error={fieldError}
          autoCapitalize="words"
          autoComplete="name"
          textContentType="name"
          returnKeyType="done"
          onSubmitEditing={save}
          editable={!saving}
        />
        <TextField
          label="Email address"
          icon="mail-outline"
          value={identity?.email ?? user?.email ?? ''}
          onChangeText={() => undefined}
          editable={false}
          hint="Your email is your sign-in and can't be changed here."
        />
      </Card>

      <Button title="Save changes" icon="checkmark" onPress={save} loading={saving} disabled={!changed} />
    </Screen>
  );
}

const styles = StyleSheet.create({
  avatar: { alignItems: 'center', paddingVertical: 4 },
});
