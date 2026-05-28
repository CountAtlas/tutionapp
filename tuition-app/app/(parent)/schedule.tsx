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
import { useParentSchedule, useParentChildren } from "@/hooks/useApi";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
const DAY_LABELS: Record<string, string> = {
  Mon: "Monday", Tue: "Tuesday", Wed: "Wednesday",
  Thu: "Thursday", Fri: "Friday", Sat: "Saturday",
};

const SUBJECT_COLORS: Record<string, string> = {
  Mathematics: "#3B82F6", Science: "#10B981",
  English: "#8B5CF6", Physics: "#F59E0B", Chemistry: "#EF4444",
};

export default function ParentScheduleScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();

  const todayName = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][new Date().getDay()];
  const validToday = DAYS.includes(todayName) ? todayName : "Mon";
  const [selectedDay, setSelectedDay] = useState(validToday);

  const { data: allSlots = [], isLoading, refetch } = useParentSchedule();
  const { data: children = [] } = useParentChildren();

  const dayItems = allSlots.filter((s) => s.day === selectedDay);
  const childNames = children.map((c) => c.name.split(" ")[0]).join(" & ");

  const extraPad = Platform.OS === "web" ? 67 : 0;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom;

  if (isLoading && !allSlots.length) return <LoadingState message="Loading schedule…" />;

  const s = innerStyles(colors);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[s.container, { paddingTop: extraPad + 16, paddingBottom: bottomPad + 100 }]}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />}
      showsVerticalScrollIndicator={false}
    >
      <Text style={[s.title, { color: colors.foreground }]}>Schedule</Text>
      {childNames && <Text style={[s.subtitle, { color: colors.mutedForeground }]}>Classes for {childNames}</Text>}

      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.dayStrip}>
        {DAYS.map((day) => {
          const isToday = day === validToday;
          const isSelected = day === selectedDay;
          const hasClass = allSlots.some((sc) => sc.day === day);
          return (
            <TouchableOpacity
              key={day}
              style={[s.dayBtn, {
                backgroundColor: isSelected ? colors.primary : colors.card,
                borderColor: isSelected ? colors.primary : isToday ? colors.primary + "66" : colors.border,
              }]}
              onPress={() => setSelectedDay(day)}
              activeOpacity={0.8}
            >
              <Text style={[s.dayLabel, { color: isSelected ? "#fff" : isToday ? colors.primary : colors.foreground }]}>
                {day}
              </Text>
              {(isToday || hasClass) && (
                <View style={[s.todayDot, { backgroundColor: isSelected ? (isToday ? "#fff" : "rgba(255,255,255,0.5)") : isToday ? colors.primary : colors.border }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Text style={[s.dayFull, { color: colors.foreground }]}>
        {DAY_LABELS[selectedDay]}
        {selectedDay === validToday && <Text style={{ color: colors.primary }}> · Today</Text>}
      </Text>

      {dayItems.length === 0 ? (
        <View style={[s.emptyCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="coffee" size={28} color={colors.mutedForeground} />
          <Text style={[s.emptyText, { color: colors.mutedForeground }]}>No classes on {DAY_LABELS[selectedDay]}</Text>
        </View>
      ) : (
        dayItems.map((item) => {
          const subjectColor = SUBJECT_COLORS[item.subject] ?? colors.primary;
          return (
            <View key={item.id} style={[s.classCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
              <View style={[s.colorBar, { backgroundColor: subjectColor }]} />
              <View style={s.classContent}>
                <View style={s.classTop}>
                  <View style={s.classInfo}>
                    <Text style={[s.className, { color: colors.foreground }]}>{item.subject}</Text>
                    <Text style={[s.classBatch, { color: colors.mutedForeground }]}>{item.batchName}</Text>
                  </View>
                  <View style={[s.timeChip, { backgroundColor: colors.accent }]}>
                    <Feather name="clock" size={12} color={colors.primary} />
                    <Text style={[s.timeText, { color: colors.primary }]}>{item.time}</Text>
                  </View>
                </View>
                {item.childNames && item.childNames.length > 0 && (
                  <View style={s.childRow}>
                    {item.childNames.map((cn, i) => (
                      <View key={i} style={[s.childChip, { backgroundColor: colors.secondary }]}>
                        <Text style={[s.childChipText, { color: colors.mutedForeground }]}>{cn.split(" ")[0]}</Text>
                      </View>
                    ))}
                  </View>
                )}
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const innerStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { paddingHorizontal: 16 },
    title: { fontSize: 22, fontFamily: "Inter_700Bold", marginBottom: 4 },
    subtitle: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 16 },
    dayStrip: { gap: 8, paddingVertical: 4, marginBottom: 16 },
    dayBtn: { alignItems: "center", justifyContent: "center", width: 56, height: 62, borderRadius: 14, borderWidth: 1.5, gap: 4 },
    dayLabel: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
    todayDot: { width: 5, height: 5, borderRadius: 3 },
    dayFull: { fontSize: 17, fontFamily: "Inter_700Bold", marginBottom: 14 },
    emptyCard: { borderRadius: 16, borderWidth: 1, padding: 32, alignItems: "center", gap: 10 },
    emptyText: { fontSize: 14, fontFamily: "Inter_400Regular" },
    classCard: { flexDirection: "row", borderRadius: 16, borderWidth: 1, marginBottom: 12, overflow: "hidden" },
    colorBar: { width: 5 },
    classContent: { flex: 1, padding: 14, gap: 10 },
    classTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
    classInfo: { flex: 1 },
    className: { fontSize: 15, fontFamily: "Inter_700Bold" },
    classBatch: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 2 },
    timeChip: { flexDirection: "row", alignItems: "center", gap: 4, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 8 },
    timeText: { fontSize: 12, fontFamily: "Inter_600SemiBold" },
    childRow: { flexDirection: "row", gap: 6 },
    childChip: { paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
    childChipText: { fontSize: 11, fontFamily: "Inter_500Medium" },
  });
