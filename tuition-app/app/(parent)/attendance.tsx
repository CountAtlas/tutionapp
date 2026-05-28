import { Feather } from "@expo/vector-icons";
import React, { useState } from "react";
import {
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
import { useColors } from "@/hooks/useColors";
import { useParentChildren, ApiParentChild } from "@/hooks/useApi";

function AttendanceRing({ pct, colors }: { pct: number; colors: ReturnType<typeof useColors> }) {
  const color = pct >= 90 ? colors.success : pct >= 75 ? colors.warning : colors.danger;
  const bg = pct >= 90 ? colors.successLight : pct >= 75 ? colors.warningLight : colors.dangerLight;
  const label = pct >= 90 ? "Excellent" : pct >= 75 ? "Satisfactory" : "Needs attention";
  return (
    <View style={[ringStyles.wrap, { backgroundColor: bg }]}>
      <Text style={[ringStyles.pct, { color }]}>{pct}%</Text>
      <Text style={[ringStyles.label, { color }]}>{label}</Text>
    </View>
  );
}

const ringStyles = StyleSheet.create({
  wrap: { alignItems: "center", justifyContent: "center", width: 120, height: 120, borderRadius: 60, alignSelf: "center" },
  pct: { fontSize: 32, fontFamily: "Inter_700Bold" },
  label: { fontSize: 11, fontFamily: "Inter_600SemiBold", marginTop: 2 },
});

function ProgressBar({ pct, colors }: { pct: number; colors: ReturnType<typeof useColors> }) {
  const color = pct >= 90 ? colors.success : pct >= 75 ? colors.warning : colors.danger;
  return (
    <View style={[barStyles.track, { backgroundColor: colors.secondary }]}>
      <View style={[barStyles.fill, { width: `${pct}%` as any, backgroundColor: color }]} />
    </View>
  );
}

const barStyles = StyleSheet.create({
  track: { height: 8, borderRadius: 4, overflow: "hidden" },
  fill: { height: 8, borderRadius: 4 },
});

function ChildAttendanceView({ child, colors }: { child: ApiParentChild; colors: ReturnType<typeof useColors> }) {
  return (
    <View style={childStyles.section}>
      <AttendanceRing pct={child.attendancePercent} colors={colors} />
      <Text style={[childStyles.overallLabel, { color: colors.mutedForeground, marginTop: 12, textAlign: "center" }]}>
        Overall attendance this term
      </Text>

      {child.batches && child.batches.length > 0 && (
        <>
          <Text style={[childStyles.batchHeader, { color: colors.foreground, marginTop: 20 }]}>By Subject</Text>
          {child.batches.map((batch) => (
            <View key={batch.id} style={[childStyles.batchCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={childStyles.batchTop}>
                <View>
                  <Text style={[childStyles.batchName, { color: colors.foreground }]}>{batch.name}</Text>
                  <Text style={[childStyles.batchSchedule, { color: colors.mutedForeground }]}>
                    {batch.schedule} · {batch.time}
                  </Text>
                </View>
                <Text style={[childStyles.batchPct, {
                  color: batch.attendancePercent >= 90 ? colors.success : batch.attendancePercent >= 75 ? colors.warning : colors.danger,
                }]}>
                  {batch.attendancePercent}%
                </Text>
              </View>
              <ProgressBar pct={batch.attendancePercent} colors={colors} />
            </View>
          ))}
        </>
      )}
    </View>
  );
}

const childStyles = StyleSheet.create({
  section: { paddingBottom: 16 },
  overallLabel: { fontSize: 13, fontFamily: "Inter_400Regular" },
  batchHeader: { fontSize: 14, fontFamily: "Inter_700Bold", marginBottom: 10 },
  batchCard: { borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10, gap: 10 },
  batchTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  batchName: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  batchSchedule: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
  batchPct: { fontSize: 18, fontFamily: "Inter_700Bold" },
});

export default function ParentAttendanceScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);

  const { data: children = [], isLoading, refetch } = useParentChildren();

  const extraPad = Platform.OS === "web" ? 67 : 0;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom;

  if (isLoading && !children.length) return <LoadingState message="Loading attendance…" />;

  const s = innerStyles(colors);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[s.container, { paddingTop: extraPad + 16, paddingBottom: bottomPad + 100 }]}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[s.title, { color: colors.foreground }]}>Attendance</Text>

      {children.length > 1 && (
        <View style={s.pills}>
          {children.map((child, i) => (
            <TouchableOpacity
              key={child.id}
              style={[s.pill, {
                backgroundColor: i === activeIndex ? colors.primary : colors.card,
                borderColor: i === activeIndex ? colors.primary : colors.border,
              }]}
              onPress={() => setActiveIndex(i)}
              activeOpacity={0.8}
            >
              <Text style={[s.pillText, { color: i === activeIndex ? "#fff" : colors.foreground }]}>
                {child.name.split(" ")[0]}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {children[activeIndex] && (
        <>
          <Text style={[s.childName, { color: colors.foreground }]}>{children[activeIndex].name}</Text>
          <Text style={[s.childGrade, { color: colors.mutedForeground }]}>{children[activeIndex].grade} Grade</Text>
          <View style={s.divider} />
          <ChildAttendanceView child={children[activeIndex]} colors={colors} />
        </>
      )}

      <View style={[s.note, { backgroundColor: colors.secondary }]}>
        <Feather name="info" size={14} color={colors.mutedForeground} />
        <Text style={[s.noteText, { color: colors.mutedForeground }]}>
          Attendance below 75% may affect eligibility for exams. Contact the tutor for details.
        </Text>
      </View>
    </ScrollView>
  );
}

const innerStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { paddingHorizontal: 16 },
    title: { fontSize: 22, fontFamily: "Inter_700Bold", marginBottom: 16 },
    pills: { flexDirection: "row", gap: 8, marginBottom: 16 },
    pill: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1.5 },
    pillText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
    childName: { fontSize: 18, fontFamily: "Inter_700Bold" },
    childGrade: { fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2, marginBottom: 16 },
    divider: { height: 1, backgroundColor: colors.border, marginBottom: 20 },
    note: { flexDirection: "row", gap: 10, padding: 14, borderRadius: 12, marginTop: 8 },
    noteText: { fontSize: 12, fontFamily: "Inter_400Regular", flex: 1, lineHeight: 18 },
  });
