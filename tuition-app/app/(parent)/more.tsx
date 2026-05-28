import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import React from "react";
import {
  Linking,
  Platform,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";
import { useParentAnnouncements } from "@/hooks/useApi";

const TUTOR_WHATSAPP = "919876543210";

export default function ParentMoreScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const { user, logout } = useAuth();

  const { data: announcements = [], isLoading, refetch } = useParentAnnouncements();

  const extraPad = Platform.OS === "web" ? 67 : 0;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom;

  const initials = (user?.name ?? "P").split(" ").map((n) => n[0]).join("").slice(0, 2).toUpperCase();

  const openWhatsApp = (text?: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    const encoded = text ? encodeURIComponent(text) : "";
    Linking.openURL(`https://wa.me/${TUTOR_WHATSAPP}${encoded ? `?text=${encoded}` : ""}`);
  };

  const callTutor = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Linking.openURL(`tel:${TUTOR_WHATSAPP}`);
  };

  const s = innerStyles(colors);

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.background }}
      contentContainerStyle={[s.container, { paddingTop: extraPad + 16, paddingBottom: bottomPad + 100 }]}
      refreshControl={<RefreshControl refreshing={isLoading} onRefresh={refetch} tintColor={colors.primary} />}
      showsVerticalScrollIndicator={false}
    >
      {/* Profile */}
      <View style={[s.profileCard, { backgroundColor: colors.primary }]}>
        <View style={s.avatar}>
          <Text style={s.initials}>{initials}</Text>
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.profileName}>{user?.name ?? "Parent"}</Text>
          <Text style={s.profilePhone}>{user?.phone ?? ""}</Text>
          <View style={s.rolePill}>
            <Text style={s.rolePillText}>Parent / Guardian</Text>
          </View>
        </View>
      </View>

      {/* Contact Tutor */}
      <Text style={[s.sectionLabel, { color: colors.foreground }]}>Contact Tutor</Text>
      <TouchableOpacity style={s.whatsappBtn} onPress={() => openWhatsApp()} activeOpacity={0.85}>
        <View style={s.whatsappIcon}>
          <Feather name="message-circle" size={22} color="#fff" />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={s.whatsappLabel}>Chat on WhatsApp</Text>
          <Text style={s.whatsappSub}>Send a message to the tutor</Text>
        </View>
        <Feather name="chevron-right" size={18} color="rgba(255,255,255,0.7)" />
      </TouchableOpacity>

      <TouchableOpacity style={[s.callBtn, { backgroundColor: colors.card, borderColor: colors.border }]} onPress={callTutor} activeOpacity={0.8}>
        <View style={[s.callIcon, { backgroundColor: colors.infoLight }]}>
          <Feather name="phone" size={20} color={colors.info} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={[s.callLabel, { color: colors.foreground }]}>Call Tutor</Text>
          <Text style={[s.callSub, { color: colors.mutedForeground }]}>Direct phone call</Text>
        </View>
        <Feather name="chevron-right" size={18} color={colors.mutedForeground} />
      </TouchableOpacity>

      {/* Quick messages */}
      <Text style={[s.sectionLabel, { color: colors.foreground, marginTop: 8 }]}>Quick Messages</Text>
      {[
        "My child will be absent today.",
        "Please share today's homework.",
        "I have a question about the fee.",
      ].map((msg) => (
        <TouchableOpacity
          key={msg}
          style={[s.quickMsg, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => openWhatsApp(msg)}
          activeOpacity={0.8}
        >
          <Feather name="message-square" size={16} color={colors.mutedForeground} />
          <Text style={[s.quickMsgText, { color: colors.foreground }]}>{msg}</Text>
          <Feather name="send" size={14} color={colors.primary} />
        </TouchableOpacity>
      ))}

      {/* Announcements */}
      <Text style={[s.sectionLabel, { color: colors.foreground, marginTop: 8 }]}>All Announcements</Text>
      <View style={[s.announceCard, { backgroundColor: colors.card, borderColor: colors.border }]}>
        {announcements.length === 0 ? (
          <Text style={[{ fontSize: 14, fontFamily: "Inter_400Regular" }, { color: colors.mutedForeground }]}>
            No announcements right now.
          </Text>
        ) : (
          announcements.map((a, i) => {
            const dotColor = a.type === "test" ? colors.danger : a.type === "holiday" ? colors.success : colors.primary;
            return (
              <View key={a.id}>
                {i > 0 && <View style={[s.divider, { backgroundColor: colors.border }]} />}
                <View style={s.announceRow}>
                  <View style={[s.dot, { backgroundColor: dotColor }]} />
                  <View style={{ flex: 1 }}>
                    <Text style={[s.aTitle, { color: colors.foreground }]}>{a.title}</Text>
                    <Text style={[s.aBody, { color: colors.mutedForeground }]}>{a.body}</Text>
                    <Text style={[s.aDate, { color: colors.mutedForeground }]}>{a.date}</Text>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </View>

      {/* Logout */}
      <TouchableOpacity
        style={[s.logoutBtn, { backgroundColor: colors.dangerLight, borderColor: colors.danger + "30" }]}
        onPress={() => { Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium); logout(); }}
        activeOpacity={0.8}
      >
        <Feather name="log-out" size={18} color={colors.danger} />
        <Text style={[s.logoutText, { color: colors.danger }]}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const innerStyles = (colors: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: { paddingHorizontal: 16 },
    profileCard: { borderRadius: 18, padding: 20, flexDirection: "row", alignItems: "center", gap: 16, marginBottom: 24 },
    avatar: { width: 56, height: 56, borderRadius: 28, backgroundColor: "rgba(255,255,255,0.25)", alignItems: "center", justifyContent: "center" },
    initials: { color: "#fff", fontSize: 20, fontFamily: "Inter_700Bold" },
    profileName: { color: "#fff", fontSize: 18, fontFamily: "Inter_700Bold" },
    profilePhone: { color: "rgba(255,255,255,0.75)", fontSize: 13, fontFamily: "Inter_400Regular", marginTop: 2 },
    rolePill: { alignSelf: "flex-start", marginTop: 6, paddingHorizontal: 10, paddingVertical: 3, borderRadius: 20, backgroundColor: "rgba(255,255,255,0.2)" },
    rolePillText: { color: "#fff", fontSize: 11, fontFamily: "Inter_600SemiBold" },
    sectionLabel: { fontSize: 14, fontFamily: "Inter_700Bold", marginBottom: 10 },
    whatsappBtn: { backgroundColor: "#25D366", borderRadius: 16, padding: 16, flexDirection: "row", alignItems: "center", gap: 14, marginBottom: 10 },
    whatsappIcon: { width: 44, height: 44, borderRadius: 12, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
    whatsappLabel: { color: "#fff", fontSize: 15, fontFamily: "Inter_700Bold" },
    whatsappSub: { color: "rgba(255,255,255,0.8)", fontSize: 12, fontFamily: "Inter_400Regular" },
    callBtn: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16, borderRadius: 16, borderWidth: 1, marginBottom: 16 },
    callIcon: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
    callLabel: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
    callSub: { fontSize: 12, fontFamily: "Inter_400Regular", marginTop: 1 },
    quickMsg: { flexDirection: "row", alignItems: "center", gap: 12, padding: 14, borderRadius: 12, borderWidth: 1, marginBottom: 8 },
    quickMsgText: { flex: 1, fontSize: 14, fontFamily: "Inter_400Regular" },
    announceCard: { borderRadius: 16, borderWidth: 1, padding: 16, marginBottom: 16 },
    divider: { height: 1, marginVertical: 10 },
    announceRow: { flexDirection: "row", gap: 12, alignItems: "flex-start" },
    dot: { width: 8, height: 8, borderRadius: 4, marginTop: 5, flexShrink: 0 },
    aTitle: { fontSize: 14, fontFamily: "Inter_600SemiBold", marginBottom: 2 },
    aBody: { fontSize: 13, fontFamily: "Inter_400Regular", lineHeight: 18 },
    aDate: { fontSize: 11, fontFamily: "Inter_400Regular", marginTop: 3 },
    logoutBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderRadius: 14, borderWidth: 1, paddingVertical: 14, marginTop: 4 },
    logoutText: { fontSize: 15, fontFamily: "Inter_600SemiBold" },
  });
