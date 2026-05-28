import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import {
  FlatList,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { EmptyState } from "@/components/EmptyState";
import { LoadingState } from "@/components/LoadingState";
import { useColors } from "@/hooks/useColors";
import { useNotifications, useMarkNotificationRead, ApiNotification } from "@/hooks/useApi";

function NotifRow({ notif, onPress }: { notif: ApiNotification; onPress: () => void }) {
  const colors = useColors();
  const typeMap = {
    fee: { icon: "dollar-sign" as const, color: colors.warning, bg: colors.warningLight },
    attendance: { icon: "check-square" as const, color: colors.info, bg: colors.infoLight },
    general: { icon: "bell" as const, color: colors.primary, bg: colors.accent },
    reminder: { icon: "message-circle" as const, color: colors.success, bg: colors.successLight },
  };
  const t = typeMap[notif.type];
  const time = new Date(notif.createdAt).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
  });

  return (
    <TouchableOpacity
      style={[
        styles.row,
        {
          backgroundColor: notif.isRead ? colors.card : colors.accent,
          borderColor: notif.isRead ? colors.border : colors.primary + "30",
        },
      ]}
      onPress={onPress}
      activeOpacity={0.78}
    >
      <View style={[styles.icon, { backgroundColor: t.bg }]}>
        <Feather name={t.icon} size={18} color={t.color} />
      </View>
      <View style={styles.content}>
        <View style={styles.titleRow}>
          <Text style={[styles.title, { color: colors.foreground }]}>{notif.title}</Text>
          {!notif.isRead && <View style={[styles.dot, { backgroundColor: colors.primary }]} />}
        </View>
        <Text style={[styles.body, { color: colors.mutedForeground }]}>{notif.body}</Text>
        <Text style={[styles.time, { color: colors.mutedForeground }]}>{time}</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function NotificationsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { data: notifications = [], isLoading, refetch } = useNotifications();
  const { mutate: markRead } = useMarkNotificationRead();

  const unreadCount = notifications.filter((n) => !n.isRead).length;
  const extraPad = Platform.OS === "web" ? 67 : 0;

  if (isLoading && !notifications.length) return <LoadingState message="Loading notifications…" />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={notifications}
        keyExtractor={(n) => n.id}
        renderItem={({ item }) => (
          <NotifRow
            notif={item}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              if (!item.isRead) {
                markRead(item.id);
              }
            }}
          />
        )}
        contentContainerStyle={[
          styles.list,
          { paddingTop: extraPad + 8, paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Feather name="arrow-left" size={20} color={colors.foreground} />
            </TouchableOpacity>
            <View style={styles.titleRow2}>
              <Text style={[styles.screenTitle, { color: colors.foreground }]}>Notifications</Text>
              {unreadCount > 0 && (
                <TouchableOpacity
                  style={[styles.markAllBtn, { backgroundColor: colors.accent }]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    notifications.filter((n) => !n.isRead).forEach((n) => markRead(n.id));
                  }}
                >
                  <Text style={[styles.markAllText, { color: colors.primary }]}>Mark all read</Text>
                </TouchableOpacity>
              )}
            </View>
            {unreadCount > 0 && (
              <Text style={[styles.unreadBadge, { color: colors.mutedForeground }]}>
                {unreadCount} unread
              </Text>
            )}
          </View>
        }
        ListEmptyComponent={
          <EmptyState icon="bell" title="All caught up" subtitle="No new notifications" />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 16 },
  header: { marginBottom: 12 },
  backBtn: { marginBottom: 12 },
  titleRow2: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  screenTitle: { fontSize: 24, fontFamily: "Inter_700Bold" },
  markAllBtn: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 10 },
  markAllText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  unreadBadge: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 4, marginBottom: 4 },
  row: { flexDirection: "row", gap: 12, borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10 },
  icon: { width: 42, height: 42, borderRadius: 12, alignItems: "center", justifyContent: "center", flexShrink: 0 },
  content: { flex: 1, gap: 3 },
  titleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  title: { fontSize: 14, fontFamily: "Inter_600SemiBold", flex: 1 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  body: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
  time: { fontSize: 11, fontFamily: "Inter_400Regular" },
});
