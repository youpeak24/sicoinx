import { StyleSheet, View } from 'react-native';

/**
 * Decorative depth for dark-blue hero areas (wallet card, sign-in header): soft overlapping discs that read as a
 * gradient without needing a native gradient module. Purely visual and hidden from accessibility.
 */
export function Backdrop() {
  return (
    <View pointerEvents="none" style={StyleSheet.absoluteFill} accessibilityElementsHidden importantForAccessibility="no-hide-descendants">
      <View style={[styles.disc, styles.discA]} />
      <View style={[styles.disc, styles.discB]} />
      <View style={[styles.disc, styles.discC]} />
    </View>
  );
}

const styles = StyleSheet.create({
  disc: { position: 'absolute', borderRadius: 999 },
  discA: { width: 260, height: 260, right: -80, top: -110, backgroundColor: 'rgba(56, 189, 248, 0.28)' },
  discB: { width: 200, height: 200, right: 40, top: 60, backgroundColor: 'rgba(124, 92, 255, 0.22)' },
  discC: { width: 220, height: 220, left: -90, bottom: -130, backgroundColor: 'rgba(255, 255, 255, 0.08)' },
});
