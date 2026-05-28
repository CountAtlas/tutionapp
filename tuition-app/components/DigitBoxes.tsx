import * as Haptics from "expo-haptics";
import React, { useEffect, useRef, useState } from "react";
import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { useColors } from "@/hooks/useColors";

interface DigitBoxesProps {
  length: number;
  value: string;
  onChange: (val: string) => void;
  autoFocus?: boolean;
  secret?: boolean;
  disabled?: boolean;
}

export function DigitBoxes({
  length,
  value,
  onChange,
  autoFocus = true,
  secret = false,
  disabled = false,
}: DigitBoxesProps) {
  const colors = useColors();
  const inputs = useRef<(TextInput | null)[]>([]);
  const [focused, setFocused] = useState<number>(-1);

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => inputs.current[0]?.focus(), 300);
    }
  }, [autoFocus]);

  const handleChange = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, "").slice(-1);
    const chars = value.split("");
    chars[index] = digit;
    const next = chars.join("").slice(0, length);
    onChange(next);

    if (digit && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
    if (digit) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
    }
  };

  const handleKeyPress = (key: string, index: number) => {
    if (key === "Backspace") {
      if (value[index]) {
        const chars = value.split("");
        chars[index] = "";
        onChange(chars.join(""));
      } else if (index > 0) {
        inputs.current[index - 1]?.focus();
        const chars = value.split("");
        chars[index - 1] = "";
        onChange(chars.join(""));
      }
    }
  };

  const handleBoxPress = (index: number) => {
    const filled = value.length;
    const target = Math.min(index, filled);
    inputs.current[target]?.focus();
  };

  return (
    <View style={styles.row}>
      {Array.from({ length }).map((_, i) => {
        const char = value[i] || "";
        const isFocused = focused === i;
        const isFilled = !!char;

        return (
          <TouchableOpacity
            key={i}
            activeOpacity={0.8}
            onPress={() => handleBoxPress(i)}
            style={[
              styles.box,
              {
                borderColor: isFocused
                  ? colors.primary
                  : isFilled
                  ? colors.primaryLight
                  : colors.border,
                backgroundColor: isFilled
                  ? colors.primaryLight + "22"
                  : colors.card,
              },
            ]}
          >
            {isFilled && (
              <Text style={[styles.digit, { color: colors.foreground }]}>
                {secret ? "●" : char}
              </Text>
            )}
            {isFocused && !isFilled && (
              <View style={[styles.cursor, { backgroundColor: colors.primary }]} />
            )}
            <TextInput
              ref={(ref) => {
                inputs.current[i] = ref;
              }}
              style={styles.hidden}
              value={char}
              onChangeText={(text) => handleChange(text, i)}
              onKeyPress={({ nativeEvent }) => handleKeyPress(nativeEvent.key, i)}
              keyboardType="number-pad"
              maxLength={1}
              onFocus={() => setFocused(i)}
              onBlur={() => setFocused((prev) => (prev === i ? -1 : prev))}
              editable={!disabled}
              caretHidden
              textContentType="oneTimeCode"
              autoComplete={Platform.OS === "web" ? "one-time-code" : "sms-otp"}
            />
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  box: {
    width: 52,
    height: 64,
    borderRadius: 14,
    borderWidth: 2,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  digit: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    lineHeight: 32,
  },
  cursor: {
    width: 2,
    height: 28,
    borderRadius: 1,
    opacity: 0.8,
  },
  hidden: {
    position: "absolute",
    width: 1,
    height: 1,
    opacity: 0,
  },
});
