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
import { formatDateTime, statusLabel, ticketTone } from '@/lib/format';
import { useResource } from '@/lib/useResource';
import { validateTicket } from '@/lib/validation';
import { colors, radius } from '@/theme';

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
  const [category, setCategory] = useState(CATEGORIES[0].value);
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
        <Ionicons name="add" size={20} color={colors.white} />
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
        <Button title="Submit ticket" onPress={submit} loading={submitting} />
      </Sheet>
    </View>
  );
}

const styles = StyleSheet.create({
  fill: { flex: 1, backgroundColor: colors.canvas },
  listContent: { padding: 16, paddingBottom: 96 },
  emptyContent: { flexGrow: 1 },
  separator: { height: 10 },
  ticket: {
    gap: 6,
    padding: 16,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
  },
  pressed: { opacity: 0.85 },
  ticketTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  category: { flex: 1, fontSize: 10, fontWeight: '800', color: colors.primary, textTransform: 'uppercase' },
  subject: { fontSize: 14, fontWeight: '700', color: colors.text },
  meta: { fontSize: 11, color: colors.muted },
  fab: {
    position: 'absolute',
    right: 16,
    bottom: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 18,
    height: 48,
    borderRadius: 24,
    backgroundColor: colors.primary,
    shadowColor: colors.primary,
    shadowOpacity: 0.3,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 5,
  },
  fabText: { color: colors.white, fontSize: 13, fontWeight: '800' },
  categoryGroup: { gap: 8 },
  groupLabel: { fontSize: 11, fontWeight: '700', color: colors.muted, letterSpacing: 0.6, textTransform: 'uppercase' },
});
