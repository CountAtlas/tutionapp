import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useMemo, useState } from "react";
import {
  FlatList,
  Linking,
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
import { LoadingState } from "@/components/LoadingState";
import { useColors } from "@/hooks/useColors";
import { useGuardians, ApiGuardian } from "@/hooks/useApi";

function GuardianRow({
  guardian,
  onPress,
}: {
  guardian: ApiGuardian;
  onPress: () => void;
}) {
  const colors = useColors();
  const initials = guardian.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <TouchableOpacity
      style={[styles.row, { backgroundColor: colors.card, borderColor: colors.border }]}
      onPress={onPress}
      activeOpacity={0.78}
    >
      <View style={[styles.avatar, { backgroundColor: colors.successLight }]}>
        <Text style={[styles.initials, { color: colors.success }]}>{initials}</Text>
      </View>
      <View style={styles.info}>
        <Text style={[styles.name, { color: colors.foreground }]}>{guardian.name}</Text>
        <Text style={[styles.phone, { color: colors.mutedForeground }]}>{guardian.phone}</Text>
        <Text style={[styles.students, { color: colors.mutedForeground }]}>
          {guardian.students.map((s) => s.name).join(", ")}
        </Text>
      </View>
      <View style={styles.actions}>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: colors.accent }]}
          onPress={(e) => {
            e.stopPropagation();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
            Linking.openURL(`tel:${guardian.phone}`);
          }}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Feather name="phone" size={15} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.actionBtn, { backgroundColor: "#DCFCE7" }]}
          onPress={(e) => {
            e.stopPropagation();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            Linking.openURL(`https://wa.me/91${guardian.whatsapp ?? guardian.phone}`);
          }}
          hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
        >
          <Feather name="message-circle" size={15} color="#16A34A" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

export default function GuardiansScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const [search, setSearch] = useState("");

  const { data: allGuardians = [], isLoading, refetch } = useGuardians();

  const filtered = useMemo(() => {
    if (!search.trim()) return allGuardians;
    const q = search.toLowerCase();
    return allGuardians.filter(
      (g) => g.name.toLowerCase().includes(q) || g.phone.includes(q)
    );
  }, [allGuardians, search]);

  const extraPad = Platform.OS === "web" ? 67 : 0;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  if (isLoading && !allGuardians.length) return <LoadingState message="Loading guardians…" />;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <FlatList
        data={filtered}
        keyExtractor={(g) => g.id}
        renderItem={({ item }) => (
          <GuardianRow
            guardian={item}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.push(`/guardian/${item.id}` as any);
            }}
          />
        )}
        contentContainerStyle={[
          styles.list,
          { paddingTop: extraPad + 8, paddingBottom: bottomPad + 40 },
        ]}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />
        }
        ListHeaderComponent={
          <View style={styles.header}>
            <TouchableOpacity style={styles.backBtn} onPress={() => router.back()}>
              <Feather name="arrow-left" size={20} color={colors.foreground} />
            </TouchableOpacity>
            <Text style={[styles.screenTitle, { color: colors.foreground }]}>Guardians</Text>
            <Text style={[styles.count, { color: colors.mutedForeground }]}>
              {filtered.length} guardian{filtered.length !== 1 ? "s" : ""}
            </Text>
            <View style={styles.searchWrap}>
              <SearchBar value={search} onChangeText={setSearch} placeholder="Search guardians..." />
            </View>
          </View>
        }
        ListEmptyComponent={
          <EmptyState icon="users" title="No guardians found" subtitle="Try a different search" />
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  list: { paddingHorizontal: 16 },
  header: { marginBottom: 12 },
  backBtn: { marginBottom: 12 },
  screenTitle: { fontSize: 24, fontFamily: "Inter_700Bold", marginBottom: 4 },
  count: { fontSize: 13, fontFamily: "Inter_400Regular", marginBottom: 12 },
  searchWrap: { marginBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 12, borderRadius: 14, borderWidth: 1, padding: 14, marginBottom: 10 },
  avatar: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center" },
  initials: { fontSize: 17, fontFamily: "Inter_700Bold" },
  info: { flex: 1, gap: 2 },
  name: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  phone: { fontSize: 12, fontFamily: "Inter_400Regular" },
  students: { fontSize: 11, fontFamily: "Inter_400Regular" },
  actions: { flexDirection: "row", gap: 8 },
  actionBtn: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
});
