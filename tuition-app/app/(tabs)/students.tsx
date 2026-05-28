import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
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
import { SearchBar } from "@/components/SearchBar";
import { LoadingState, ErrorState } from "@/components/LoadingState";
import { useColors } from "@/hooks/useColors";
import { useStudents, ApiStudent } from "@/hooks/useApi";

function FeeStatusBadge({ status }: { status: ApiStudent["feeStatus"] }) {
  const colors = useColors();
  const map = {
    paid: { label: "Paid", bg: colors.successLight, text: colors.success },
    pending: { label: "Pending", bg: colors.warningLight, text: colors.warning },
    overdue: { label: "Overdue", bg: colors.dangerLight, text: colors.danger },
  };
  const c = map[status];
  return (
    <View style={[styles.badge, { backgroundColor: c.bg }]}>
      <Text style={[styles.badgeText, { color: c.text }]}>{c.label}</Text>
    </View>
  );
}

function StudentRow({ student, onPress }: { student: ApiStudent; onPress: () => void }) {
  const colors = useColors();
  const initials = student.name.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();
  return (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.75}
    >
      <View style={[styles.avatar, { backgroundColor: colors.accent }]}>
        <Text style={[styles.avatarText, { color: colors.primary }]}>{initials}</Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.studentName, { color: colors.foreground }]}>{student.name}</Text>
        <Text style={[styles.grade, { color: colors.mutedForeground }]}>
          {student.grade} · {student.batchIds.length} batch{student.batchIds.length !== 1 ? "es" : ""}
        </Text>
        <Text style={[styles.guardian, { color: colors.mutedForeground }]}>
          <Feather name="phone" size={11} /> {student.guardianPhone}
        </Text>
      </View>
      <View style={styles.right}>
        <FeeStatusBadge status={student.feeStatus} />
        <Text style={[styles.attendance, { color: colors.mutedForeground }]}>
          {student.attendancePercent}% att.
        </Text>
      </View>
    </TouchableOpacity>
  );
}

export default function StudentsScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "overdue">("all");

  const { data: allStudents = [], isLoading, isError, refetch } = useStudents(search);

  const students = useMemo(() => {
    if (filter === "all") return allStudents;
    return allStudents.filter((s) => s.feeStatus === filter);
  }, [allStudents, filter]);

  const extraPad = Platform.OS === "web" ? 67 : 0;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom;

  if (isLoading && !allStudents.length) return <LoadingState message="Loading students…" />;
  if (isError && !allStudents.length) return <ErrorState onRetry={refetch} />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={students}
        keyExtractor={(s) => s.id}
        renderItem={({ item }) => (
          <StudentRow
            student={item}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push(`/student/${item.id}` as any);
            }}
          />
        )}
        contentContainerStyle={[
          styles.list,
          { paddingTop: extraPad + 8, paddingBottom: bottomPad + 90 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />
        }
        ListHeaderComponent={
          <View>
            <SearchBar
              value={search}
              onChangeText={setSearch}
              placeholder="Search students, guardians…"
            />
            <View style={styles.filters}>
              {(["all", "pending", "overdue"] as const).map((f) => (
                <TouchableOpacity
                  key={f}
                  style={[
                    styles.chip,
                    {
                      backgroundColor: filter === f ? colors.primary : colors.card,
                      borderColor: filter === f ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                    setFilter(f);
                  }}
                >
                  <Text style={[styles.chipText, { color: filter === f ? "#fff" : colors.foreground }]}>
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState
            icon="users"
            title={search ? "No results" : "No students yet"}
            subtitle={search ? "Try a different search term" : "Students will appear here"}
          />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 16 },
  filters: { flexDirection: "row", gap: 8, marginBottom: 12, flexWrap: "wrap" },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20, borderWidth: 1 },
  chipText: { fontSize: 13, fontFamily: "Inter_500Medium" },
  row: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10 },
  avatar: { width: 44, height: 44, borderRadius: 22, alignItems: "center", justifyContent: "center" },
  avatarText: { fontSize: 15, fontFamily: "Inter_700Bold" },
  info: { flex: 1, gap: 3 },
  studentName: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  grade: { fontSize: 12, fontFamily: "Inter_400Regular" },
  guardian: { fontSize: 12, fontFamily: "Inter_400Regular" },
  right: { alignItems: "flex-end", gap: 6 },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  attendance: { fontSize: 11, fontFamily: "Inter_400Regular" },
});
