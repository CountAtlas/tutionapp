import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React from "react";
import {
  Linking,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LoadingState, ErrorState } from "@/components/LoadingState";
import { useColors } from "@/hooks/useColors";
import { useStudent, useBatches } from "@/hooks/useApi";

export default function StudentDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { data: student, isLoading, isError, refetch } = useStudent(id ?? "");
  const { data: allBatches = [] } = useBatches();

  const extraPad = Platform.OS === "web" ? 67 : 0;

  if (isLoading) return <LoadingState message="Loading student…" />;
  if (isError || !student) return <ErrorState onRetry={refetch} />;

  const batches = allBatches.filter((b) => student.batchIds?.includes(b.id));
  const initials = student.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const feeMap = {
    paid: { color: colors.success, bg: colors.successLight },
    pending: { color: colors.warning, bg: colors.warningLight },
    overdue: { color: colors.danger, bg: colors.dangerLight },
  };
  const fs = feeMap[student.feeStatus];

  const callGuardian = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL(`tel:${student.guardianPhone}`);
  };

  const whatsappGuardian = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(`https://wa.me/91${student.guardianPhone}`);
  };

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[
        styles.container,
        { paddingTop: extraPad + 16, paddingBottom: insets.bottom + 40 },
      ]}
      showsVerticalScrollIndicator={false}
    >
      <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
        <Feather name="arrow-left" size={20} color={colors.foreground} />
      </TouchableOpacity>

      {/* Header */}
      <View style={styles.profileHeader}>
        <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
          <Text style={[styles.initials, { color: colors.primary }]}>{initials}</Text>
        </View>
        <Text style={[styles.name, { color: colors.foreground }]}>{student.name}</Text>
        <Text style={[styles.grade, { color: colors.mutedForeground }]}>Grade {student.grade}</Text>
        <View style={[styles.badge, { backgroundColor: fs.bg }]}>
          <Text style={[styles.badgeText, { color: fs.color }]}>
            Fee {student.feeStatus.charAt(0).toUpperCase() + student.feeStatus.slice(1)}
          </Text>
        </View>
      </View>

      {/* Stats */}
      <View style={styles.statsRow}>
        <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: colors.foreground }]}>{student.attendancePercent}%</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Attendance</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: colors.foreground }]}>{batches.length}</Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Batches</Text>
        </View>
        <View style={[styles.statBox, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[styles.statValue, { color: fs.color }]}>
            ₹{(student.feeAmount - student.feePaid).toLocaleString("en-IN")}
          </Text>
          <Text style={[styles.statLabel, { color: colors.mutedForeground }]}>Pending</Text>
        </View>
      </View>

      {/* Guardian */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Guardian</Text>
      <View style={[styles.guardianCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={[styles.guardianAvatar, { backgroundColor: colors.accent }]}>
          <Feather name="user" size={20} color={colors.primary} />
        </View>
        <View style={styles.guardianInfo}>
          <Text style={[styles.guardianName, { color: colors.foreground }]}>{student.guardianName}</Text>
          <Text style={[styles.guardianPhone, { color: colors.mutedForeground }]}>{student.guardianPhone}</Text>
        </View>
        <View style={styles.guardianActions}>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.accent }]} onPress={callGuardian}>
            <Feather name="phone" size={18} color={colors.primary} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.iconBtn, { backgroundColor: "#DCFCE7" }]} onPress={whatsappGuardian}>
            <Feather name="message-circle" size={18} color="#16A34A" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Batches */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Enrolled Batches</Text>
      {batches.length === 0 ? (
        <Text style={[styles.noData, { color: colors.mutedForeground }]}>Not enrolled in any batch</Text>
      ) : (
        batches.map((b) => (
          <View key={b.id} style={[styles.batchRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
            <View style={[styles.batchDot, { backgroundColor: colors.primary }]} />
            <View style={styles.batchInfo}>
              <Text style={[styles.batchName, { color: colors.foreground }]}>{b.name}</Text>
              <Text style={[styles.batchTime, { color: colors.mutedForeground }]}>
                {b.schedule} · {b.time}
              </Text>
            </View>
          </View>
        ))
      )}

      {/* Fee details */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Fee Summary</Text>
      <View style={[styles.feeCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.feeRow}>
          <Text style={[styles.feeLabel, { color: colors.mutedForeground }]}>Monthly Fee</Text>
          <Text style={[styles.feeValue, { color: colors.foreground }]}>
            ₹{student.feeAmount.toLocaleString("en-IN")}
          </Text>
        </View>
        <View style={styles.feeRow}>
          <Text style={[styles.feeLabel, { color: colors.mutedForeground }]}>Paid</Text>
          <Text style={[styles.feeValue, { color: colors.success }]}>
            ₹{student.feePaid.toLocaleString("en-IN")}
          </Text>
        </View>
        <View style={[styles.feeRow, styles.feeTotalRow, { borderTopColor: colors.border }]}>
          <Text style={[styles.feeLabel, { color: colors.foreground, fontFamily: "Inter_600SemiBold" }]}>
            Remaining
          </Text>
          <Text style={[styles.feeValue, { color: fs.color, fontFamily: "Inter_700Bold" }]}>
            ₹{(student.feeAmount - student.feePaid).toLocaleString("en-IN")}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16 },
  backBtn: { marginBottom: 16 },
  profileHeader: { alignItems: "center", marginBottom: 24, gap: 8 },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  initials: { fontSize: 28, fontFamily: "Inter_700Bold" },
  name: { fontSize: 22, fontFamily: "Inter_700Bold" },
  grade: { fontSize: 14, fontFamily: "Inter_400Regular" },
  badge: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20 },
  badgeText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  statBox: { flex: 1, borderRadius: 14, borderWidth: 1, padding: 14, alignItems: "center", gap: 4 },
  statValue: { fontSize: 20, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_400Regular" },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 10 },
  guardianCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 20 },
  guardianAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  guardianInfo: { flex: 1 },
  guardianName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  guardianPhone: { fontSize: 13, fontFamily: "Inter_400Regular" },
  guardianActions: { flexDirection: "row", gap: 8 },
  iconBtn: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  batchRow: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 12, borderWidth: 1, padding: 14, marginBottom: 8 },
  batchDot: { width: 8, height: 8, borderRadius: 4 },
  batchInfo: { flex: 1 },
  batchName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  batchTime: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  noData: { fontSize: 14, fontFamily: "Inter_400Regular", marginBottom: 20 },
  feeCard: { borderRadius: 14, borderWidth: 1, padding: 16, gap: 12 },
  feeRow: { flexDirection: "row", justifyContent: "space-between" },
  feeTotalRow: { borderTopWidth: 1, paddingTop: 12 },
  feeLabel: { fontSize: 14, fontFamily: "Inter_400Regular" },
  feeValue: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
