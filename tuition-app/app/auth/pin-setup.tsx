import { Feather } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
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

type Step = "create" | "confirm";

export default function PinSetupScreen() {
  const colors = useColors();
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { setupPin } = useAuth();

  const [step, setStep] = useState<Step>("create");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handlePinChange = (val: string) => {
    setError("");
    setPin(val);
    if (val.length === PIN_LENGTH) {
      setTimeout(() => setStep("confirm"), 200);
    }
  };

  const handleConfirmChange = async (val: string) => {
    setError("");
    setConfirmPin(val);
    if (val.length === PIN_LENGTH) {
      if (val !== pin) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        setError("PINs don't match. Try again.");
        setConfirmPin("");
        setPin("");
        setStep("create");
        return;
      }
      setLoading(true);
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        await setupPin(val);
        router.replace("/(tabs)");
      } catch {
        setError("Failed to save PIN. Please try again.");
        setLoading(false);
      }
    }
  };

  const handleSkip = () => {
    router.replace("/(tabs)");
  };

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

        <Text style={[s.title, { color: colors.foreground }]}>
          {step === "create" ? "Set Quick PIN" : "Confirm PIN"}
        </Text>
        <Text style={[s.subtitle, { color: colors.mutedForeground }]}>
          {step === "create"
            ? "Create a 4-digit PIN for faster logins.\nYou can skip this step."
            : "Enter the same PIN again to confirm."}
        </Text>

        {/* Indicator dots */}
        <View style={s.stepDots}>
          {(["create", "confirm"] as Step[]).map((s_, i) => (
            <View
              key={i}
              style={[
                s.dot,
                {
                  backgroundColor:
                    s_ === step ? colors.primary : colors.border,
                  width: s_ === step ? 20 : 8,
                },
              ]}
            />
          ))}
        </View>

        {/* PIN boxes */}
        <View style={s.pinWrap}>
          {step === "create" ? (
            <DigitBoxes
              length={PIN_LENGTH}
              value={pin}
              onChange={handlePinChange}
              autoFocus
              secret
              disabled={loading}
            />
          ) : (
            <DigitBoxes
              length={PIN_LENGTH}
              value={confirmPin}
              onChange={handleConfirmChange}
              autoFocus
              secret
              disabled={loading}
            />
          )}
        </View>

        {/* Error */}
        {error !== "" && (
          <View style={[s.errorBox, { backgroundColor: colors.dangerLight }]}>
            <Feather name="alert-circle" size={14} color={colors.danger} />
            <Text style={[s.errorText, { color: colors.danger }]}>{error}</Text>
          </View>
        )}

        {loading && (
          <ActivityIndicator
            color={colors.primary}
            style={{ marginTop: 16 }}
          />
        )}

        {/* Skip */}
        {!loading && (
          <TouchableOpacity style={s.skipBtn} onPress={handleSkip}>
            <Text style={[s.skipText, { color: colors.mutedForeground }]}>
              Skip for now
            </Text>
          </TouchableOpacity>
        )}

        <View style={[s.note, { backgroundColor: colors.secondary }]}>
          <Feather name="shield" size={14} color={colors.mutedForeground} />
          <Text style={[s.noteText, { color: colors.mutedForeground }]}>
            PIN stays on this device only. You'll still use OTP if you log in
            on a new phone.
          </Text>
        </View>
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
      fontSize: 26,
      fontFamily: "Inter_700Bold",
      letterSpacing: -0.5,
      marginBottom: 10,
      textAlign: "center",
    },
    subtitle: {
      fontSize: 15,
      fontFamily: "Inter_400Regular",
      textAlign: "center",
      lineHeight: 22,
      marginBottom: 28,
    },
    stepDots: {
      flexDirection: "row",
      gap: 6,
      alignItems: "center",
      marginBottom: 32,
    },
    dot: {
      height: 8,
      borderRadius: 4,
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
    skipBtn: {
      paddingVertical: 14,
      paddingHorizontal: 24,
      marginBottom: 24,
    },
    skipText: {
      fontSize: 15,
      fontFamily: "Inter_500Medium",
      textDecorationLine: "underline",
    },
    note: {
      flexDirection: "row",
      gap: 8,
      padding: 14,
      borderRadius: 14,
      alignSelf: "stretch",
    },
    noteText: {
      fontSize: 12,
      fontFamily: "Inter_400Regular",
      flex: 1,
      lineHeight: 18,
    },
  });
