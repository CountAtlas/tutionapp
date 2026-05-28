import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import { useNotifications } from "@/hooks/useApi";

interface MenuItemProps {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  subtitle: string;
  color: string;
  bg: string;
  onPress: () => void;
  badge?: number;
}

function MenuItem({ icon, label, subtitle, color, bg, onPress, badge }: MenuItemProps) {
  const colors = useColors();
  return (
    <TouchableOpacity
      style={[styles.menuItem, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[styles.menuIcon, { backgroundColor: bg }]}>
        <Feather name={icon} size={22} color={color} />
      </View>
      <View style={styles.menuText}>
        <Text style={[styles.menuLabel, { color: colors.foreground }]}>{label}</Text>
        <Text style={[styles.menuSub, { color: colors.mutedForeground }]}>{subtitle}</Text>
      </View>
      {badge !== undefined && badge > 0 && (
        <View style={[styles.badge, { backgroundColor: colors.danger }]}>
          <Text style={styles.badgeText}>{badge}</Text>
        </View>
      )}
      <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
    </TouchableOpacity>
  );
}

export default function MoreScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();

  const { data: notifications = [] } = useNotifications();
  const unread = notifications.filter((n) => !n.isRead).length;

  const extraPad = Platform.OS === "web" ? 67 : 0;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom;

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.container,
        { paddingTop: extraPad + 16, paddingBottom: bottomPad + 90 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile card */}
      <View style={[styles.profileCard, { backgroundColor: colors.primary }]}>
        <View style={styles.profileAvatar}>
          <Text style={styles.profileInitials}>
            {user?.name?.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase() ?? "T"}
          </Text>
        </View>
        <View style={styles.profileInfo}>
          <Text style={styles.profileName}>{user?.name ?? "Tutor"}</Text>
          <Text style={styles.profileEmail}>{user?.phone ?? ""}</Text>
          <View style={[styles.roleBadge, { backgroundColor: "rgba(255,255,255,0.2)" }]}>
            <Text style={styles.roleText}>
              {user?.role === "guardian" ? "Parent / Guardian" : "Tutor"}
            </Text>
          </View>
        </View>
      </View>

      <Text style={[styles.section, { color: colors.mutedForeground }]}>Manage</Text>
      <MenuItem
        icon="calendar"
        label="Schedule"
        subtitle="View weekly timetable"
        color={colors.info}
        bg={colors.infoLight}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push("/schedule" as any); }}
      />
      <MenuItem
        icon="bell"
        label="Notifications"
        subtitle="Reminders and alerts"
        color={colors.warning}
        bg={colors.warningLight}
        badge={unread}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push("/notifications" as any); }}
      />
      <MenuItem
        icon="users"
        label="Guardians"
        subtitle="Parent contacts and profiles"
        color={colors.success}
        bg={colors.successLight}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light); router.push("/guardians" as any); }}
      />

      <Text style={[styles.section, { color: colors.mutedForeground }]}>Account</Text>
      <TouchableOpacity
        style={[styles.logoutBtn, { backgroundColor: colors.dangerLight, borderColor: colors.danger + "30" }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          logout();
        }}
        activeOpacity={0.8}
      >
        <Feather name="log-out" size={18} color={colors.danger} />
        <Text style={[styles.logoutText, { color: colors.danger }]}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16 },
  profileCard: { borderRadius: 18, padding: 20, flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 24 },
  profileAvatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center" },
  profileInitials: { color: "#fff", fontSize: 20, fontFamily: "Inter_700Bold" },
  profileInfo: { flex: 1, gap: 3 },
  profileName: { color: "#fff", fontSize: 18, fontFamily: "Inter_700Bold" },
  profileEmail: { color: "rgba(255,255,255,0.75)", fontSize: 13, fontFamily: "Inter_400Regular" },
  roleBadge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, marginTop: 4 },
  roleText: { color: "#fff", fontSize: 11, fontFamily: "Inter_600SemiBold" },
  section: { fontSize: 12, fontFamily: "Inter_600SemiBold", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 8, marginTop: 4 },
  menuItem: { flexDirection: "row", alignItems: "center", gap: 14, borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10 },
  menuIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  menuText: { flex: 1 },
  menuLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  menuSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
  badge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 12, minWidth: 22, alignItems: "center" },
  badgeText: { color: "#fff", fontSize: 11, fontFamily: "Inter_700Bold" },
  logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderRadius: 14, borderWidth: 1, paddingVertical: 14 },
  logoutText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
});
