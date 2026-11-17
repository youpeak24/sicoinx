import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

import { messageOf } from '@/api/client';
import { getKycStatus, submitKyc } from '@/api/services';
import type { IdType, KycRecord } from '@/api/types';
import { Banner } from '@/components/Banner';
import { Button } from '@/components/Button';
import { Card, KeyValueRow, SectionLabel } from '@/components/Card';
import { ChoiceList, type Option } from '@/components/Choices';
import { Screen } from '@/components/Screen';
import { ErrorView, LoadingView } from '@/components/State';
import { TextField } from '@/components/TextField';
import { track } from '@/lib/analytics';
import { formatDateTime, maskId, statusLabel } from '@/lib/format';
import { useResource } from '@/lib/useResource';
import { validateKyc } from '@/lib/validation';
import { colors, radius } from '@/theme';

const ID_TYPES: Option<IdType>[] = [
  { value: 'AADHAAR', label: 'Aadhaar Card (India)', icon: 'card-outline' },
  { value: 'PAN', label: 'PAN Card (India)', icon: 'card-outline' },
  { value: 'PASSPORT', label: 'Passport', icon: 'airplane-outline' },
  { value: 'DRIVING_LICENSE', label: 'Driving License', icon: 'car-outline' },
];

/** The API stores the document as a string; a compressed JPEG data URI stays well under the 10 MB body limit. */
const MAX_DOCUMENT_CHARS = 6_000_000;

interface PickedDocument {
  uri: string;
  dataUri: string;
}

export default function KycScreen() {
  const { data, error, loading, refreshing, reload, refresh } = useResource(
    (signal) => getKycStatus(signal),
    [],
    { refetchOnFocus: true },
  );

  const [fullName, setFullName] = useState('');
  const [idType, setIdType] = useState<IdType>('AADHAAR');
  const [idNumber, setIdNumber] = useState('');
  const [document, setDocument] = useState<PickedDocument | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [justSubmitted, setJustSubmitted] = useState<KycRecord | null>(null);

  if (loading && !data) return <LoadingView label="Loading verification status…" />;
  if (!data) return <ErrorView message={error ?? 'Could not load your KYC status.'} onRetry={reload} />;

  const record = justSubmitted ?? data;
  const status = record.status;
  const editable = status === 'NOT_SUBMITTED' || status === 'REJECTED';

  const pickDocument = async () => {
    setFormError(null);
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.5,
        base64: true,
        allowsEditing: false,
      });
      if (result.canceled) return;
      const asset = result.assets[0];
      if (!asset?.base64) {
        setFormError('Could not read that image. Please choose a different one.');
        return;
      }
      if (asset.base64.length > MAX_DOCUMENT_CHARS) {
        setFormError('That image is too large. Choose a smaller photo or a lower resolution scan.');
        return;
      }
      const mime = asset.mimeType && asset.mimeType.startsWith('image/') ? asset.mimeType : 'image/jpeg';
      setDocument({ uri: asset.uri, dataUri: `data:${mime};base64,${asset.base64}` });
    } catch (e) {
      setFormError(messageOf(e, 'Could not open your photo library.'));
    }
  };

  const submit = async () => {
    if (submitting) return;
    const problem = validateKyc({ fullName, idNumber, hasDocument: document !== null });
    if (problem) {
      setFormError(problem);
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const saved = await submitKyc({
        fullName: fullName.trim(),
        idType,
        idNumber: idNumber.trim(),
        documentFrontUrl: document!.dataUri,
      });
      track('kyc_submitted', { id_type: idType });
      setJustSubmitted({ ...saved, status: saved.status ?? 'PENDING' });
      setDocument(null);
    } catch (e) {
      setFormError(messageOf(e));
    } finally {
      setSubmitting(false);
    }
  };

  const summary = describeStatus(status);

  return (
    <Screen refreshing={refreshing} onRefresh={refresh}>
      <View style={[styles.statusCard, { backgroundColor: summary.bg, borderColor: summary.border }]}>
        <Ionicons name={summary.icon} size={30} color={summary.fg} />
        <View style={styles.statusText}>
          <Text style={[styles.statusTitle, { color: summary.fg }]}>{summary.title}</Text>
          <Text style={styles.statusBody}>{summary.body}</Text>
        </View>
      </View>

      {justSubmitted ? (
        <Banner tone="success" message="Verification submitted. Reviews usually complete within 1–24 hours." />
      ) : null}

      {status === 'REJECTED' && record.rejectionReason ? (
        <Banner tone="error" title="Reason for rejection" message={record.rejectionReason} />
      ) : null}

      {status !== 'NOT_SUBMITTED' && record.fullName ? (
        <Card>
          <SectionLabel>Submitted details</SectionLabel>
          <View>
            <KeyValueRow label="Full name" value={record.fullName} />
            {record.idType ? <KeyValueRow label="ID type" value={statusLabel(record.idType)} /> : null}
            {record.idNumber ? <KeyValueRow label="ID number" value={maskId(record.idNumber)} /> : null}
            {record.submittedAt ? <KeyValueRow label="Submitted" value={formatDateTime(record.submittedAt)} /> : null}
          </View>
        </Card>
      ) : null}

      {editable ? (
        <>
          {formError ? <Banner tone="error" message={formError} /> : null}
          <Card>
            <SectionLabel>Government ID details</SectionLabel>
            <TextField
              label="Full name as on ID"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
              autoComplete="name"
              returnKeyType="next"
              editable={!submitting}
            />
            <View style={styles.group}>
              <Text style={styles.groupLabel}>ID type</Text>
              <ChoiceList options={ID_TYPES} value={idType} onChange={setIdType} />
            </View>
            <TextField
              label="Document ID number"
              value={idNumber}
              onChangeText={setIdNumber}
              autoCapitalize="characters"
              autoCorrect={false}
              returnKeyType="done"
              editable={!submitting}
            />
            <View style={styles.group}>
              <Text style={styles.groupLabel}>Document photo</Text>
              <Pressable
                onPress={pickDocument}
                disabled={submitting}
                accessibilityRole="button"
                accessibilityLabel={document ? 'Change document photo' : 'Choose document photo'}
                style={styles.picker}
              >
                {document ? (
                  <Image source={{ uri: document.uri }} style={styles.preview} resizeMode="cover" />
                ) : (
                  <View style={styles.pickerEmpty}>
                    <Ionicons name="cloud-upload-outline" size={28} color={colors.primary} />
                    <Text style={styles.pickerText}>Choose a clear photo of the front of your ID</Text>
                  </View>
                )}
              </Pressable>
              {document ? (
                <Button title="Choose a different photo" variant="ghost" onPress={pickDocument} disabled={submitting} />
              ) : null}
            </View>
          </Card>

          <Button
            title={status === 'REJECTED' ? 'Resubmit verification' : 'Submit for verification'}
            onPress={submit}
            loading={submitting}
          />
        </>
      ) : null}
    </Screen>
  );
}

function describeStatus(status: KycRecord['status']) {
  switch (status) {
    case 'APPROVED':
      return {
        icon: 'checkmark-circle' as const,
        fg: colors.success,
        bg: colors.successBg,
        border: colors.successBorder,
        title: 'Identity verified',
        body: 'Full withdrawal limits and cross-ecosystem spending are unlocked.',
      };
    case 'PENDING':
      return {
        icon: 'time' as const,
        fg: colors.warning,
        bg: colors.warningBg,
        border: colors.warningBorder,
        title: 'Verification under review',
        body: 'Your documents were received. Approval usually takes 1–24 hours.',
      };
    case 'REJECTED':
      return {
        icon: 'close-circle' as const,
        fg: colors.danger,
        bg: colors.dangerBg,
        border: colors.dangerBorder,
        title: 'Verification rejected',
        body: 'Please correct the issue below and submit again.',
      };
    default:
      return {
        icon: 'shield-outline' as const,
        fg: colors.primary,
        bg: colors.surface,
        border: colors.border,
        title: 'Verification required',
        body: 'Complete identity verification to unlock bank cashouts.',
      };
  }
}

const styles = StyleSheet.create({
  statusCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    padding: 18,
    borderRadius: radius.lg,
    borderWidth: 1,
  },
  statusText: { flex: 1, gap: 2 },
  statusTitle: { fontSize: 14, fontWeight: '800' },
  statusBody: { fontSize: 12, color: colors.muted, lineHeight: 17 },
  group: { gap: 8 },
  groupLabel: { fontSize: 11, fontWeight: '700', color: colors.muted, letterSpacing: 0.6, textTransform: 'uppercase' },
  picker: {
    borderRadius: radius.md,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: colors.border,
    backgroundColor: colors.canvas,
    overflow: 'hidden',
  },
  pickerEmpty: { alignItems: 'center', gap: 8, paddingVertical: 28, paddingHorizontal: 16 },
  pickerText: { fontSize: 12, color: colors.muted, textAlign: 'center' },
  preview: { width: '100%', height: 180 },
});
