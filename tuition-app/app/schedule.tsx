import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { LoadingState } from "@/components/LoadingState";
import { useColors } from "@/hooks/useColors";
import { useSchedule } from "@/hooks/useApi";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const SUBJECT_COLORS: Record<string, { bg: string; text: string }> = {
  Mathematics: { bg: "#EFF6FF", text: "#1E40AF" },
  Science: { bg: "#ECFDF5", text: "#065F46" },
  English: { bg: "#FEF3C7", text: "#92400E" },
  Physics: { bg: "#F5F3FF", text: "#4C1D95" },
  Chemistry: { bg: "#FFF1F2", text: "#9F1239" },
};

export default function ScheduleScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const todayName = dayNames[new Date().getDay()];
  const [selectedDay, setSelectedDay] = useState(DAYS.includes(todayName) ? todayName : "Mon");

  const { data: allSlots = [], isLoading } = useSchedule();

  const hasClassOnDay = (d: string) => allSlots.some((s) => s.day === d);
  const dayClasses = allSlots.filter((s) => s.day === selectedDay);

  const extraPad = Platform.OS === "web" ? 67 : 0;

  if (isLoading && !allSlots.length) return <LoadingState message="Loading schedule…" />;

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

      <Text style={[styles.title, { color: colors.foreground }]}>Schedule</Text>

      {/* Day picker */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.dayPicker}>
        {DAYS.map((d) => {
          const hasClasses = hasClassOnDay(d);
          const isSelected = d === selectedDay;
          return (
            <TouchableOpacity
              key={d}
              style={[
                styles.dayBtn,
                {
                  backgroundColor: isSelected ? colors.primary : colors.card,
                  borderColor: isSelected ? colors.primary : colors.border,
                },
              ]}
              onPress={() => setSelectedDay(d)}
            >
              <Text
                style={[
                  styles.dayText,
                  { color: isSelected ? "#fff" : colors.foreground },
                ]}
              >
                {d}
              </Text>
              {hasClasses && !isSelected && (
                <View style={[styles.dot, { backgroundColor: colors.primary }]} />
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Classes for selected day */}
      {dayClasses.length === 0 ? (
        <View style={[styles.emptyDay, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Feather name="coffee" size={28} color={colors.mutedForeground} />
          <Text style={[styles.emptyDayText, { color: colors.mutedForeground }]}>
            No classes on {selectedDay}
          </Text>
        </View>
      ) : (
        dayClasses
          .sort((a, b) => a.time.localeCompare(b.time))
          .map((cls) => {
            const sc = SUBJECT_COLORS[cls.subject] ?? { bg: colors.accent, text: colors.primary };
            return (
              <View
                key={cls.id}
                style={[styles.classCard, { backgroundColor: colors.card, borderColor: colors.border }]}
              >
                <View style={[styles.timeBar, { backgroundColor: colors.primary }]}>
                  <Text style={styles.timeText}>{cls.time}</Text>
                </View>
                <View style={styles.classInfo}>
                  <View style={styles.classTop}>
                    <Text style={[styles.className, { color: colors.foreground }]}>{cls.batchName}</Text>
                    <View style={[styles.subjectBadge, { backgroundColor: sc.bg }]}>
                      <Text style={[styles.subjectText, { color: sc.text }]}>{cls.subject}</Text>
                    </View>
                  </View>
                  <View style={styles.classBottom}>
                    <Feather name="users" size={13} color={colors.mutedForeground} />
                    <Text style={[styles.classMeta, { color: colors.mutedForeground }]}>
                      {cls.studentCount} students
                    </Text>
                    {cls.room && (
                      <>
                        <Feather name="map-pin" size={13} color={colors.mutedForeground} />
                        <Text style={[styles.classMeta, { color: colors.mutedForeground }]}>{cls.room}</Text>
                      </>
                    )}
                  </View>
                </View>
              </View>
            );
          })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingHorizontal: 16 },
  backBtn: { marginBottom: 12 },
  title: { fontSize: 24, fontFamily: "Inter_700Bold", marginBottom: 20 },
  dayPicker: { gap: 10, marginBottom: 20, paddingRight: 16 },
  dayBtn: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1, alignItems: "center", gap: 4, minWidth: 56 },
  dayText: { fontSize: 14, fontFamily: "Inter_600SemiBold" },
  dot: { width: 5, height: 5, borderRadius: 3 },
  emptyDay: { borderRadius: 16, borderWidth: 1, padding: 32, alignItems: "center", gap: 10 },
  emptyDayText: { fontSize: 14, fontFamily: "Inter_400Regular" },
  classCard: { flexDirection: "row", borderRadius: 14, borderWidth: 1, overflow: "hidden", marginBottom: 12 },
  timeBar: { width: 64, alignItems: "center", justifyContent: "center", padding: 12 },
  timeText: { color: "#fff", fontSize: 12, fontFamily: "Inter_600SemiBold", textAlign: "center" },
  classInfo: { flex: 1, padding: 14, gap: 8 },
  classTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  className: { fontSize: 15, fontFamily: "Inter_600SemiBold", flex: 1 },
  subjectBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20, marginLeft: 8 },
  subjectText: { fontSize: 11, fontFamily: "Inter_600SemiBold" },
  classBottom: { flexDirection: "row", alignItems: "center", gap: 6 },
  classMeta: { fontSize: 12, fontFamily: "Inter_400Regular" },
});
