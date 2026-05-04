import { ExpoSpeechRecognitionModule } from "expo-speech-recognition";

export type OnResultCallback = (transcript: string) => void;
export type OnErrorCallback = (error: string) => void;

type Subscription = { remove: () => void };

let resultListener: Subscription | null = null;
let errorListener: Subscription | null = null;

export function initVoice(
  onResult: OnResultCallback,
  onError: OnErrorCallback
): void {
  // Remove any existing listeners before registering new ones
  resultListener?.remove();
  errorListener?.remove();

  resultListener = ExpoSpeechRecognitionModule.addListener(
    "result",
    (event: {
      results: Array<{ transcript: string; confidence: number }>;
      isFinal: boolean;
    }) => {
      if (event.results.length > 0) {
        onResult(event.results[0].transcript);
      }
    }
  );

  errorListener = ExpoSpeechRecognitionModule.addListener(
    "error",
    (event: { error: string; message: string }) => {
      const msg = event.message || event.error || "Speech recognition error.";
      // Ignore "no-speech" non-critical errors
      if (msg.toLowerCase().includes("no-speech")) return;
      onError(msg);
    }
  );
}

export async function startListening(locale = "en-US"): Promise<void> {
  try {
    const permission =
      await ExpoSpeechRecognitionModule.requestPermissionsAsync();
    if (!permission.granted) {
      throw new Error("Microphone permission denied.");
    }
    ExpoSpeechRecognitionModule.start({
      lang: locale,
      interimResults: true,
      continuous: false,
    });
  } catch (err) {
    throw new Error(
      `Failed to start speech recognition: ${(err as Error).message}`
    );
  }
}

export async function stopListening(): Promise<void> {
  try {
    ExpoSpeechRecognitionModule.stop();
  } catch {
    // Ignore stop errors – mic may already be inactive
  }
}

export async function destroyVoice(): Promise<void> {
  try {
    resultListener?.remove();
    errorListener?.remove();
    resultListener = null;
    errorListener = null;
    ExpoSpeechRecognitionModule.abort();
  } catch {
    // Ignore cleanup errors
  }
}
