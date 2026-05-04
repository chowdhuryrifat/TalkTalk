import React, { useEffect } from "react";
import {
  StyleSheet,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from "react-native";
import Animated, {
  cancelAnimation,
  Easing,
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withSequence,
  withTiming,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../constants/colors";
import { RecognitionStatus } from "../hooks/useVoiceRecognition";

interface MicButtonProps {
  status: RecognitionStatus;
  onPress: () => void;
  disabled?: boolean;
}

const PULSE_SIZE = 120;
const MIC_SIZE = 72;

export default function MicButton({
  status,
  onPress,
  disabled = false,
}: MicButtonProps): React.ReactElement {
  const isListening = status === "listening" || status === "awake";
  const isProcessing = status === "processing";

  // Pulse ring animation
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);

  useEffect(() => {
    if (isListening) {
      scale.value = withRepeat(
        withSequence(
          withTiming(1.6, { duration: 800, easing: Easing.out(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.in(Easing.ease) })
        ),
        -1,
        false
      );
      opacity.value = withRepeat(
        withSequence(
          withTiming(0.4, { duration: 800 }),
          withTiming(0, { duration: 800 })
        ),
        -1,
        false
      );
    } else {
      cancelAnimation(scale);
      cancelAnimation(opacity);
      scale.value = withTiming(1, { duration: 300 });
      opacity.value = withTiming(0, { duration: 300 });
    }
  }, [isListening, scale, opacity]);

  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value,
  }));

  const micColor = isListening
    ? COLORS.accent
    : isProcessing
    ? COLORS.textMuted
    : COLORS.text;

  return (
    <View style={styles.container}>
      {/* Animated pulse ring */}
      <Animated.View style={[styles.pulse, pulseStyle]} />

      {/* Main mic button */}
      <TouchableOpacity
        style={[
          styles.button,
          isListening && styles.buttonActive,
          disabled && styles.buttonDisabled,
        ]}
        onPress={onPress}
        activeOpacity={0.8}
        disabled={disabled}
        accessibilityLabel={isListening ? "Stop listening" : "Start listening"}
        accessibilityRole="button"
      >
        {isProcessing ? (
          <ActivityIndicator color={COLORS.accent} size="large" />
        ) : (
          <Ionicons
            name={isListening ? "mic" : "mic-outline"}
            size={36}
            color={micColor}
          />
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: PULSE_SIZE,
    height: PULSE_SIZE,
    alignItems: "center",
    justifyContent: "center",
  },
  pulse: {
    position: "absolute",
    width: MIC_SIZE + 8,
    height: MIC_SIZE + 8,
    borderRadius: (MIC_SIZE + 8) / 2,
    backgroundColor: COLORS.accent,
  },
  button: {
    width: MIC_SIZE,
    height: MIC_SIZE,
    borderRadius: MIC_SIZE / 2,
    backgroundColor: COLORS.surface,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.border,
  },
  buttonActive: {
    borderColor: COLORS.accent,
    backgroundColor: COLORS.accentDim,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
});
