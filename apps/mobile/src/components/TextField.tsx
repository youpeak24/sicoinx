import { Ionicons } from '@expo/vector-icons';
import { useState, type ComponentProps, type Ref } from 'react';
import { Pressable, StyleSheet, Text, TextInput, View, type TextInputInstance, type TextInputProps } from 'react-native';

import { colors, radius } from '@/theme';

interface TextFieldProps extends Omit<TextInputProps, 'style'> {
  label: string;
  error?: string | null;
  hint?: string;
  /** Leading icon. */
  icon?: ComponentProps<typeof Ionicons>['name'];
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
  icon,
  suffix,
  secret = false,
  large = false,
  inputRef,
  editable = true,
  multiline,
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
          multiline && styles.fieldMultiline,
          focused && styles.focused,
          !!error && styles.errored,
          !editable && styles.disabled,
        ]}
      >
        {icon ? (
          <Ionicons name={icon} size={19} color={focused ? colors.primary : colors.faint} style={styles.icon} />
        ) : null}
        <TextInput
          {...inputProps}
          ref={inputRef}
          multiline={multiline}
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
          placeholderTextColor={colors.faint}
          accessibilityLabel={label}
          style={[styles.input, large && styles.inputLarge, multiline && styles.inputMultiline]}
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
  wrapper: { gap: 7 },
  label: { fontSize: 12, fontWeight: '700', color: colors.textSoft, letterSpacing: 0.2 },
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.tint,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: radius.md,
    paddingHorizontal: 14,
    gap: 10,
  },
  fieldMultiline: { alignItems: 'flex-start' },
  icon: { marginRight: -2 },
  focused: { borderColor: colors.primary, backgroundColor: colors.white },
  errored: { borderColor: colors.danger, backgroundColor: colors.white },
  disabled: { opacity: 0.6 },
  input: {
    flex: 1,
    minWidth: 0,
    minHeight: 52,
    fontSize: 15,
    color: colors.text,
    paddingVertical: 12,
    // Removes the browser focus ring on web; the field border shows focus instead.
    outlineStyle: 'none',
  } as object,
  inputLarge: { fontSize: 26, fontWeight: '800', minHeight: 62, letterSpacing: -0.5 },
  inputMultiline: { minHeight: 96, paddingTop: 14 },
  suffix: { fontSize: 14, fontWeight: '700', color: colors.muted },
  error: { fontSize: 12, color: colors.danger, fontWeight: '600' },
  hint: { fontSize: 12, color: colors.muted },
});
