import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Linking,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LoadingState } from "@/components/LoadingState";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { useParentChildren, useParentAnnouncements, ApiParentChild } from "@/hooks/useApi";

const TUTOR_WHATSAPP = "919876543210";

function getGreeting() {
  const h = new Date().getHours();
  if (h < 12) return "Good morning";
  if (h < 17) return "Good afternoon";
  return "Good evening";
}

function AttendancePill({ pct, colors }: { pct: number; colors: ReturnType<typeof useColors> }) {
  const color = pct >= 90 ? colors.success : pct >= 75 ? colors.warning : colors.danger;
  const bg = pct >= 90 ? colors.successLight : pct >= 75 ? colors.warningLight : colors.dangerLight;
  return (
    <View style={[pillStyles.wrap, { backgroundColor: bg }]}>
      <Feather name={pct >= 90 ? "check-circle" : pct >= 75 ? "alert-triangle" : "x-circle"} size={12} color={color} />
      <Text style={[pillStyles.text, { color }]}>{pct}% attendance</Text>
    </View>
  );
}

const pillStyles = StyleSheet.create({
  wrap: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20, alignSelf: "flex-start" },
  text: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
});

function ChildCard({ child, colors }: { child: ApiParentChild; colors: ReturnType<typeof useColors> }) {
  const feeColor = child.feeStatus === "paid" ? colors.success : child.feeStatus === "pending" ? colors.warning : colors.danger;
  const feeBg = child.feeStatus === "paid" ? colors.successLight : child.feeStatus === "pending" ? colors.warningLight : colors.dangerLight;
  const initials = child.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <View style={[childStyles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={childStyles.header}>
        <View style={[childStyles.avatar, { backgroundColor: colors.accent }]}>
          <Text style={[childStyles.initials, { color: colors.primary }]}>{initials}</Text>
        </View>
        <View style={childStyles.headerInfo}>
          <Text style={[childStyles.name, { color: colors.foreground }]}>{child.name}</Text>
          <Text style={[childStyles.grade, { color: colors.mutedForeground }]}>{child.grade} Grade</Text>
        </View>
      </View>

      <View style={childStyles.statsRow}>
        <AttendancePill pct={child.attendancePercent} colors={colors} />
        <View style={[pillStyles.wrap, { backgroundColor: feeBg }]}>
          <Feather name={child.feeStatus === "paid" ? "check-circle" : "alert-circle"} size={12} color={feeColor} />
          <Text style={[pillStyles.text, { color: feeColor }]}>
            {child.feeStatus === "paid" ? "Fees paid" : `₹${(child.feeAmount - child.feePaid).toLocaleString("en-IN")} due`}
          </Text>
        </View>
      </View>

      {child.todayClass ? (
        <View style={[childStyles.todayRow, { backgroundColor: colors.secondary }]}>
          <Feather name="clock" size={13} color={colors.primary} />
          <Text style={[childStyles.todayText, { color: colors.foreground }]}>
            Today: <Text style={{ fontFamily: "Inter_600SemiBold" }}>{child.todayClass.subject} at {child.todayClass.time}</Text>
          </Text>
        </View>
      ) : (
        <View style={[childStyles.todayRow, { backgroundColor: colors.secondary }]}>
          <Feather name="coffee" size={13} color={colors.mutedForeground} />
          <Text style={[childStyles.todayText, { color: colors.mutedForeground }]}>No classes today</Text>
        </View>
      )}
    </View>
  );
}

const childStyles = StyleSheet.create({
  card: { borderRadius: 18, borderWidth: 1, padding: 18, marginBottom: 14, gap: 14 },
  header: { flexDirection: "row", alignItems: "center", gap: 12 },
  avatar: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  initials: { fontSize: 18, fontFamily: "Inter_700Bold" },
  headerInfo: { flex: 1 },
  name: { fontSize: 17, fontFamily: "Inter_700Bold" },
  grade: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
  statsRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  todayRow: { flexDirection: "row", alignItems: "center", gap: 8, padding: 10, borderRadius: 10 },
  todayText: { fontSize: 13, fontFamily: "Inter_400Regular", flex: 1 },
});

export default function ParentHomeScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user } = useAuth();

  const { data: children = [], isLoading: childrenLoading, refetch: refetchChildren } = useParentChildren();
  const { data: announcements = [], isLoading: annLoading, refetch: refetchAnn } = useParentAnnouncements();

  const isLoading = childrenLoading || annLoading;
  const onRefresh = () => { refetchChildren(); refetchAnn(); };

  const extraPad = Platform.OS === "web" ? 67 : 0;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom;

  if (isLoading && !children.length) return <LoadingState message="Loading your dashboard…" />;

  const s = innerStyles(colors);
  const recent = announcements.slice(0, 3);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[s.container, { paddingTop: extraPad + 16, paddingBottom: bottomPad + 100 }]}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={onRefresh} tintColor={colors.primary} />}
      showsVerticalScrollIndicator={false}
    >
      <View style={s.header}>
        <View>
          <Text style={[s.greeting, { color: colors.mutedForeground }]}>{getGreeting()},</Text>
          <Text style={[s.name, { color: colors.foreground }]}>{user?.name ?? "Parent"}</Text>
        </View>
        <View style={[s.badge, { backgroundColor: colors.accent }]}>
          <Feather name="users" size={13} color={colors.primary} />
          <Text style={[s.badgeText, { color: colors.primary }]}>Parent</Text>
        </View>
      </View>

      <Text style={[s.sectionLabel, { color: colors.foreground }]}>
        {children.length === 1 ? "Your Child" : "Your Children"}
      </Text>
      {children.map((child) => (
        <ChildCard key={child.id} child={child} colors={colors} />
      ))}

      <Text style={[s.sectionLabel, { color: colors.foreground }]}>Announcements</Text>
      <View style={[s.announcementsCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {recent.length === 0 ? (
          <Text style={[s.noAnnounce, { color: colors.mutedForeground }]}>No announcements right now.</Text>
        ) : (
          recent.map((a, i) => (
            <View key={a.id}>
              {i > 0 && <View style={[s.divider, { backgroundColor: colors.border }]} />}
              <View style={s.announceRow}>
                <View style={[s.announceDot, { backgroundColor: a.type === "test" ? colors.danger : a.type === "holiday" ? colors.success : colors.primary }]} />
                <View style={{ flex: 1 }}>
                  <Text style={[s.announceTitle, { color: colors.foreground }]}>{a.title}</Text>
                  <Text style={[s.announceBody, { color: colors.mutedForeground }]}>{a.body}</Text>
                  <Text style={[s.announceDate, { color: colors.mutedForeground }]}>{a.date}</Text>
                </View>
              </View>
            </View>
          ))
        )}
      </View>

      <TouchableOpacity
        style={s.whatsappBtn}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); Linking.openURL(`https://wa.me/${TUTOR_WHATSAPP}`); }}
        activeOpacity={0.85}
      >
        <View style={s.whatsappIcon}>
          <Feather name="message-circle" size={20} color="#fff" />
        </View>
        <View>
          <Text style={s.whatsappLabel}>Contact Tutor</Text>
          <Text style={s.whatsappSub}>Open WhatsApp chat</Text>
        </View>
        <Feather name="chevron-right" size={18} color="rgba(255,255,255,0.7)" />
      </TouchableOpacity>
    </ScrollView>
  );
}

const innerStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { paddingHorizontal: 16 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
    greeting: { fontSize: 13, fontFamily: "Inter_400Regular" },
    name: { fontSize: 22, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
    badge: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20 },
    badgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
    sectionLabel: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 12, marginTop: 4 },
    announcementsCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
    noAnnounce: { fontSize: 14, fontFamily: "Inter_400Regular" },
    divider: { height: 1, marginVertical: 10 },
    announceRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
    announceDot: { width: 8, height: 8, borderRadius: 4, marginTop: 5, flexShrink: 0 },
    announceTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
    announceBody: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
    announceDate: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 3 },
    whatsappBtn: { backgroundColor: "#25D366", borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 8 },
    whatsappIcon: { width: 40, height: 40, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
    whatsappLabel: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
    whatsappSub: { color: "rgba(255,255,255,0.8)", fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  });
