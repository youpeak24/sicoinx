import Constants from 'expo-constants';
import { useState } from 'react';
import { Linking, Platform, StyleSheet, Text, View } from 'react-native';

import { Banner } from '@/components/Banner';
import { BrandMark } from '@/components/Brand';
import { Card, KeyValueRow } from '@/components/Card';
import { ListGroup, ListRow } from '@/components/ListRow';
import { Screen } from '@/components/Screen';
import { WEB_URL } from '@/config';
import { colors } from '@/theme';

export default function AboutScreen() {
  const [error, setError] = useState<string | null>(null);

  const open = (path: string) => {
    setError(null);
    void Linking.openURL(`${WEB_URL}${path}`).catch(() => setError('Could not open the link on this device.'));
  };

  return (
    <Screen insetBottom>
      <View style={styles.hero}>
        <BrandMark size={72} />
        <Text style={styles.name}>SIcoinX</Text>
        <Text style={styles.tagline}>The wallet for the SI Coin ecosystem</Text>
      </View>

      {error ? <Banner tone="error" message={error} /> : null}

      <Card>
        <KeyValueRow label="Version" value={Constants.expoConfig?.version ?? '1.0.0'} />
        <KeyValueRow label="Platform" value={Platform.OS === 'ios' ? 'iOS' : Platform.OS === 'android' ? 'Android' : 'Web'} />
        <KeyValueRow label="Website" value={WEB_URL.replace(/^https?:\/\//, '')} />
      </Card>

      <ListGroup>
        <ListRow icon="globe-outline" title="Visit our website" onPress={() => open('/')} />
        <ListRow icon="information-circle-outline" tone="sky" title="About SI Coin" onPress={() => open('/about')} />
        <ListRow icon="help-circle-outline" tone="violet" title="FAQ" onPress={() => open('/faq')} />
        <ListRow icon="mail-outline" tone="green" title="Contact us" onPress={() => open('/contact')} />
        <ListRow icon="document-text-outline" tone="slate" title="Terms of Service" onPress={() => open('/terms')} />
        <ListRow icon="lock-closed-outline" tone="slate" title="Privacy Policy" onPress={() => open('/privacy')} last />
      </ListGroup>

      <Text style={styles.legal}>
        SIcoinX shows reference rates for information only. The reference price is not an exchange quote, and digital
        assets carry risk.
      </Text>
    </Screen>
  );
}

const styles = StyleSheet.create({
  hero: { alignItems: 'center', gap: 6, paddingVertical: 8 },
  name: { fontSize: 26, fontWeight: '800', color: colors.text, letterSpacing: -0.5, marginTop: 6 },
  tagline: { fontSize: 14, color: colors.muted },
  legal: { fontSize: 12, color: colors.muted, textAlign: 'center', lineHeight: 18 },
});
