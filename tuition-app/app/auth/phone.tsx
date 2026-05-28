import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useRef, useState } from "react";
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { IS_DEMO_MODE, sendOtp } from "@/services/firebase";
import { useColors } from "@/hooks/useColors";

const COUNTRY_CODES = [
  { code: "+91", flag: "🇮🇳", label: "India" },
  { code: "+1", flag: "🇺🇸", label: "USA" },
  { code: "+44", flag: "🇬🇧", label: "UK" },
  { code: "+61", flag: "🇦🇺", label: "Australia" },
  { code: "+971", flag: "🇦🇪", label: "UAE" },
  { code: "+65", flag: "🇸🇬", label: "Singapore" },
];

type Role = "tutor" | "guardian";

export default function PhoneScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();

  const [role, setRole] = useState<Role>("tutor");
  const [countryCode, setCountryCode] = useState("+91");
  const [phone, setPhone] = useState("");
  const [showCountryCodes, setShowCountryCodes] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const phoneRef = useRef<TextInput>(null);

  const handleSend = async () => {
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length < 7) {
      setError("Enter a valid phone number");
      return;
    }
    setError("");
    setLoading(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const fullPhone = `${countryCode}${cleaned}`;
      await sendOtp(fullPhone);
      router.push({
        pathname: "/auth/otp",
        params: { phone: fullPhone, role },
      });
    } catch (e: any) {
      setError(e.message || "Failed to send OTP. Please try again.");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const s = styles(colors);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.background }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      {/* Invisible recaptcha container for web */}
      {Platform.OS === "web" && <View nativeID="recaptcha-container" />}

      <ScrollView
        contentContainerStyle={[
          s.container,
          { paddingTop: insets.top + 32, paddingBottom: insets.bottom + 32 },
        ]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={s.header}>
          <View style={[s.logoWrap, { backgroundColor: colors.primary }]}>
            <Feather name="book-open" size={30} color="#fff" />
          </View>
          <Text style={[s.appName, { color: colors.foreground }]}>TuitionApp</Text>
          <Text style={[s.tagline, { color: colors.mutedForeground }]}>
            Your classroom, simplified
          </Text>
        </View>

        {/* Demo banner */}
        {IS_DEMO_MODE && (
          <View style={[s.demoBanner, { backgroundColor: colors.warningLight, borderColor: colors.warning }]}>
            <Feather name="info" size={14} color={colors.warning} />
            <Text style={[s.demoBannerText, { color: colors.warning }]}>
              Demo mode — enter any number, OTP is{" "}
              <Text style={{ fontFamily: "Inter_700Bold" }}>123456</Text>
            </Text>
          </View>
        )}

        {/* Role selector */}
        <Text style={[s.sectionLabel, { color: colors.mutedForeground }]}>
          I AM A
        </Text>
        <View style={s.roleRow}>
          {(["tutor", "guardian"] as Role[]).map((r) => (
            <TouchableOpacity
              key={r}
              style={[
                s.roleBtn,
                {
                  backgroundColor:
                    role === r ? colors.primary : colors.card,
                  borderColor:
                    role === r ? colors.primary : colors.border,
                },
              ]}
              onPress={() => {
                setRole(r);
                Haptics.selectionAsync().catch(() => {});
              }}
              activeOpacity={0.8}
            >
              <Feather
                name={r === "tutor" ? "user-check" : "users"}
                size={20}
                color={role === r ? "#fff" : colors.mutedForeground}
              />
              <Text
                style={[
                  s.roleBtnText,
                  { color: role === r ? "#fff" : colors.foreground },
                ]}
              >
                {r === "tutor" ? "Tutor" : "Parent / Guardian"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Phone input */}
        <Text style={[s.sectionLabel, { color: colors.mutedForeground, marginTop: 24 }]}>
          PHONE NUMBER
        </Text>
        <View style={[s.phoneRow, { borderColor: colors.input, backgroundColor: colors.card }]}>
          <TouchableOpacity
            style={[s.countryBtn, { borderRightColor: colors.border }]}
            onPress={() => setShowCountryCodes((v) => !v)}
            activeOpacity={0.7}
          >
            <Text style={s.flag}>
              {COUNTRY_CODES.find((c) => c.code === countryCode)?.flag ?? "🌍"}
            </Text>
            <Text style={[s.countryCode, { color: colors.foreground }]}>
              {countryCode}
            </Text>
            <Feather
              name={showCountryCodes ? "chevron-up" : "chevron-down"}
              size={14}
              color={colors.mutedForeground}
            />
          </TouchableOpacity>
          <TextInput
            ref={phoneRef}
            style={[s.phoneInput, { color: colors.foreground }]}
            value={phone}
            onChangeText={(t) => setPhone(t.replace(/[^0-9\s\-]/g, ""))}
            placeholder="98765 43210"
            placeholderTextColor={colors.mutedForeground}
            keyboardType="phone-pad"
            maxLength={15}
            returnKeyType="done"
            onSubmitEditing={handleSend}
          />
        </View>

        {/* Country code picker */}
        {showCountryCodes && (
          <View
            style={[
              s.countryList,
              { backgroundColor: colors.card, borderColor: colors.border },
            ]}
          >
            {COUNTRY_CODES.map((c) => (
              <TouchableOpacity
                key={c.code}
                style={[
                  s.countryItem,
                  {
                    backgroundColor:
                      c.code === countryCode ? colors.primaryLight + "22" : "transparent",
                  },
                ]}
                onPress={() => {
                  setCountryCode(c.code);
                  setShowCountryCodes(false);
                  phoneRef.current?.focus();
                }}
              >
                <Text style={s.flag}>{c.flag}</Text>
                <Text style={[s.countryLabel, { color: colors.foreground }]}>
                  {c.label}
                </Text>
                <Text style={[s.countryCode, { color: colors.mutedForeground }]}>
                  {c.code}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Error */}
        {error !== "" && (
          <View style={[s.errorBox, { backgroundColor: colors.dangerLight }]}>
            <Feather name="alert-circle" size={14} color={colors.danger} />
            <Text style={[s.errorText, { color: colors.danger }]}>{error}</Text>
          </View>
        )}

        {/* Send OTP button */}
        <TouchableOpacity
          style={[
            s.sendBtn,
            { backgroundColor: colors.primary, opacity: loading ? 0.75 : 1 },
          ]}
          onPress={handleSend}
          disabled={loading}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <>
              <Text style={s.sendBtnText}>Send OTP</Text>
              <Feather name="arrow-right" size={18} color="#fff" />
            </>
          )}
        </TouchableOpacity>

        <Text style={[s.note, { color: colors.mutedForeground }]}>
          We'll send a one-time password to verify your number
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = (colors: any) =>
  StyleSheet.create({
    container: {
      flexGrow: 1,
      paddingHorizontal: 24,
    },
    header: {
      alignItems: "center",
      marginBottom: 28,
    },
    logoWrap: {
      width: 76,
      height: 76,
      borderRadius: 22,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 14,
    },
    appName: {
      fontSize: 26,
      fontFamily: "Inter_700Bold",
      letterSpacing: -0.5,
    },
    tagline: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
      marginTop: 4,
    },
    demoBanner: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 12,
      borderWidth: 1,
      marginBottom: 24,
    },
    demoBannerText: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      flex: 1,
    },
    sectionLabel: {
      fontSize: 11,
      fontFamily: "Inter_600SemiBold",
      letterSpacing: 1,
      marginBottom: 10,
    },
    roleRow: {
      flexDirection: "row",
      gap: 12,
    },
    roleBtn: {
      flex: 1,
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 8,
      paddingVertical: 16,
      borderRadius: 16,
      borderWidth: 2,
    },
    roleBtnText: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
    },
    phoneRow: {
      flexDirection: "row",
      alignItems: "center",
      borderWidth: 1.5,
      borderRadius: 16,
      overflow: "hidden",
    },
    countryBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 4,
      paddingHorizontal: 12,
      paddingVertical: 16,
      borderRightWidth: 1,
    },
    flag: {
      fontSize: 20,
    },
    countryCode: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
    },
    phoneInput: {
      flex: 1,
      fontSize: 20,
      fontFamily: "Inter_600SemiBold",
      paddingHorizontal: 14,
      paddingVertical: 16,
    },
    countryList: {
      borderRadius: 14,
      borderWidth: 1,
      marginTop: 4,
      overflow: "hidden",
    },
    countryItem: {
      flexDirection: "row",
      alignItems: "center",
      gap: 10,
      paddingHorizontal: 14,
      paddingVertical: 12,
    },
    countryLabel: {
      flex: 1,
      fontSize: 15,
      fontFamily: "Inter_500Medium",
    },
    errorBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      padding: 12,
      borderRadius: 12,
      marginTop: 12,
    },
    errorText: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      flex: 1,
    },
    sendBtn: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      gap: 10,
      borderRadius: 16,
      paddingVertical: 18,
      marginTop: 24,
    },
    sendBtnText: {
      color: "#fff",
      fontSize: 17,
      fontFamily: "Inter_700Bold",
    },
    note: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      textAlign: "center",
      marginTop: 14,
      lineHeight: 18,
    },
  });
