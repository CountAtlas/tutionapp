import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React from "react";
import {
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { StatsCard } from "@/components/StatsCard";
import { LoadingState, ErrorState } from "@/components/LoadingState";
import { useColors } from "@/hooks/useColors";
import { useAuth } from "@/contexts/AuthContext";
import { useDashboardStats, useSchedule } from "@/hooks/useApi";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function DashboardScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user, logout } = useAuth();

  const today = DAYS[new Date().getDay()];
  const {
    data: stats,
    isLoading: statsLoading,
    isError: statsError,
    refetch: refetchStats,
  } = useDashboardStats();
  const {
    data: schedule = [],
    isLoading: schedLoading,
    refetch: refetchSched,
  } = useSchedule(today);

  const isRefreshing = statsLoading || schedLoading;

  const onRefresh = async () => {
    await Promise.all([refetchStats(), refetchSched()]);
  };

  const quickActions = [
    { label: "Attendance", icon: "check-square" as const, route: "/(tabs)/attendance" },
    { label: "Collect Fee", icon: "dollar-sign" as const, route: "/(tabs)/fees" },
    { label: "Add Student", icon: "user-plus" as const, route: "/(tabs)/students" },
    { label: "Schedule", icon: "calendar" as const, route: "/schedule" },
  ];

  const extraPad = Platform.OS === "web" ? 67 : 0;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom;

  if (statsLoading && !stats) return <LoadingState message="Loading dashboard…" />;
  if (statsError && !stats) return <ErrorState onRetry={refetchStats} />;

  const s = stats ?? {
    totalStudents: 0,
    pendingFees: 0,
    monthlyEarnings: 0,
    todayClasses: 0,
    overdueFees: 0,
    presentToday: 0,
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.container,
        { paddingTop: extraPad + 16, paddingBottom: bottomPad + 100 },
      ]}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={onRefresh}
          tintColor={colors.primary}
        />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Header */}
      <View style={styles.topRow}>
        <View>
          <Text style={[styles.greeting, { color: colors.mutedForeground }]}>Good morning,</Text>
          <Text style={[styles.name, { color: colors.foreground }]}>{user?.name ?? "Tutor"}</Text>
        </View>
        <TouchableOpacity
          style={[styles.avatarBtn, { backgroundColor: colors.primary }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            logout();
          }}
        >
          <Feather name="log-out" size={18} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* Stats Grid */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Overview</Text>
      <View style={styles.statsGrid}>
        <StatsCard
          title="Students"
          value={s.totalStudents}
          icon="users"
          color={colors.primary}
          bgColor={colors.accent}
          onPress={() => router.push("/(tabs)/students")}
        />
        <StatsCard
          title="Today's Classes"
          value={s.todayClasses}
          icon="book"
          color={colors.success}
          bgColor={colors.successLight}
          onPress={() => router.push("/schedule")}
        />
      </View>
      <View style={styles.statsGrid}>
        <StatsCard
          title="Pending Fees"
          value={s.pendingFees}
          icon="clock"
          color={colors.warning}
          bgColor={colors.warningLight}
          onPress={() => router.push("/(tabs)/fees")}
          subtitle="students"
        />
        <StatsCard
          title="Overdue"
          value={s.overdueFees}
          icon="alert-circle"
          color={colors.danger}
          bgColor={colors.dangerLight}
          onPress={() => router.push("/(tabs)/fees")}
          subtitle="students"
        />
      </View>
      <View style={[styles.earningsCard, { backgroundColor: colors.primary }]}>
        <View>
          <Text style={styles.earningsLabel}>Monthly Earnings</Text>
          <Text style={styles.earningsValue}>₹{s.monthlyEarnings.toLocaleString("en-IN")}</Text>
        </View>
        <View style={[styles.earningsIcon, { backgroundColor: "rgba(255,255,255,0.15)" }]}>
          <Feather name="trending-up" size={22} color="#fff" />
        </View>
      </View>

      {/* Quick Actions */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Quick Actions</Text>
      <View style={styles.quickActions}>
        {quickActions.map((a) => (
          <TouchableOpacity
            key={a.label}
            style={[styles.quickAction, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push(a.route as any);
            }}
            activeOpacity={0.75}
          >
            <View style={[styles.qaIcon, { backgroundColor: colors.accent }]}>
              <Feather name={a.icon} size={20} color={colors.primary} />
            </View>
            <Text style={[styles.qaLabel, { color: colors.foreground }]}>{a.label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Today's Classes */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Today's Classes</Text>
      {schedule.length === 0 ? (
        <View style={[styles.emptyToday, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="coffee" size={24} color={colors.mutedForeground} />
          <Text style={[styles.emptyTodayText, { color: colors.mutedForeground }]}>
            No classes today — enjoy your break!
          </Text>
        </View>
      ) : (
        schedule.map((cls) => (
          <TouchableOpacity
            key={cls.id}
            style={[styles.classCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => router.push(`/batch-attendance/${cls.batchId}` as any)}
            activeOpacity={0.8}
          >
            <View style={[styles.classTime, { backgroundColor: colors.accent }]}>
              <Feather name="clock" size={14} color={colors.primary} />
              <Text style={[styles.classTimeText, { color: colors.primary }]}>{cls.time}</Text>
            </View>
            <View style={styles.classInfo}>
              <Text style={[styles.className, { color: colors.foreground }]}>{cls.batchName}</Text>
              <Text style={[styles.classSubject, { color: colors.mutedForeground }]}>
                {cls.subject} · {cls.studentCount} students
              </Text>
            </View>
            <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16 },
  topRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
  greeting: { fontSize: 13, fontFamily: "Inter_400Regular" },
  name: { fontSize: 22, fontFamily: "Inter_700Bold", letterSpacing: -0.3 },
  avatarBtn: { width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center" },
  sectionTitle: { fontSize: 16, fontFamily: "Inter_700Bold", marginBottom: 12, marginTop: 8 },
  statsGrid: { flexDirection: "row", gap: 12, marginBottom: 12 },
  earningsCard: { borderRadius: 14, padding: 20, flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 },
  earningsLabel: { color: "rgba(255,255,255,0.75)", fontSize: 13, fontFamily: "Inter_400Regular" },
  earningsValue: { color: "#fff", fontSize: 28, fontFamily: "Inter_700Bold", letterSpacing: -0.5, marginTop: 2 },
  earningsIcon: { width: 48, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  quickActions: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 8 },
  quickAction: { width: "47%", borderRadius: 14, borderWidth: 1, padding: 16, alignItems: "center", gap: 8 },
  qaIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  qaLabel: { fontSize: 13, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  emptyToday: { borderRadius: 14, borderWidth: 1, padding: 24, alignItems: "center", gap: 8 },
  emptyTodayText: { fontSize: 14, fontFamily: "Inter_400Regular", textAlign: "center" },
  classCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10 },
  classTime: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8, flexDirection: "row", alignItems: "center", gap: 4 },
  classTimeText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  classInfo: { flex: 1 },
  className: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  classSubject: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
});
