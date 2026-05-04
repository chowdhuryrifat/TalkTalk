import Voice, {
  SpeechResultsEvent,
  SpeechErrorEvent,
} from "@react-native-voice/voice";

export type OnResultCallback = (transcript: string) => void;
export type OnErrorCallback = (error: string) => void;

export function initVoice(
  onResult: OnResultCallback,
  onError: OnErrorCallback
): void {
  Voice.onSpeechResults = (e: SpeechResultsEvent) => {
    const results = e.value ?? [];
    if (results.length > 0) {
      onResult(results[0]);
    }
  };

  Voice.onSpeechError = (e: SpeechErrorEvent) => {
    const msg =
      (e.error as { message?: string } | undefined)?.message ??
      "Speech recognition error.";
    onError(msg);
  };
}

export async function startListening(locale = "en-US"): Promise<void> {
  try {
    await Voice.start(locale);
  } catch (err) {
    throw new Error(
      `Failed to start speech recognition: ${(err as Error).message}`
    );
  }
}

export async function stopListening(): Promise<void> {
  try {
    await Voice.stop();
  } catch {
    // Ignore stop errors – mic may already be inactive
  }
}

export async function destroyVoice(): Promise<void> {
  try {
    await Voice.destroy();
    Voice.removeAllListeners();
  } catch {
    // Ignore cleanup errors
  }
}
