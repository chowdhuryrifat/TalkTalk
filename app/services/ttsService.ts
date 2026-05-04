import * as Speech from "expo-speech";

export type Language = "en" | "bn";

const LOCALE_MAP: Record<Language, string> = {
  en: "en-US",
  bn: "bn-BD",
};

export async function speak(text: string, language: Language = "en"): Promise<void> {
  // Stop any ongoing speech before starting a new one
  await Speech.stop();

  return new Promise((resolve) => {
    Speech.speak(text, {
      language: LOCALE_MAP[language],
      pitch: 1.0,
      rate: 0.9,
      onDone: resolve,
      onError: () => resolve(), // Resolve on error so the app doesn't hang
    });
  });
}

export async function stopSpeaking(): Promise<void> {
  await Speech.stop();
}
