import React, { useCallback, useRef, useState } from "react";
import {
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import COLORS from "../constants/colors";
import MicButton from "../components/MicButton";
import LanguageToggle, { Language } from "../components/LanguageToggle";
import WordCard from "../components/WordCard";
import { fetchWordData, WordData } from "../services/geminiService";
import { speak } from "../services/ttsService";
import { useVoiceRecognition } from "../hooks/useVoiceRecognition";

export default function HomeScreen(): React.ReactElement {
  const [language, setLanguage] = useState<Language>("en");
  const [wordData, setWordData] = useState<WordData | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Stable ref so handleQueryReady can call resetTranscript without
  // being listed as a dependency (avoids circular hook ordering issues).
  const resetTranscriptRef = useRef<() => void>(() => undefined);

  const handleQueryReady = useCallback(
    async (query: string) => {
      setIsProcessing(true);
      setErrorMessage(null);
      try {
        const data = await fetchWordData(query);
        setWordData(data);
        // Speak the voice response in the selected language
        const spokenText =
          language === "en" ? data.voiceResponse : data.definitionBN;
        await speak(spokenText, language);
      } catch (err) {
        const msg =
          err instanceof Error ? err.message : "An unexpected error occurred.";
        setErrorMessage(msg);
        Alert.alert("Error", msg);
      } finally {
        setIsProcessing(false);
        resetTranscriptRef.current();
      }
    },
    [language]
  );

  const { status, transcript, error, startRecognition, stopRecognition, resetTranscript } =
    useVoiceRecognition(handleQueryReady);

  // Keep the ref in sync with the latest stable resetTranscript function.
  resetTranscriptRef.current = resetTranscript;

  const isDisabled = isProcessing || status === "processing";

  const handleMicPress = useCallback(async () => {
    if (isDisabled) return;

    if (status === "idle" || status === "error") {
      setErrorMessage(null);
      await startRecognition();
    } else if (status === "listening" || status === "awake") {
      await stopRecognition();
    }
  }, [isDisabled, status, startRecognition, stopRecognition]);

  const handleReplay = useCallback(async () => {
    if (!wordData) return;
    const spokenText =
      language === "en" ? wordData.voiceResponse : wordData.definitionBN;
    await speak(spokenText, language);
  }, [wordData, language]);

  const statusLabel = (): string => {
    if (isProcessing) return "Processing...";
    switch (status) {
      case "listening":
        return 'Listening… say "command" then your query';
      case "awake":
        return transcript
          ? `Heard: "${transcript}"`
          : "Ready for your query...";
      case "processing":
        return "Processing...";
      case "error":
        return error ?? "Something went wrong";
      default:
        return "Tap to activate";
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* App title */}
        <View style={styles.titleContainer}>
          <Text style={styles.appTitle}>LinguaVoice</Text>
          <Text style={styles.appSubtitle}>Voice-powered language assistant</Text>
        </View>

        {/* Language toggle */}
        <View style={styles.toggleContainer}>
          <LanguageToggle
            selected={language}
            onToggle={setLanguage}
            disabled={isDisabled}
          />
        </View>

        {/* Mic button */}
        <View style={styles.micContainer}>
          <MicButton
            status={isProcessing ? "processing" : status}
            onPress={handleMicPress}
            disabled={isDisabled}
          />
        </View>

        {/* Status text */}
        <Text
          style={[
            styles.statusText,
            (status === "error" || errorMessage) && styles.statusError,
          ]}
          numberOfLines={2}
        >
          {statusLabel()}
        </Text>

        {/* Error banner */}
        {errorMessage && (
          <View style={styles.errorBanner}>
            <Text style={styles.errorBannerText}>{errorMessage}</Text>
          </View>
        )}

        {/* Word card */}
        {wordData && (
          <View style={styles.cardContainer}>
            <WordCard
              data={wordData}
              language={language}
              onReplay={handleReplay}
            />
          </View>
        )}

        {/* Usage hint */}
        {!wordData && status === "idle" && (
          <Text style={styles.hintText}>
            {'Tap the mic, say "command" followed by a word or topic.'}
          </Text>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 48,
    paddingBottom: 32,
  },
  titleContainer: {
    alignItems: "center",
    marginBottom: 28,
  },
  appTitle: {
    fontSize: 32,
    fontWeight: "800",
    color: COLORS.text,
    letterSpacing: 0.5,
  },
  appSubtitle: {
    fontSize: 14,
    color: COLORS.textSecondary,
    marginTop: 4,
  },
  toggleContainer: {
    marginBottom: 40,
  },
  micContainer: {
    marginBottom: 24,
  },
  statusText: {
    fontSize: 15,
    color: COLORS.textSecondary,
    textAlign: "center",
    maxWidth: 280,
    lineHeight: 22,
    marginBottom: 16,
  },
  statusError: {
    color: COLORS.error,
  },
  errorBanner: {
    backgroundColor: "#3D1515",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.error,
    padding: 12,
    width: "100%",
    marginBottom: 16,
  },
  errorBannerText: {
    color: COLORS.error,
    fontSize: 13,
    textAlign: "center",
    lineHeight: 19,
  },
  cardContainer: {
    width: "100%",
    marginTop: 8,
  },
  hintText: {
    fontSize: 13,
    color: COLORS.textMuted,
    textAlign: "center",
    maxWidth: 260,
    lineHeight: 20,
    marginTop: 12,
  },
});
