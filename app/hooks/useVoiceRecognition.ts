import { useCallback, useEffect, useRef, useState } from "react";
import {
  destroyVoice,
  initVoice,
  startListening,
  stopListening,
} from "../services/speechService";

const WAKE_WORD = "command";

export type RecognitionStatus =
  | "idle"
  | "listening"
  | "awake"
  | "processing"
  | "error";

export interface UseVoiceRecognitionResult {
  status: RecognitionStatus;
  transcript: string;
  error: string | null;
  startRecognition: () => Promise<void>;
  stopRecognition: () => Promise<void>;
  resetTranscript: () => void;
}

export function useVoiceRecognition(
  onQueryReady: (query: string) => void
): UseVoiceRecognitionResult {
  const [status, setStatus] = useState<RecognitionStatus>("idle");
  const [transcript, setTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);

  // Track whether we have heard the wake word already
  const awakeRef = useRef(false);
  // Buffer raw transcripts while "awake"
  const queryBufferRef = useRef<string>("");

  useEffect(() => {
    initVoice(
      (result: string) => {
        const lower = result.toLowerCase().trim();

        if (!awakeRef.current) {
          // Check for wake word in the transcript
          if (lower.includes(WAKE_WORD)) {
            awakeRef.current = true;
            // Strip the wake word and everything before it
            const afterWake = lower
              .substring(lower.indexOf(WAKE_WORD) + WAKE_WORD.length)
              .trim();
            queryBufferRef.current = afterWake;
            setStatus("awake");
            setTranscript(afterWake);
          }
        } else {
          // Already awake – accumulate the query
          queryBufferRef.current = result
            .trim()
            .replace(new RegExp(`^${WAKE_WORD}\\s*`, "i"), "");
          setTranscript(queryBufferRef.current);
        }
      },
      (err: string) => {
        // Ignore "no match" non-critical errors
        if (err.toLowerCase().includes("no match")) return;
        setError(err);
        setStatus("error");
        awakeRef.current = false;
      }
    );

    return () => {
      destroyVoice();
    };
  }, []);

  const startRecognition = useCallback(async () => {
    setError(null);
    setTranscript("");
    awakeRef.current = false;
    queryBufferRef.current = "";
    setStatus("listening");
    await startListening("en-US");
  }, []);

  const stopRecognition = useCallback(async () => {
    await stopListening();

    const query = queryBufferRef.current.trim();
    if (query) {
      setStatus("processing");
      onQueryReady(query);
    } else {
      setStatus("idle");
    }
    awakeRef.current = false;
  }, [onQueryReady]);

  const resetTranscript = useCallback(() => {
    setTranscript("");
    setError(null);
    setStatus("idle");
    awakeRef.current = false;
    queryBufferRef.current = "";
  }, []);

  return {
    status,
    transcript,
    error,
    startRecognition,
    stopRecognition,
    resetTranscript,
  };
}
