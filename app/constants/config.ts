import Constants from "expo-constants";

/**
 * Access the Gemini API key stored in the .env file.
 *
 * Setup:
 *   1. Copy .env.example → .env
 *   2. Set GEMINI_API_KEY=<your key>
 *   3. The key is read at build time via expo-constants / app.config.js.
 *
 * For Expo SDK 49+ you can also use EXPO_PUBLIC_ prefix environment variables
 * directly without extra config. Both approaches are shown below; the
 * expo-constants approach is used to stay compatible with the managed workflow.
 */

const expoConfig = Constants.expoConfig?.extra ?? {};

const GEMINI_API_KEY: string =
  // Expo SDK 49+ public env var (prefixed with EXPO_PUBLIC_)
  (process.env.EXPO_PUBLIC_GEMINI_API_KEY as string) ||
  // Fallback: value injected via app.config.js extra field
  (expoConfig.geminiApiKey as string) ||
  "";

export const GEMINI_API_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent";

export default GEMINI_API_KEY;
