import React, { useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import COLORS from "../constants/colors";
import { WordData } from "../services/geminiService";
import { Language } from "./LanguageToggle";

interface WordCardProps {
  data: WordData;
  language: Language;
  onReplay: () => void;
}

type Tab = "meaning" | "examples" | "scientific";

export default function WordCard({
  data,
  language,
  onReplay,
}: WordCardProps): React.ReactElement {
  const [activeTab, setActiveTab] = useState<Tab>("meaning");

  const tabs: { key: Tab; label: string }[] = [
    { key: "meaning", label: "Meaning" },
    { key: "examples", label: "Examples" },
    { key: "scientific", label: "Scientific" },
  ];

  return (
    <View style={styles.card}>
      {/* Header row */}
      <View style={styles.header}>
        <View style={styles.wordInfo}>
          <Text style={styles.original}>{data.original}</Text>
          <Text style={styles.phonetic}>{data.phonetic}</Text>
        </View>
        <TouchableOpacity
          style={styles.speakerButton}
          onPress={onReplay}
          accessibilityLabel="Replay voice response"
          accessibilityRole="button"
        >
          <Ionicons name="volume-high-outline" size={22} color={COLORS.accent} />
        </TouchableOpacity>
      </View>

      {/* Translated word + part of speech */}
      <View style={styles.translationRow}>
        <Text style={styles.translated}>{data.translated}</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{data.partOfSpeech}</Text>
        </View>
      </View>

      {/* Tabs */}
      <View style={styles.tabRow}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.tab,
              activeTab === tab.key && styles.tabActive,
            ]}
            onPress={() => setActiveTab(tab.key)}
            accessibilityRole="tab"
            accessibilityState={{ selected: activeTab === tab.key }}
          >
            <Text
              style={[
                styles.tabLabel,
                activeTab === tab.key && styles.tabLabelActive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Tab content */}
      <ScrollView style={styles.contentArea} showsVerticalScrollIndicator={false}>
        {activeTab === "meaning" && (
          <View>
            <SectionLabel label="English" />
            <Text style={styles.bodyText}>{data.definitionEN}</Text>
            <SectionLabel label="বাংলা" />
            <Text style={styles.bodyText}>{data.definitionBN}</Text>
          </View>
        )}

        {activeTab === "examples" && (
          <View>
            <SectionLabel label="English" />
            {data.exampleEN.map((ex, i) => (
              <Text key={i} style={styles.exampleText}>
                {`${i + 1}. ${ex}`}
              </Text>
            ))}
            <SectionLabel label="বাংলা" />
            {data.exampleBN.map((ex, i) => (
              <Text key={i} style={styles.exampleText}>
                {`${i + 1}. ${ex}`}
              </Text>
            ))}
          </View>
        )}

        {activeTab === "scientific" && (
          <View>
            {data.scientificEN || data.scientificBN ? (
              <>
                {data.scientificEN && (
                  <>
                    <SectionLabel label="English" />
                    <Text style={styles.bodyText}>{data.scientificEN}</Text>
                  </>
                )}
                {data.scientificBN && (
                  <>
                    <SectionLabel label="বাংলা" />
                    <Text style={styles.bodyText}>{data.scientificBN}</Text>
                  </>
                )}
              </>
            ) : (
              <Text style={styles.emptyText}>
                No scientific information available for this word.
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

function SectionLabel({ label }: { label: string }): React.ReactElement {
  return <Text style={styles.sectionLabel}>{label}</Text>;
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.card,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  wordInfo: {
    flex: 1,
  },
  original: {
    fontSize: 26,
    fontWeight: "700",
    color: COLORS.text,
  },
  phonetic: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 2,
    fontStyle: "italic",
  },
  speakerButton: {
    padding: 8,
    backgroundColor: COLORS.surface,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  translationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 16,
  },
  translated: {
    fontSize: 18,
    fontWeight: "600",
    color: COLORS.accent,
    marginRight: 10,
  },
  badge: {
    backgroundColor: COLORS.accentDim,
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  badgeText: {
    fontSize: 11,
    color: COLORS.text,
    fontWeight: "600",
    textTransform: "capitalize",
  },
  tabRow: {
    flexDirection: "row",
    backgroundColor: COLORS.surface,
    borderRadius: 10,
    padding: 3,
    marginBottom: 14,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    paddingVertical: 8,
    borderRadius: 8,
  },
  tabActive: {
    backgroundColor: COLORS.tabActive,
  },
  tabLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: COLORS.textMuted,
  },
  tabLabelActive: {
    color: COLORS.text,
  },
  contentArea: {
    maxHeight: 220,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "700",
    color: COLORS.accent,
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginTop: 10,
    marginBottom: 4,
  },
  bodyText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 21,
  },
  exampleText: {
    fontSize: 14,
    color: COLORS.textSecondary,
    lineHeight: 21,
    marginBottom: 4,
  },
  emptyText: {
    fontSize: 14,
    color: COLORS.textMuted,
    fontStyle: "italic",
    textAlign: "center",
    marginTop: 20,
  },
});
