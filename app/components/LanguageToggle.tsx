import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import COLORS from "../constants/colors";

export type Language = "en" | "bn";

interface LanguageToggleProps {
  selected: Language;
  onToggle: (lang: Language) => void;
  disabled?: boolean;
}

export default function LanguageToggle({
  selected,
  onToggle,
  disabled = false,
}: LanguageToggleProps): React.ReactElement {
  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.option, selected === "en" && styles.optionActive]}
        onPress={() => onToggle("en")}
        disabled={disabled}
        accessibilityLabel="English"
        accessibilityRole="button"
        accessibilityState={{ selected: selected === "en" }}
      >
        <Text
          style={[
            styles.label,
            selected === "en" ? styles.labelActive : styles.labelInactive,
          ]}
        >
          English
        </Text>
      </TouchableOpacity>

      <View style={styles.divider} />

      <TouchableOpacity
        style={[styles.option, selected === "bn" && styles.optionActive]}
        onPress={() => onToggle("bn")}
        disabled={disabled}
        accessibilityLabel="Bangla"
        accessibilityRole="button"
        accessibilityState={{ selected: selected === "bn" }}
      >
        <Text
          style={[
            styles.label,
            selected === "bn" ? styles.labelActive : styles.labelInactive,
          ]}
        >
          বাংলা
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: COLORS.border,
    overflow: "hidden",
  },
  option: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  optionActive: {
    backgroundColor: COLORS.accent,
    borderRadius: 24,
  },
  divider: {
    width: 1,
    backgroundColor: COLORS.border,
    marginVertical: 6,
  },
  label: {
    fontSize: 14,
    fontWeight: "600",
  },
  labelActive: {
    color: COLORS.text,
  },
  labelInactive: {
    color: COLORS.textSecondary,
  },
});
