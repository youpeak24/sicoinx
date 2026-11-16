import { Image, StyleSheet, Text, View } from 'react-native';

import { colors } from '@/theme';

const logo = require('../../assets/logo.png');

export function BrandMark({ size = 36 }: { size?: number }) {
  return <Image source={logo} style={{ width: size, height: size }} accessibilityLabel="SIcoinX logo" />;
}

export function BrandLockup() {
  return (
    <View style={styles.lockup}>
      <BrandMark size={32} />
      <Text style={styles.name}>SIcoinX</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  lockup: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: { fontSize: 18, fontWeight: '800', color: colors.text },
});
