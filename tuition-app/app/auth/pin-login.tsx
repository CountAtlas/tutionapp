import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DigitBoxes } from "@/components/DigitBoxes";
import { useAuth } from "@/contexts/AuthContext";
import { useColors } from "@/hooks/useColors";

const PIN_LENGTH = 4;

export default function PinLoginScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { phone } = useLocalSearchParams<{ phone: string }>();
  const { verifyPin } = useAuth();

  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePinChange = async (val: string) => {
    setError("");
    setPin(val);

    if (val.length === PIN_LENGTH) {
      setLoading(true);
      try {
        const ok = await verifyPin(phone ?? "", val);
        if (ok) {
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Success
          );
          router.replace("/(tabs)");
        } else {
          await Haptics.notificationAsync(
            Haptics.NotificationFeedbackType.Error
          );
          setError("Incorrect PIN. Try again.");
          setPin("");
          setLoading(false);
        }
      } catch {
        setError("Something went wrong. Try again.");
        setPin("");
        setLoading(false);
      }
    }
  };

  const maskedPhone = phone
    ? phone.slice(0, -4).replace(/\d/g, "•") + phone.slice(-4)
    : "";

  const s = styles(colors);

  return (
    <View
      style={[
        s.screen,
        {
          backgroundColor: colors.background,
          paddingTop: insets.top + 16,
          paddingBottom: insets.bottom + 32,
        },
      ]}
    >
      <View style={s.content}>
        {/* Icon */}
        <View style={[s.iconCircle, { backgroundColor: colors.primaryLight + "33" }]}>
          <Feather name="lock" size={36} color={colors.primary} />
        </View>

        <Text style={[s.title, { color: colors.foreground }]}>Welcome back</Text>
        <Text style={[s.subtitle, { color: colors.mutedForeground }]}>
          Enter your PIN to continue{"\n"}
          <Text style={{ fontFamily: "Inter_600SemiBold", color: colors.foreground }}>
            {maskedPhone}
          </Text>
        </Text>

        {/* PIN boxes */}
        <View style={s.pinWrap}>
          <DigitBoxes
            length={PIN_LENGTH}
            value={pin}
            onChange={handlePinChange}
            autoFocus
            secret
            disabled={loading}
          />
        </View>

        {/* Error */}
        {error !== "" && (
          <View style={[s.errorBox, { backgroundColor: colors.dangerLight }]}>
            <Feather name="alert-circle" size={14} color={colors.danger} />
            <Text style={[s.errorText, { color: colors.danger }]}>{error}</Text>
          </View>
        )}

        {/* Use OTP instead */}
        <TouchableOpacity
          style={s.otpBtn}
          onPress={() => router.replace("/auth/phone")}
        >
          <Feather name="smartphone" size={15} color={colors.primary} />
          <Text style={[s.otpBtnText, { color: colors.primary }]}>
            Use OTP instead
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = (colors: any) =>
  StyleSheet.create({
    screen: {
      flex: 1,
      paddingHorizontal: 24,
    },
    content: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingBottom: 40,
    },
    iconCircle: {
      width: 88,
      height: 88,
      borderRadius: 44,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 24,
    },
    title: {
      fontSize: 28,
      fontFamily: "Inter_700Bold",
      letterSpacing: -0.5,
      marginBottom: 10,
    },
    subtitle: {
      fontSize: 15,
      fontFamily: "Inter_400Regular",
      textAlign: "center",
      lineHeight: 22,
      marginBottom: 36,
    },
    pinWrap: {
      marginBottom: 24,
    },
    errorBox: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingHorizontal: 14,
      paddingVertical: 10,
      borderRadius: 12,
      marginBottom: 16,
      alignSelf: "stretch",
    },
    errorText: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
      flex: 1,
    },
    otpBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
      paddingVertical: 14,
    },
    otpBtnText: {
      fontSize: 15,
      fontFamily: "Inter_600SemiBold",
    },
  });
