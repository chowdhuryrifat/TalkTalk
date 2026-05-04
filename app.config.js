// app.config.js – dynamic Expo config that injects environment variables
// from the .env file (via Expo's built-in dotenv support for SDK 49+).
// For SDK 51 the EXPO_PUBLIC_* prefix is the recommended way; this file
// keeps app.json values while also forwarding the key via `extra` for
// backwards-compat with expo-constants.

/** @type {import('@expo/config').ExpoConfig} */
module.exports = ({ config }) => {
  return {
    ...config,
    extra: {
      ...config.extra,
      geminiApiKey: process.env.EXPO_PUBLIC_GEMINI_API_KEY ?? "",
    },
  };
};
