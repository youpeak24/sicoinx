import { Ionicons } from '@expo/vector-icons';
import { useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';

import { messageOf } from '@/api/client';
import { getNotifications, markNotificationRead } from '@/api/services';
import type { AppNotification } from '@/api/types';
import { Banner } from '@/components/Banner';
import { Button } from '@/components/Button';
import { EmptyView, ErrorView, LoadingView } from '@/components/State';
import { formatDateTime } from '@/lib/format';
import { useResource } from '@/lib/useResource';
import { chips, colors, radius, shadow, type ChipTone } from '@/theme';

function visualFor(type: string): { icon: keyof typeof Ionicons.glyphMap; tone: ChipTone } {
  switch (type) {
    case 'SUCCESS':
      return { icon: 'checkmark-circle', tone: 'green' };
    case 'WARNING':
      return { icon: 'warning', tone: 'amber' };
    case 'ALERT':
      return { icon: 'alert-circle', tone: 'rose' };
    default:
      return { icon: 'information-circle', tone: 'blue' };
  }
}

export default function NotificationsScreen() {
  const { data, error, loading, refreshing, reload, refresh } = useResource((signal) => getNotifications(signal), []);
  // Reads confirmed locally so rows clear instantly, before the server round trip finishes.
  const [readIds, setReadIds] = useState<ReadonlySet<string>>(new Set());
  const [actionError, setActionError] = useState<string | null>(null);

  if (loading && !data) return <LoadingView label="Loading notifications…" />;
  if (!data) return <ErrorView message={error ?? 'Could not load your notifications.'} onRetry={reload} />;

  const isUnread = (n: AppNotification) => !n.isRead && !readIds.has(n.id);
  const unread = data.filter(isUnread);

  const markRead = async (ids: string[]) => {
    if (ids.length === 0) return;
    setActionError(null);
    setReadIds((prev) => new Set([...prev, ...ids]));
    try {
      await Promise.all(ids.map((id) => markNotificationRead(id)));
    } catch (e) {
      setReadIds((prev) => {
        const next = new Set(prev);
        ids.forEach((id) => next.delete(id));
        return next;
      });
      setActionError(messageOf(e));
    }
  };

  return (
    <FlatList<AppNotification>
      data={data}
      keyExtractor={(n) => n.id}
      style={styles.list}
      contentContainerStyle={data.length === 0 ? styles.emptyContent : styles.content}
      ItemSeparatorComponent={() => <View style={styles.separator} />}
      refreshing={refreshing}
      onRefresh={refresh}
      ListHeaderComponent={
        <View style={styles.header}>
          {error ? <Banner tone="warning" message={`Couldn't refresh: ${error}`} /> : null}
          {actionError ? <Banner tone="error" message={actionError} /> : null}
          {unread.length > 0 ? (
            <Button
              title={`Mark all ${unread.length} as read`}
              variant="secondary"
              icon="checkmark-done"
              small
              onPress={() => void markRead(unread.map((n) => n.id))}
            />
          ) : null}
        </View>
      }
      ListEmptyComponent={
        <EmptyView
          icon="notifications-off-outline"
          title="No notifications yet"
          message="Updates about your wallet, payments and verification will appear here."
        />
      }
      renderItem={({ item }) => {
        const unreadItem = isUnread(item);
        const visual = visualFor(item.type);
        const tint = chips[visual.tone];
        return (
          <Pressable
            onPress={() => void markRead(unreadItem ? [item.id] : [])}
            accessibilityRole="button"
            accessibilityLabel={`${item.title}${unreadItem ? ', unread' : ''}`}
            style={({ pressed }) => [styles.item, unreadItem && styles.itemUnread, pressed && styles.pressed]}
          >
            <View style={[styles.icon, { backgroundColor: tint.bg }]}>
              <Ionicons name={visual.icon} size={22} color={tint.fg} />
            </View>
            <View style={styles.text}>
              <View style={styles.titleRow}>
                <Text style={styles.title} numberOfLines={2}>
                  {item.title}
                </Text>
                {unreadItem ? <View style={styles.dot} /> : null}
              </View>
              <Text style={styles.message}>{item.message}</Text>
              <Text style={styles.time}>{formatDateTime(item.createdAt)}</Text>
            </View>
          </Pressable>
        );
      }}
    />
  );
}

const styles = StyleSheet.create({
  list: { backgroundColor: colors.canvas },
  content: { padding: 20, paddingTop: 8 },
  emptyContent: { flexGrow: 1 },
  header: { gap: 10, marginBottom: 12 },
  separator: { height: 10 },
  item: {
    flexDirection: 'row',
    gap: 14,
    padding: 14,
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: '#EEF2FA',
    ...shadow.soft,
  },
  itemUnread: { borderColor: '#CFE0FF', backgroundColor: '#F8FAFF' },
  pressed: { opacity: 0.85 },
  icon: { width: 44, height: 44, borderRadius: 15, alignItems: 'center', justifyContent: 'center' },
  text: { flex: 1, gap: 3 },
  titleRow: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  title: { flex: 1, fontSize: 14, fontWeight: '800', color: colors.text },
  dot: { width: 9, height: 9, borderRadius: 5, backgroundColor: colors.primary, marginTop: 5 },
  message: { fontSize: 13, color: colors.textSoft, lineHeight: 19 },
  time: { fontSize: 11, color: colors.muted, marginTop: 2 },
});
