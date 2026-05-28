import { Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  FlatList,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LoadingState, ErrorState } from "@/components/LoadingState";
import { useColors } from "@/hooks/useColors";
import {
  useAttendance,
  useSubmitAttendance,
  ApiAttendanceRecord,
} from "@/hooks/useApi";

type Status = "present" | "absent" | "late" | "unmarked";

const STATUS_ORDER: Status[] = ["present", "absent", "late"];

const STATUS_CONFIG: Record<Status, { label: string; icon: keyof typeof Feather.glyphMap; short: string }> = {
  present: { label: "Present", icon: "check-circle", short: "P" },
  absent: { label: "Absent", icon: "x-circle", short: "A" },
  late: { label: "Late", icon: "clock", short: "L" },
  unmarked: { label: "Mark", icon: "circle", short: "?" },
};

const OFFLINE_QUEUE_KEY = "attendance_offline_queue";

interface QueuedItem {
  batchId: string;
  date: string;
  records: ApiAttendanceRecord[];
  queuedAt: number;
}

async function enqueueAttendance(item: QueuedItem) {
  try {
    const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    const queue: QueuedItem[] = raw ? JSON.parse(raw) : [];
    const filtered = queue.filter(
      (q) => !(q.batchId === item.batchId && q.date === item.date)
    );
    filtered.push(item);
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(filtered));
  } catch {}
}

async function dequeueAttendance(batchId: string, date: string) {
  try {
    const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
    const queue: QueuedItem[] = raw ? JSON.parse(raw) : [];
    const filtered = queue.filter(
      (q) => !(q.batchId === batchId && q.date === date)
    );
    await AsyncStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(filtered));
  } catch {}
}

function StudentAttendanceRow({
  record,
  onToggle,
}: {
  record: ApiAttendanceRecord;
  onToggle: (id: string) => void;
}) {
  const colors = useColors();
  const status = record.status as Status;
  const colorMap: Record<Status, string> = {
    present: colors.success,
    absent: colors.danger,
    late: colors.warning,
    unmarked: colors.mutedForeground,
  };
  const bgMap: Record<Status, string> = {
    present: colors.successLight,
    absent: colors.dangerLight,
    late: colors.warningLight,
    unmarked: colors.secondary,
  };

  const c = colorMap[status];
  const bg = bgMap[status];
  const cfg = STATUS_CONFIG[status];
  const initials = record.studentName.split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  return (
    <View style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}>
      <View style={[styles.studentAvatar, { backgroundColor: colors.accent }]}>
        <Text style={[styles.initials, { color: colors.primary }]}>{initials}</Text>
      </View>
      <Text style={[styles.studentName, { color: colors.foreground }]}>{record.studentName}</Text>
      <TouchableOpacity
        style={[styles.statusBtn, { backgroundColor: bg, borderColor: c + "40" }]}
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onToggle(record.studentId);
        }}
        activeOpacity={0.75}
      >
        <Feather name={cfg.icon} size={14} color={c} />
        <Text style={[styles.statusText, { color: c }]}>{cfg.label}</Text>
      </TouchableOpacity>
    </View>
  );
}

export default function BatchAttendanceScreen() {
  const { batchId } = useLocalSearchParams<{ batchId: string }>();
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const today = new Date().toISOString().split("T")[0];

  const {
    data: session,
    isLoading,
    isError,
    refetch,
  } = useAttendance(batchId ?? "", today);

  const { mutateAsync: submitAttendance, isPending: saving } = useSubmitAttendance();

  const [records, setRecords] = useState<ApiAttendanceRecord[]>([]);
  const [saved, setSaved] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const initializedRef = useRef(false);

  // Initialize records from API response
  useEffect(() => {
    if (session?.records && !initializedRef.current) {
      setRecords(session.records.map((r) => ({ ...r })));
      initializedRef.current = true;
    }
  }, [session]);

  // Flush offline queue on mount
  useEffect(() => {
    (async () => {
      try {
        const raw = await AsyncStorage.getItem(OFFLINE_QUEUE_KEY);
        const queue: QueuedItem[] = raw ? JSON.parse(raw) : [];
        if (queue.length === 0) return;

        for (const item of queue) {
          try {
            await submitAttendance(item);
            await dequeueAttendance(item.batchId, item.date);
          } catch {
            // Still offline, leave in queue
          }
        }
      } catch {}
    })();
  }, []);

  const toggle = (id: string) => {
    setRecords((prev) =>
      prev.map((r) => {
        if (r.studentId !== id) return r;
        const cur = (r.status === "unmarked" ? "present" : r.status) as Status;
        const idx = STATUS_ORDER.indexOf(cur);
        const next = STATUS_ORDER[(idx + 1) % STATUS_ORDER.length];
        return { ...r, status: next };
      })
    );
  };

  const markAll = (status: Status) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setRecords((prev) => prev.map((r) => ({ ...r, status })));
  };

  const handleSave = async () => {
    const unmarked = records.filter((r) => r.status === "unmarked").length;

    const doSave = async () => {
      try {
        await submitAttendance({ batchId: batchId!, date: today, records });
        setIsOffline(false);
        await dequeueAttendance(batchId!, today);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        setSaved(true);
        Alert.alert("Saved", "Attendance saved successfully!", [
          { text: "OK", onPress: () => router.back() },
        ]);
      } catch {
        // Save to offline queue
        await enqueueAttendance({ batchId: batchId!, date: today, records, queuedAt: Date.now() });
        setIsOffline(true);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        setSaved(true);
        Alert.alert(
          "Saved Offline",
          "Could not reach the server. Attendance saved locally and will sync automatically when back online.",
          [{ text: "OK", onPress: () => router.back() }]
        );
      }
    };

    if (unmarked > 0) {
      Alert.alert(
        "Unmarked students",
        `${unmarked} student(s) not marked. Save anyway?`,
        [
          { text: "Cancel", style: "cancel" },
          { text: "Save", onPress: doSave },
        ]
      );
      return;
    }
    await doSave();
  };

  const presentCount = records.filter((r) => r.status === "present").length;
  const absentCount = records.filter((r) => r.status === "absent").length;
  const lateCount = records.filter((r) => r.status === "late").length;

  const extraPad = Platform.OS === "web" ? 67 : 0;

  if (isLoading && !session) return <LoadingState message="Loading students…" />;
  if (isError && !session) return <ErrorState onRetry={refetch} />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={records}
        keyExtractor={(r) => r.studentId}
        renderItem={({ item }) => (
          <StudentAttendanceRow record={item} onToggle={toggle} />
        )}
        contentContainerStyle={[
          styles.list,
          { paddingTop: extraPad + 8, paddingBottom: insets.bottom + 120 },
        ]}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Feather name="arrow-left" size={20} color={colors.foreground} />
            </TouchableOpacity>

            <Text style={[styles.batchName, { color: colors.foreground }]}>
              {session?.batchName ?? batchId}
            </Text>
            <Text style={[styles.batchInfo, { color: colors.mutedForeground }]}>
              {today} · {records.length} students
            </Text>

            {isOffline && (
              <View style={[styles.offlineBanner, { backgroundColor: colors.warningLight }]}>
                <Feather name="wifi-off" size={13} color={colors.warning} />
                <Text style={[styles.offlineText, { color: colors.warning }]}>
                  Offline — will sync when connected
                </Text>
              </View>
            )}

            {/* Stats */}
            <View style={styles.statsRow}>
              <View style={[styles.statChip, { backgroundColor: colors.successLight }]}>
                <Text style={[styles.statNum, { color: colors.success }]}>{presentCount}</Text>
                <Text style={[styles.statLabel, { color: colors.success }]}>Present</Text>
              </View>
              <View style={[styles.statChip, { backgroundColor: colors.dangerLight }]}>
                <Text style={[styles.statNum, { color: colors.danger }]}>{absentCount}</Text>
                <Text style={[styles.statLabel, { color: colors.danger }]}>Absent</Text>
              </View>
              <View style={[styles.statChip, { backgroundColor: colors.warningLight }]}>
                <Text style={[styles.statNum, { color: colors.warning }]}>{lateCount}</Text>
                <Text style={[styles.statLabel, { color: colors.warning }]}>Late</Text>
              </View>
            </View>

            {/* Bulk Actions */}
            <View style={styles.bulkRow}>
              <TouchableOpacity
                style={[styles.bulkBtn, { backgroundColor: colors.successLight }]}
                onPress={() => markAll("present")}
              >
                <Feather name="check-circle" size={14} color={colors.success} />
                <Text style={[styles.bulkText, { color: colors.success }]}>All Present</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.bulkBtn, { backgroundColor: colors.dangerLight }]}
                onPress={() => markAll("absent")}
              >
                <Feather name="x-circle" size={14} color={colors.danger} />
                <Text style={[styles.bulkText, { color: colors.danger }]}>All Absent</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.hint, { color: colors.mutedForeground }]}>
              Tap status to cycle: Present → Absent → Late
            </Text>
          </View>
        }
      />

      {/* Save button */}
      <View
        style={[
          styles.saveBar,
          {
            backgroundColor: colors.background,
            borderTopColor: colors.border,
            paddingBottom: insets.bottom + (Platform.OS === "web" ? 34 : 0) + 8,
          },
        ]}
      >
        <TouchableOpacity
          style={[styles.saveBtn, { backgroundColor: saved ? colors.success : colors.primary }]}
          onPress={handleSave}
          activeOpacity={0.85}
          disabled={saving}
        >
          <Feather name={saved ? "check" : saving ? "loader" : "save"} size={18} color="#fff" />
          <Text style={styles.saveBtnText}>
            {saving ? "Saving…" : saved ? "Saved" : "Save Attendance"}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 16 },
  header: { marginBottom: 12 },
  backBtn: { marginBottom: 12 },
  batchName: { fontSize: 20, fontFamily: "Inter_700Bold" },
  batchInfo: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 10 },
  offlineBanner: { flexDirection: "row", alignItems: "center", gap: 6, borderRadius: 8, padding: 10, marginBottom: 10 },
  offlineText: { fontSize: 12, fontFamily: "Inter_500Medium" },
  statsRow: { flexDirection: "row", gap: 10, marginBottom: 14 },
  statChip: { flex: 1, borderRadius: 12, padding: 12, alignItems: "center", gap: 2 },
  statNum: { fontSize: 22, fontFamily: "Inter_700Bold" },
  statLabel: { fontSize: 11, fontFamily: "Inter_500Medium" },
  bulkRow: { flexDirection: "row", gap: 10, marginBottom: 10 },
  bulkBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 10, paddingVertical: 10 },
  bulkText: { fontSize: 13, fontFamily: "Inter_600SemiBold" },
  hint: { fontSize: 12, fontFamily: "Inter_400Regular", marginBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 8 },
  studentAvatar: { width: 42, height: 42, borderRadius: 21, alignItems: "center", justifyContent: "center" },
  initials: { fontSize: 15, fontFamily: "Inter_700Bold" },
  studentName: { flex: 1, fontSize: 14, fontFamily: "Inter_500Medium" },
  statusBtn: { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10, borderWidth: 1 },
  statusText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
  saveBar: { position: "absolute", bottom: 0, left: 0, right: 0, borderTopWidth: 1, padding: 16, paddingTop: 12 },
  saveBtn: { borderRadius: 14, paddingVertical: 15, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8 },
  saveBtnText: { color: "#fff", fontSize: 16, fontFamily: "Inter_600SemiBold" },
});
