import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { messageOf } from '@/api/client';
import { createSupportTicket, getSupportTickets } from '@/api/services';
import type { SupportTicket } from '@/api/types';
import { Banner } from '@/components/Banner';
import { Button } from '@/components/Button';
import { Pill } from '@/components/Card';
import { ChoiceList, type Option } from '@/components/Choices';
import { Sheet } from '@/components/Sheet';
import { EmptyView, ErrorView, LoadingView } from '@/components/State';
import { TextField } from '@/components/TextField';
import { track } from '@/lib/analytics';
import { formatDateTime, statusLabel, ticketTone } from '@/lib/format';
import { useResource } from '@/lib/useResource';
import { validateTicket } from '@/lib/validation';
import { colors, radius, shadow } from '@/theme';

const CATEGORIES: Option<string>[] = [
  { value: 'Wallet & Trading', label: 'Wallet & Trading' },
  { value: 'Razorpay Payment', label: 'Razorpay Payment' },
  { value: 'KYC Identity Compliance', label: 'KYC & Identity' },
  { value: 'YouPeak Platform Integration', label: 'YouPeak Integration' },
  { value: 'General Inquiry', label: 'Something else' },
];

export default function SupportScreen() {
  const router = useRouter();
  const { data, error, loading, refreshing, reload, refresh } = useResource(
    (signal) => getSupportTickets(signal),
    [],
    { refetchOnFocus: true },
  );

  const [composing, setComposing] = useState(false);
  const [subject, setSubject] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]!.value);
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const closeComposer = () => {
    setComposing(false);
    setFormError(null);
  };

  const submit = async () => {
    if (submitting) return;
    const problem = validateTicket({ subject, message });
    if (problem) {
      setFormError(problem);
      return;
    }
    setSubmitting(true);
    setFormError(null);
    try {
      const ticket = await createSupportTicket({ subject, category, message });
      track('support_ticket_created', { category });
      setSubject('');
      setMessage('');
      setComposing(false);
      reload();
      router.push({ pathname: '/ticket/[id]', params: { id: ticket.id } });
    } catch (e) {
      setFormError(messageOf(e));
    } finally {
      setSubmitting(false);
    }
  };

  let body;
  if (loading && !data) {
    body = <LoadingView label="Loading tickets…" />;
  } else if (!data) {
    body = <ErrorView message={error ?? 'Could not load your tickets.'} onRetry={reload} />;
  } else {
    body = (
      <FlatList<SupportTicket>
        data={data}
        keyExtractor={(t) => t.id}
        contentContainerStyle={data.length === 0 ? styles.emptyContent : styles.listContent}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        refreshing={refreshing}
        onRefresh={refresh}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={error ? <Banner tone="warning" message={`Couldn't refresh: ${error}`} /> : undefined}
        ListEmptyComponent={
          <EmptyView
            icon="headset-outline"
            title="No support tickets"
            message="Need help with your wallet, payments or verification? Open a ticket and we'll get back to you."
          />
        }
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push({ pathname: '/ticket/[id]', params: { id: item.id } })}
            accessibilityRole="button"
            accessibilityLabel={`Ticket: ${item.subject}`}
            style={({ pressed }) => [styles.ticket, pressed && styles.pressed]}
          >
            <View style={styles.ticketTop}>
              <Text style={styles.category} numberOfLines={1}>
                {item.category}
              </Text>
              <Pill label={statusLabel(item.status).toUpperCase()} tone={ticketTone(item.status)} />
            </View>
            <Text style={styles.subject} numberOfLines={2}>
              {item.subject}
            </Text>
            <Text style={styles.meta}>
              {item.messagesCount} message{item.messagesCount === 1 ? '' : 's'} · Updated {formatDateTime(item.updatedAt)}
            </Text>
          </Pressable>
        )}
      />
    );
  }

  return (
    <View style={styles.fill}>
      {body}

      <Pressable
        onPress={() => setComposing(true)}
        accessibilityRole="button"
        accessibilityLabel="New support ticket"
        style={({ pressed }) => [styles.fab, pressed && styles.pressed]}
      >
        <Ionicons name="add" size={22} color={colors.white} />
        <Text style={styles.fabText}>New ticket</Text>
      </Pressable>

      <Sheet visible={composing} title="New support ticket" onClose={closeComposer} locked={submitting}>
        {formError ? <Banner tone="error" message={formError} /> : null}
        <TextField
          label="Subject"
          value={subject}
          onChangeText={setSubject}
          placeholder="What do you need help with?"
          maxLength={150}
          returnKeyType="next"
          editable={!submitting}
        />
        <View style={styles.categoryGroup}>
          <Text style={styles.groupLabel}>Category</Text>
          <ChoiceList options={CATEGORIES} value={category} onChange={setCategory} />
        </View>
        <TextField
          label="Message"
          value={message}
          onChangeText={setMessage}
          placeholder="Describe your question or issue (at least 15 characters)"
          multiline
          numberOfLines={4}
          textAlignVertical="top"
          editable={!submitting}
        />
        <Button title="Submit ticket" icon="send" onPress={submit} loading={submitting} />
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.canvas },
  listContent: { padding: 20, paddingTop: 12, paddingBottom: 110 },
  emptyContent: { flexGrow: 1 },
  separator: { height: 12 },
  ticket: {
    gap: 8,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#EEF2FA',
    ...shadow.soft,
  },
  pressed: { opacity: 0.85 },
  ticketTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  category: { flex: 1, fontSize: 11, fontWeight: '800', color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.4 },
  subject: { fontSize: 15, fontWeight: '800', color: colors.text, lineHeight: 21 },
  meta: { fontSize: 12, color: colors.muted },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 20,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.primary,
    ...shadow.glow,
  },
  fabText: { color: colors.white, fontSize: 14, fontWeight: '800' },
  categoryGroup: { gap: 8 },
  groupLabel: { fontSize: 12, fontWeight: '700', color: colors.textSoft, letterSpacing: 0.2 },
});
