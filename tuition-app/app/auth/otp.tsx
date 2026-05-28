import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { DigitBoxes } from "@/components/DigitBoxes";
import { useAuth } from "@/contexts/AuthContext";
import { IS_DEMO_MODE, sendOtp, verifyOtp } from "@/services/firebase";
import { useColors } from "@/hooks/useColors";

const OTP_LENGTH = 6;
const RESEND_SECONDS = 60;

export default function OTPScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { phone, role } = useLocalSearchParams<{
    phone: string;
    role: "tutor" | "guardian";
  }>();
  const { completeAuth } = useAuth();

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [error, setError] = useState("");
  const [timer, setTimer] = useState(RESEND_SECONDS);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    startTimer();
    return () => clearInterval(timerRef.current!);
  }, []);

  useEffect(() => {
    if (otp.length === OTP_LENGTH) {
      handleVerify(otp);
    }
  }, [otp]);

  function startTimer() {
    setTimer(RESEND_SECONDS);
    clearInterval(timerRef.current!);
    timerRef.current = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(timerRef.current!);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
  }

  const handleVerify = async (code: string) => {
    if (code.length < OTP_LENGTH) return;
    setError("");
    setLoading(true);
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      const firebaseToken = await verifyOtp(code);
      await completeAuth(firebaseToken, role ?? "tutor", phone ?? "");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

      if (role === "tutor") {
        router.replace("/auth/pin-setup");
      } else {
        router.replace("/(parent)");
      }
    } catch (e: any) {
      setOtp("");
      setError(e.message || "Incorrect OTP. Please try again.");
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0 || resending) return;
    setResending(true);
    setError("");
    setOtp("");
    try {
      await sendOtp(phone ?? "");
      startTimer();
    } catch (e: any) {
      setError("Failed to resend OTP. Please try again.");
    } finally {
      setResending(false);
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
      {/* Back button */}
      <TouchableOpacity
        style={s.backBtn}
        onPress={() => router.back()}
        hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
      >
        <Feather name="arrow-left" size={22} color={colors.foreground} />
      </TouchableOpacity>

      <View style={s.content}>
        {/* Header */}
        <View style={s.iconWrap}>
          <View style={[s.iconCircle, { backgroundColor: colors.primaryLight + "33" }]}>
            <Feather name="smartphone" size={36} color={colors.primary} />
          </View>
        </View>

        <Text style={[s.title, { color: colors.foreground }]}>
          Enter OTP
        </Text>
        <Text style={[s.subtitle, { color: colors.mutedForeground }]}>
          We sent a 6-digit code to{"\n"}
          <Text style={{ fontFamily: "Inter_600SemiBold", color: colors.foreground }}>
            {maskedPhone}
          </Text>
        </Text>

        {/* Demo hint */}
        {IS_DEMO_MODE && (
          <View style={[s.demoHint, { backgroundColor: colors.warningLight, borderColor: colors.warning }]}>
            <Text style={[s.demoHintText, { color: colors.warning }]}>
              Demo: use <Text style={{ fontFamily: "Inter_700Bold" }}>123456</Text>
            </Text>
          </View>
        )}

        {/* OTP Boxes */}
        <View style={s.otpWrap}>
          <DigitBoxes
            length={OTP_LENGTH}
            value={otp}
            onChange={setOtp}
            autoFocus
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

        {/* Verify button */}
        <TouchableOpacity
          style={[
            s.verifyBtn,
            {
              backgroundColor:
                otp.length === OTP_LENGTH ? colors.primary : colors.secondary,
              opacity: loading ? 0.75 : 1,
            },
          ]}
          onPress={() => handleVerify(otp)}
          disabled={loading || otp.length < OTP_LENGTH}
          activeOpacity={0.85}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text
              style={[
                s.verifyBtnText,
                {
                  color:
                    otp.length === OTP_LENGTH ? "#fff" : colors.mutedForeground,
                },
              ]}
            >
              Verify OTP
            </Text>
          )}
        </TouchableOpacity>

        {/* Resend */}
        <View style={s.resendRow}>
          <Text style={[s.resendLabel, { color: colors.mutedForeground }]}>
            Didn't receive it?{" "}
          </Text>
          {timer > 0 ? (
            <Text style={[s.resendTimer, { color: colors.primary }]}>
              Resend in {timer}s
            </Text>
          ) : (
            <TouchableOpacity onPress={handleResend} disabled={resending}>
              {resending ? (
                <ActivityIndicator size="small" color={colors.primary} />
              ) : (
                <Text style={[s.resendLink, { color: colors.primary }]}>
                  Resend OTP
                </Text>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Change number */}
        <TouchableOpacity
          style={s.changeBtn}
          onPress={() => router.replace("/auth/phone")}
        >
          <Feather name="edit-2" size={13} color={colors.mutedForeground} />
          <Text style={[s.changeText, { color: colors.mutedForeground }]}>
            Change phone number
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
    backBtn: {
      width: 40,
      height: 40,
      alignItems: "center",
      justifyContent: "center",
      marginBottom: 8,
    },
    content: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      paddingBottom: 40,
    },
    iconWrap: {
      marginBottom: 24,
    },
    iconCircle: {
      width: 88,
      height: 88,
      borderRadius: 44,
      alignItems: "center",
      justifyContent: "center",
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
      marginBottom: 20,
    },
    demoHint: {
      paddingHorizontal: 14,
      paddingVertical: 8,
      borderRadius: 10,
      borderWidth: 1,
      marginBottom: 20,
    },
    demoHintText: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
    },
    otpWrap: {
      marginBottom: 24,
      width: "100%",
      alignItems: "center",
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
    verifyBtn: {
      width: "100%",
      alignItems: "center",
      justifyContent: "center",
      borderRadius: 16,
      paddingVertical: 18,
      marginBottom: 20,
    },
    verifyBtnText: {
      fontSize: 17,
      fontFamily: "Inter_700Bold",
    },
    resendRow: {
      flexDirection: "row",
      alignItems: "center",
      marginBottom: 16,
    },
    resendLabel: {
      fontSize: 14,
      fontFamily: "Inter_400Regular",
    },
    resendTimer: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
    },
    resendLink: {
      fontSize: 14,
      fontFamily: "Inter_600SemiBold",
    },
    changeBtn: {
      flexDirection: "row",
      alignItems: "center",
      gap: 6,
    },
    changeText: {
      fontSize: 13,
      fontFamily: "Inter_400Regular",
    },
  });
