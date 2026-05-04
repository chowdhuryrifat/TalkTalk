import axios, { AxiosError } from "axios";
import GEMINI_API_KEY, { GEMINI_API_URL } from "../constants/config";

export interface WordData {
  original: string;
  translated: string;
  phonetic: string;
  partOfSpeech: string;
  definitionEN: string;
  definitionBN: string;
  exampleEN: [string, string];
  exampleBN: [string, string];
  scientificEN: string | null;
  scientificBN: string | null;
  voiceResponse: string;
}

const SYSTEM_PROMPT = `You are a bilingual language assistant that specializes in Bangla and English.
The user will give you a word or topic. You must return ONLY a valid JSON object with this exact structure:

{
  "original": "string",
  "translated": "string",
  "phonetic": "string",
  "partOfSpeech": "string",
  "definitionEN": "string",
  "definitionBN": "string",
  "exampleEN": ["string", "string"],
  "exampleBN": ["string", "string"],
  "scientificEN": "string or null",
  "scientificBN": "string or null",
  "voiceResponse": "string (a short, natural sentence to be spoken aloud summarizing the word)"
}

Detect whether the input is Bangla or English and translate accordingly.
If the word has a scientific meaning, fill the scientific fields. Otherwise set them to null.
Return ONLY the JSON. No markdown, no extra text.`;

function stripMarkdown(text: string): string {
  // Remove markdown code fences (```json ... ``` or ``` ... ```)
  return text
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```\s*$/, "")
    .trim();
}

function validateWordData(data: unknown): data is WordData {
  if (typeof data !== "object" || data === null) return false;
  const d = data as Record<string, unknown>;
  const requiredStrings: (keyof WordData)[] = [
    "original",
    "translated",
    "phonetic",
    "partOfSpeech",
    "definitionEN",
    "definitionBN",
    "voiceResponse",
  ];
  for (const key of requiredStrings) {
    if (typeof d[key] !== "string") return false;
  }
  if (
    !Array.isArray(d.exampleEN) ||
    d.exampleEN.length < 2 ||
    !Array.isArray(d.exampleBN) ||
    d.exampleBN.length < 2
  ) {
    return false;
  }
  return true;
}

export async function fetchWordData(query: string): Promise<WordData> {
  if (!GEMINI_API_KEY) {
    throw new Error(
      "Gemini API key is not configured. Please set EXPO_PUBLIC_GEMINI_API_KEY in your .env file."
    );
  }

  const requestBody = {
    contents: [
      {
        parts: [
          {
            text: `${SYSTEM_PROMPT}\n\nUser query: ${query}`,
          },
        ],
      },
    ],
    generationConfig: {
      temperature: 0.3,
      maxOutputTokens: 1024,
    },
  };

  try {
    const response = await axios.post(
      `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
      requestBody,
      {
        headers: { "Content-Type": "application/json" },
        timeout: 20000,
      }
    );

    const rawText: string =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";

    if (!rawText) {
      throw new Error("Empty response received from Gemini API.");
    }

    const cleaned = stripMarkdown(rawText);

    let parsed: unknown;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      throw new Error("Failed to parse Gemini response as JSON.");
    }

    if (!validateWordData(parsed)) {
      throw new Error("Gemini response is missing required fields.");
    }

    return parsed;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      const axiosErr = err as AxiosError<{ error?: { message?: string } }>;
      if (!axiosErr.response) {
        throw new Error(
          "No internet connection. Please check your network and try again."
        );
      }
      const status = axiosErr.response.status;
      if (status === 429) {
        throw new Error(
          "Gemini API rate limit reached. Please wait a moment and try again."
        );
      }
      if (status === 403) {
        throw new Error(
          "Invalid Gemini API key. Please check your .env configuration."
        );
      }
      const msg =
        axiosErr.response.data?.error?.message ?? axiosErr.message;
      throw new Error(`Gemini API error (${status}): ${msg}`);
    }
    throw err;
  }
}
