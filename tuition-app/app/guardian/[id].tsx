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
import { useGuardian } from "@/hooks/useApi";

export default function GuardianDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { data: guardian, isLoading, isError, refetch } = useGuardian(id ?? "");

  const extraPad = Platform.OS === "web" ? 67 : 0;

  if (isLoading) return <LoadingState message="Loading guardian…" />;
  if (isError || !guardian) return <ErrorState onRetry={refetch} />;

  const initials = guardian.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

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

      <View style={styles.profileHeader}>
        <View style={[styles.avatar, { backgroundColor: colors.successLight }]}>
          <Text style={[styles.initials, { color: colors.success }]}>{initials}</Text>
        </View>
        <Text style={[styles.name, { color: colors.foreground }]}>{guardian.name}</Text>
        <Text style={[styles.role, { color: colors.mutedForeground }]}>
          Guardian · {guardian.students.length} student{guardian.students.length !== 1 ? "s" : ""}
        </Text>
      </View>

      {/* Contact Actions */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.primary }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            Linking.openURL(`tel:${guardian.phone}`);
          }}
        >
          <Feather name="phone" size={18} color="#fff" />
          <Text style={styles.actionText}>Call</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: "#16A34A" }]}
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Linking.openURL(`https://wa.me/91${guardian.whatsapp ?? guardian.phone}`);
          }}
        >
          <Feather name="message-circle" size={18} color="#fff" />
          <Text style={styles.actionText}>WhatsApp</Text>
        </TouchableOpacity>
        {guardian.email && (
          <TouchableOpacity
            style={[styles.actionBtn, { backgroundColor: colors.info }]}
            onPress={() => Linking.openURL(`mailto:${guardian.email}`)}
          >
            <Feather name="mail" size={18} color="#fff" />
            <Text style={styles.actionText}>Email</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Contact Info */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Contact Details</Text>
      <View style={[styles.infoCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.infoRow}>
          <Feather name="phone" size={16} color={colors.mutedForeground} />
          <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Phone</Text>
          <Text style={[styles.infoValue, { color: colors.foreground }]}>{guardian.phone}</Text>
        </View>
        {guardian.email && (
          <View style={[styles.infoRow, styles.infoRowBorder, { borderTopColor: colors.border }]}>
            <Feather name="mail" size={16} color={colors.mutedForeground} />
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Email</Text>
            <Text style={[styles.infoValue, { color: colors.foreground }]}>{guardian.email}</Text>
          </View>
        )}
        {guardian.address && (
          <View style={[styles.infoRow, styles.infoRowBorder, { borderTopColor: colors.border }]}>
            <Feather name="map-pin" size={16} color={colors.mutedForeground} />
            <Text style={[styles.infoLabel, { color: colors.mutedForeground }]}>Address</Text>
            <Text style={[styles.infoValue, { color: colors.foreground, flex: 1 }]}>{guardian.address}</Text>
          </View>
        )}
      </View>

      {/* Students */}
      <Text style={[styles.sectionTitle, { color: colors.foreground }]}>Children</Text>
      {guardian.students.map((s) => {
        const feeStatus = ((s as Record<string, unknown>).feeStatus as "paid" | "pending" | "overdue") ?? "pending";
        const feeMap: Record<"paid" | "pending" | "overdue", { color: string; bg: string }> = {
          paid: { color: colors.success, bg: colors.successLight },
          pending: { color: colors.warning, bg: colors.warningLight },
          overdue: { color: colors.danger, bg: colors.dangerLight },
        };
        const fc = feeMap[feeStatus] ?? feeMap.pending;
        return (
          <TouchableOpacity
            key={s.id}
            style={[styles.studentCard, { backgroundColor: colors.card, borderColor: colors.border }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push(`/student/${s.id}` as any);
            }}
            activeOpacity={0.78}
          >
            <View style={[styles.studentAvatar, { backgroundColor: colors.accent }]}>
              <Text style={[styles.studentInitials, { color: colors.primary }]}>
                {s.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase()}
              </Text>
            </View>
            <View style={styles.studentInfo}>
              <Text style={[styles.studentName, { color: colors.foreground }]}>{s.name}</Text>
              <Text style={[styles.studentGrade, { color: colors.mutedForeground }]}>Grade {s.grade}</Text>
            </View>
            <Feather name="chevron-right" size={16} color={colors.mutedForeground} />
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16 },
  backBtn: { marginBottom: 16 },
  profileHeader: { alignItems: "center", marginBottom: 20, gap: 6 },
  avatar: { width: 80, height: 80, borderRadius: 40, alignItems: "center", justifyContent: "center", marginBottom: 4 },
  initials: { fontSize: 28, fontFamily: "Inter_700Bold" },
  name: { fontSize: 22, fontFamily: "Inter_700Bold" },
  role: { fontSize: 14, fontFamily: "Inter_400Regular" },
  actionRow: { flexDirection: "row", gap: 10, marginBottom: 24 },
  actionBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 12, paddingVertical: 12 },
  actionText: { color: "#fff", fontSize: 13, fontFamily: "Inter_600SemiBold" },
  sectionTitle: { fontSize: 15, fontFamily: "Inter_700Bold", marginBottom: 10 },
  infoCard: { borderRadius: 14, borderWidth: 1, padding: 16, marginBottom: 20 },
  infoRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6 },
  infoRowBorder: { borderTopWidth: 1, marginTop: 6, paddingTop: 12 },
  infoLabel: { fontSize: 13, fontFamily: "Inter_400Regular", width: 56 },
  infoValue: { fontSize: 13, fontFamily: "Inter_500Medium" },
  studentCard: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10 },
  studentAvatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  studentInitials: { fontSize: 16, fontFamily: "Inter_700Bold" },
  studentInfo: { flex: 1 },
  studentName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  studentGrade: { fontSize: 12, fontFamily: "Inter_400Regular" },
  feeBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  feeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
});
