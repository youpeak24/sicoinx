import { StyleSheet, Text, View } from 'react-native';

import { initialsOf } from '@/lib/profile';
import { colors } from '@/theme';

interface AvatarProps {
  name?: string | null;
  size?: number;
  /** Light ring for use on dark backgrounds. */
  ring?: boolean;
}

/** Circular initials avatar. */
export function Avatar({ name, size = 44, ring = false }: AvatarProps) {
  return (
    <View
      style={[
        styles.circle,
        { width: size, height: size, borderRadius: size / 2 },
        ring && styles.ring,
      ]}
      accessibilityLabel={name ? `Avatar for ${name}` : 'Avatar'}
    >
      <Text style={[styles.initials, { fontSize: size * 0.38 }]}>{initialsOf(name)}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  circle: { backgroundColor: colors.primary, alignItems: 'center', justifyContent: 'center' },
  ring: { borderWidth: 2.5, borderColor: 'rgba(255,255,255,0.7)' },
  initials: { color: colors.white, fontWeight: '800', letterSpacing: 0.5 },
});
