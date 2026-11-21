import { useLocalSearchParams } from 'expo-router';
import { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { messageOf } from '@/api/client';
import { getSupportTicket, replyToSupportTicket } from '@/api/services';
import { Banner } from '@/components/Banner';
import { Button } from '@/components/Button';
import { Card, Pill } from '@/components/Card';
import { Screen } from '@/components/Screen';
import { ErrorView, LoadingView } from '@/components/State';
import { TextField } from '@/components/TextField';
import { formatDateTime, statusLabel, ticketTone } from '@/lib/format';
import { useResource } from '@/lib/useResource';
import { validateReply } from '@/lib/validation';
import { colors, radius } from '@/theme';

export default function TicketDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const ticketId = Array.isArray(id) ? id[0]! : id;

  const { data, error, loading, refreshing, reload, refresh } = useResource(
    (signal) => getSupportTicket(ticketId, signal),
    [ticketId],
  );

  const [reply, setReply] = useState('');
  const [sending, setSending] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  if (loading && !data) return <LoadingView label="Loading ticket…" />;
  if (!data) return <ErrorView message={error ?? 'Could not load this ticket.'} onRetry={reload} />;

  const closed = data.status === 'CLOSED';

  const send = async () => {
    if (sending) return;
    const problem = validateReply(reply);
    if (problem) {
      setReplyError(problem);
      return;
    }
    setSending(true);
    setReplyError(null);
    try {
      await replyToSupportTicket(ticketId, reply);
      setReply('');
      refresh();
    } catch (e) {
      setReplyError(messageOf(e));
    } finally {
      setSending(false);
    }
  };

  return (
    <Screen insetBottom refreshing={refreshing} onRefresh={refresh}>
      <Card>
        <View style={styles.top}>
          <Text style={styles.category}>{data.category}</Text>
          <Pill label={statusLabel(data.status).toUpperCase()} tone={ticketTone(data.status)} />
        </View>
        <Text style={styles.subject}>{data.subject}</Text>
        <Text style={styles.meta}>Opened {formatDateTime(data.createdAt)}</Text>
      </Card>

      {error ? <Banner tone="warning" message={`Couldn't refresh: ${error}`} /> : null}

      <View style={styles.thread}>
        {data.messages.map((m) => {
          const staff = m.authorRole !== 'USER';
          return (
            <View key={m.id} style={[styles.bubble, staff ? styles.bubbleStaff : styles.bubbleUser]}>
              <Text style={[styles.author, !staff && styles.authorUser]}>{staff ? `${m.authorName} · Support` : 'You'}</Text>
              <Text style={[styles.content, !staff && styles.contentUser]}>{m.content}</Text>
              <Text style={[styles.time, !staff && styles.timeUser]}>{formatDateTime(m.createdAt)}</Text>
            </View>
          );
        })}
      </View>

      {closed ? (
        <Banner tone="info" message="This ticket is closed. Open a new ticket if you need more help." />
      ) : (
        <Card>
          {replyError ? <Banner tone="error" message={replyError} /> : null}
          <TextField
            label="Your reply"
            value={reply}
            onChangeText={setReply}
            placeholder="Write a message…"
            multiline
            numberOfLines={3}
            textAlignVertical="top"
            editable={!sending}
          />
          <Button title="Send reply" icon="send" onPress={send} loading={sending} />
        </Card>
      )}
    </Screen>
  );
}

const styles = StyleSheet.create({
  top: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 8 },
  category: { flex: 1, fontSize: 11, fontWeight: '800', color: colors.primary, textTransform: 'uppercase', letterSpacing: 0.4 },
  subject: { fontSize: 18, fontWeight: '800', color: colors.text, letterSpacing: -0.3 },
  meta: { fontSize: 12, color: colors.muted },
  thread: { gap: 10 },
  bubble: { gap: 4, padding: 14, borderRadius: radius.lg, maxWidth: '92%' },
  bubbleUser: { alignSelf: 'flex-end', backgroundColor: colors.primary, borderBottomRightRadius: 6 },
  bubbleStaff: { alignSelf: 'flex-start', backgroundColor: colors.surface, borderWidth: 1, borderColor: '#EEF2FA', borderBottomLeftRadius: 6 },
  author: { fontSize: 11, fontWeight: '800', color: colors.primaryDeep },
  authorUser: { color: 'rgba(255,255,255,0.85)' },
  content: { fontSize: 14, lineHeight: 20, color: colors.text },
  contentUser: { color: colors.white },
  time: { fontSize: 11, color: colors.muted },
  timeUser: { color: 'rgba(255,255,255,0.7)' },
});
