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
import { LoadingState, ErrorState } from "@/components/LoadingState";
import { useColors } from "@/hooks/useColors";
import { useBatches, ApiBatch } from "@/hooks/useApi";

const SUBJECT_COLORS: Record<string, { bg: string; text: string }> = {
  Mathematics: { bg: "#EFF6FF", text: "#1E40AF" },
  Science: { bg: "#ECFDF5", text: "#065F46" },
  English: { bg: "#FEF3C7", text: "#92400E" },
  Physics: { bg: "#F5F3FF", text: "#4C1D95" },
  Chemistry: { bg: "#FFF1F2", text: "#9F1239" },
};

function BatchCard({ batch, onPress }: { batch: ApiBatch; onPress: () => void }) {
  const colors = useColors();
  const sc = SUBJECT_COLORS[batch.subject] ?? { bg: colors.accent, text: colors.primary };
  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.78}
    >
      <View style={styles.cardTop}>
        <View style={[styles.subjectBadge, { backgroundColor: sc.bg }]}>
          <Text style={[styles.subjectText, { color: sc.text }]}>{batch.subject}</Text>
        </View>
        <View style={[styles.studentsChip, { backgroundColor: colors.accent }]}>
          <Feather name="users" size={12} color={colors.primary} />
          <Text style={[styles.studentsText, { color: colors.primary }]}>{batch.studentCount}</Text>
        </View>
      </View>
      <Text style={[styles.batchName, { color: colors.foreground }]}>{batch.name}</Text>
      <Text style={[styles.grade, { color: colors.mutedForeground }]}>Grade {batch.grade}</Text>
      <View style={styles.scheduleRow}>
        <Feather name="clock" size={13} color={colors.mutedForeground} />
        <Text style={[styles.scheduleText, { color: colors.mutedForeground }]}>{batch.time}</Text>
      </View>
      <View style={styles.scheduleRow}>
        <Feather name="calendar" size={13} color={colors.mutedForeground} />
        <Text style={[styles.scheduleText, { color: colors.mutedForeground }]}>{batch.schedule}</Text>
      </View>
      <View style={[styles.markBtn, { backgroundColor: colors.primary }]}>
        <Feather name="check-square" size={15} color="#fff" />
        <Text style={styles.markBtnText}>Mark Attendance</Text>
      </View>
    </TouchableOpacity>
  );
}

export default function AttendanceScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const { data: batches = [], isLoading, isError, refetch } = useBatches();

  const extraPad = Platform.OS === "web" ? 67 : 0;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom;

  if (isLoading && !batches.length) return <LoadingState message="Loading batches…" />;
  if (isError && !batches.length) return <ErrorState onRetry={refetch} />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={batches}
        keyExtractor={(b) => b.id}
        numColumns={1}
        renderItem={({ item }) => (
          <BatchCard
            batch={item}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push(`/batch-attendance/${item.id}` as any);
            }}
          />
        )}
        contentContainerStyle={[
          styles.list,
          { paddingTop: extraPad + 16, paddingBottom: bottomPad + 90 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />
        }
        ListHeaderComponent={
          <Text style={[styles.header, { color: colors.mutedForeground }]}>
            Select a batch to mark attendance
          </Text>
        }
        ListEmptyComponent={
          <EmptyState icon="book" title="No batches yet" subtitle="Add batches to start tracking attendance" />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 16, gap: 0 },
  header: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 12 },
  card: {
    borderRadius: 16,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
    gap: 6,
  },
  cardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 4 },
  subjectBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  subjectText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  studentsChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  studentsText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  batchName: { fontSize: 17, fontFamily: "Inter_700Bold", letterSpacing: -0.2 },
  grade: { fontSize: 13, fontFamily: "Inter_400Regular" },
  scheduleRow: { flexDirection: "row", alignItems: "center", gap: 6 },
  scheduleText: { fontSize: 13, fontFamily: "Inter_400Regular" },
  markBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    borderRadius: 12,
    paddingVertical: 12,
    marginTop: 8,
  },
  markBtnText: { color: "#fff", fontSize: 14, fontFamily: "Inter_600SemiBold" },
});
