import { Ionicons } from '@expo/vector-icons';
import { useState, type Ref } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputInstance, type TextInputProps } from 'react-native';

import { colors, radius } from '@/theme';

interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label: string;
  error?: string | null;
  hint?: string;
  /** Unit shown inside the field on the right, e.g. "SI". */
  suffix?: string;
  /** Renders a show/hide toggle. Implies secureTextEntry while hidden. */
  secret?: boolean;
  large?: boolean;
  inputRef?: Ref<TextInputInstance>;
}

export function TextField({
  label,
  error,
  hint,
  suffix,
  secret = false,
  large = false,
  inputRef,
  editable = true,
  ...inputProps
}: TextFieldProps) {
  const [revealed, setRevealed] = useState(false);
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.wrapper}>
      <Text style={styles.label}>{label}</Text>
      <View
        style={[
          styles.field,
          focused && styles.focused,
          !!error && styles.errored,
          !editable && styles.disabled,
        ]}
      >
        <TextInput
          {...inputProps}
          ref={inputRef}
          editable={editable}
          secureTextEntry={secret && !revealed}
          onFocus={(e) => {
            setFocused(true);
            inputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            inputProps.onBlur?.(e);
          }}
          placeholderTextColor="#94A3B8"
          accessibilityLabel={label}
          style={[styles.input, large && styles.inputLarge]}
        />
        {suffix ? <Text style={styles.suffix}>{suffix}</Text> : null}
        {secret ? (
          <Pressable
            onPress={() => setRevealed((v) => !v)}
            hitSlop={10}
            accessibilityRole="button"
            accessibilityLabel={revealed ? 'Hide password' : 'Show password'}
          >
            <Ionicons name={revealed ? 'eye-off-outline' : 'eye-outline'} size={20} color={colors.muted} />
          </Pressable>
        ) : null}
      </View>
      {error ? <Text style={styles.error}>{error}</Text> : hint ? <Text style={styles.hint}>{hint}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: 6 },
  label: { fontSize: 11, fontWeight: '700', color: colors.muted, letterSpacing: 0.6, textTransform: 'uppercase' },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.canvas,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    gap: 8,
  },
  focused: { borderColor: colors.primary, backgroundColor: colors.white },
  errored: { borderColor: colors.danger },
  disabled: { opacity: 0.6 },
  input: { flex: 1, minWidth: 0, minHeight: 50, fontSize: 15, color: colors.text, paddingVertical: 10 },
  inputLarge: { fontSize: 22, fontWeight: '800', minHeight: 58 },
  suffix: { fontSize: 14, fontWeight: '700', color: colors.muted },
  error: { fontSize: 12, color: colors.danger },
  hint: { fontSize: 12, color: colors.muted },
});
