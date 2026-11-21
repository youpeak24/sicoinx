import { useRouter } from 'expo-router';
import Constants from 'expo-constants';
import { useState } from 'react';
import { Linking, StyleSheet, Text, View } from 'react-native';

import { messageOf } from '@/api/client';
import { getKycStatus, getNotifications } from '@/api/services';
import type { KycStatus } from '@/api/types';
import { resendVerificationEmail } from '@/auth/actions';
import { useSession } from '@/auth/session';
import { Avatar } from '@/components/Avatar';
import { Banner } from '@/components/Banner';
import { Button } from '@/components/Button';
import { Card, Pill } from '@/components/Card';
import { ConfirmDialog } from '@/components/ConfirmDialog';
import { ListGroup, ListRow } from '@/components/ListRow';
import { Screen } from '@/components/Screen';
import { WEB_URL } from '@/config';
import { staffRoleLabel } from '@/lib/profile';
import { useResource } from '@/lib/useResource';
import { colors } from '@/theme';

const KYC_PILL: Record<KycStatus, { label: string; tone: 'success' | 'warning' | 'danger' | 'neutral' }> = {
  APPROVED: { label: 'VERIFIED', tone: 'success' },
  PENDING: { label: 'IN REVIEW', tone: 'warning' },
  REJECTED: { label: 'REJECTED', tone: 'danger' },
  NOT_SUBMITTED: { label: 'REQUIRED', tone: 'neutral' },
};

export default function AccountScreen() {
  const router = useRouter();
  const { user, identity, signOut, refresh } = useSession();

  const [confirming, setConfirming] = useState(false);
  const [signingOut, setSigningOut] = useState(false);
  const [resending, setResending] = useState(false);
  const [checking, setChecking] = useState(false);
  const [notice, setNotice] = useState<{ tone: 'success' | 'error' | 'info'; text: string } | null>(null);

  // Secondary info: a failure here must never hide the account screen.
  const extras = useResource(
    async (signal) => {
      const [kyc, notifications] = await Promise.allSettled([getKycStatus(signal), getNotifications(signal)]);
      return {
        kycStatus: kyc.status === 'fulfilled' ? kyc.value.status : null,
        unread: notifications.status === 'fulfilled' ? notifications.value.filter((n) => !n.isRead).length : 0,
      };
    },
    [],
    { refetchOnFocus: true },
  );

  const name = user?.name || identity?.displayName || 'SIcoinX member';
  const email = identity?.email || user?.email || '';
  const staff = staffRoleLabel(user?.role);
  const verified = identity?.emailVerified ?? user?.isEmailVerified ?? false;
  const kyc = extras.data?.kycStatus ? KYC_PILL[extras.data.kycStatus] : null;
  const unread = extras.data?.unread ?? 0;

  const openWeb = (path: string) => {
    void Linking.openURL(`${WEB_URL}${path}`).catch(() =>
      setNotice({ tone: 'error', text: 'Could not open the link on this device.' }),
    );
  };

  const resend = async () => {
    if (resending) return;
    setResending(true);
    setNotice(null);
    try {
      await resendVerificationEmail();
      setNotice({ tone: 'success', text: `Verification email sent to ${email}.` });
    } catch (e) {
      setNotice({ tone: 'error', text: messageOf(e) });
    } finally {
      setResending(false);
    }
  };

  const recheck = async () => {
    if (checking) return;
    setChecking(true);
    setNotice(null);
    try {
      await refresh();
      setNotice({ tone: 'info', text: 'Account refreshed.' });
    } catch (e) {
      setNotice({ tone: 'error', text: messageOf(e) });
    } finally {
      setChecking(false);
    }
  };

  const confirmSignOut = async () => {
    setSigningOut(true);
    await signOut();
    // The route guard leaves this screen as soon as the session ends.
    setSigningOut(false);
    setConfirming(false);
  };

  return (
    <Screen insetBottom={false} refreshing={extras.refreshing} onRefresh={extras.refresh}>
      <Card style={styles.profile}>
        <Avatar name={name} size={76} />
        <View style={styles.profileText}>
          <Text style={styles.name} numberOfLines={1}>
            {name}
          </Text>
          <Text style={styles.email} numberOfLines={1}>
            {email}
          </Text>
        </View>
        <View style={styles.pills}>
          <Pill label={verified ? 'EMAIL VERIFIED' : 'EMAIL NOT VERIFIED'} tone={verified ? 'success' : 'warning'} />
          {staff ? <Pill label={staff.toUpperCase()} tone="info" /> : null}
        </View>
      </Card>

      {notice ? <Banner tone={notice.tone} message={notice.text} /> : null}

      {!verified ? (
        <Card>
          <Text style={styles.verifyTitle}>Verify your email</Text>
          <Text style={styles.verifyBody}>
            Confirm {email || 'your email address'} to secure your wallet and recover your account if you ever forget your password.
          </Text>
          <View style={styles.verifyActions}>
            <Button title="Resend email" variant="secondary" small onPress={resend} loading={resending} style={styles.flex} />
            <Button title="I've verified" small onPress={recheck} loading={checking} style={styles.flex} />
          </View>
        </Card>
      ) : null}

      <ListGroup title="Profile">
        <ListRow icon="person-outline" tone="blue" title="Edit profile" subtitle="Change your display name" onPress={() => router.push('/edit-profile')} />
        <ListRow icon="key-outline" tone="violet" title="Change password" subtitle="Keep your account secure" onPress={() => router.push('/change-password')} last />
      </ListGroup>

      <ListGroup title="Wallet & activity">
        <ListRow
          icon="shield-checkmark-outline"
          tone="green"
          title="Identity verification"
          subtitle="KYC status and documents"
          right={kyc ? <Pill label={kyc.label} tone={kyc.tone} /> : undefined}
          onPress={() => router.navigate('/kyc')}
        />
        <ListRow
          icon="notifications-outline"
          tone="amber"
          title="Notifications"
          subtitle={unread > 0 ? `${unread} unread` : 'You are all caught up'}
          right={unread > 0 ? <Pill label={String(unread)} tone="danger" /> : undefined}
          onPress={() => router.push('/notifications')}
        />
        <ListRow icon="receipt-outline" tone="sky" title="Transaction history" subtitle="Purchases, sales and transfers" onPress={() => router.navigate('/history')} last />
      </ListGroup>

      <ListGroup title="Help & legal">
        <ListRow icon="headset-outline" tone="blue" title="Help & support" subtitle="Open a ticket with our team" onPress={() => router.navigate('/support')} />
        <ListRow icon="help-circle-outline" tone="sky" title="FAQ" onPress={() => openWeb('/faq')} />
        <ListRow icon="document-text-outline" tone="slate" title="Terms of Service" onPress={() => openWeb('/terms')} />
        <ListRow icon="lock-closed-outline" tone="slate" title="Privacy Policy" onPress={() => openWeb('/privacy')} />
        <ListRow icon="information-circle-outline" tone="slate" title="About SIcoinX" onPress={() => router.push('/about')} last />
      </ListGroup>

      <ListGroup>
        <ListRow icon="log-out-outline" title="Sign out" subtitle="Sign out of SIcoinX on this device" destructive onPress={() => setConfirming(true)} last testID="sign-out-row" />
      </ListGroup>

      <Text style={styles.version}>SIcoinX {Constants.expoConfig?.version ?? '1.0.0'}</Text>

      <ConfirmDialog
        visible={confirming}
        title="Sign out?"
        message="You will need to sign in again to use your wallet on this device."
        confirmLabel="Sign out"
        icon="log-out-outline"
        destructive
        loading={signingOut}
        onConfirm={() => void confirmSignOut()}
        onCancel={() => setConfirming(false)}
      />
    </Screen>
  );
}

const styles = StyleSheet.create({
  profile: { alignItems: 'center', paddingVertical: 24, gap: 12 },
  profileText: { alignItems: 'center', gap: 2, maxWidth: '100%' },
  name: { fontSize: 22, fontWeight: '800', color: colors.text, letterSpacing: -0.4 },
  email: { fontSize: 14, color: colors.muted },
  pills: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', justifyContent: 'center' },
  verifyTitle: { fontSize: 15, fontWeight: '800', color: colors.text },
  verifyBody: { fontSize: 13, color: colors.muted, lineHeight: 19, marginTop: -6 },
  verifyActions: { flexDirection: 'row', gap: 10 },
  flex: { flex: 1 },
  version: { textAlign: 'center', fontSize: 12, color: colors.faint, marginTop: 4 },
});
