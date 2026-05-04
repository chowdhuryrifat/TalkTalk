# LinguaVoice

A voice-powered bilingual language assistant built with **Expo (managed workflow, TypeScript)**. Ask about any word or topic in Bangla or English and receive a translated definition, phonetic, examples, and scientific explanation — delivered both visually and via text-to-speech.

---

## Features

- 🎙️ **Voice activation** – tap the mic, say `"command"` followed by your query
- 🌐 **Bilingual** – Bangla ↔ English translation & description
- 🤖 **Gemini 1.5 Flash** AI for translation, definition, and scientific explanation
- 🔊 **Text-to-speech** playback via `expo-speech`
- ✨ **Animated mic button** with pulse effect (`react-native-reanimated`)
- 🌙 **Dark theme** with electric-blue accent (`#4F8EF7`)
- 📱 **Android & iOS** compatible

---

## Tech Stack

| Purpose | Library |
|---------|---------|
| Framework | Expo (managed workflow) + TypeScript |
| Speech-to-Text | `@react-native-voice/voice` |
| AI / Translation | Google Gemini 1.5 Flash API |
| Text-to-Speech | `expo-speech` |
| HTTP | `axios` |
| Animations | `react-native-reanimated` |
| Icons | `@expo/vector-icons` |

---

## Getting Started

### 1. Clone & install

```bash
git clone https://github.com/chowdhuryrifat/TalkTalk.git
cd TalkTalk
npm install
```

### 2. Configure your Gemini API key

```bash
cp .env.example .env
```

Edit `.env` and replace `your_gemini_api_key_here` with your key from [Google AI Studio](https://aistudio.google.com/app/apikey):

```
EXPO_PUBLIC_GEMINI_API_KEY=AIza...
```

> **Security note:** The `.env` file is listed in `.gitignore` and will never be committed.

### 3. Start the app

```bash
# Interactive dev menu
npx expo start

# Android
npx expo start --android

# iOS
npx expo start --ios
```

---

## App Flow

1. Tap the **mic button** → app enters listening mode (animated pulse)
2. Say **"command"** → app wakes up and starts capturing your query
3. Speak your word or topic (e.g. *"command photosynthesis"*)
4. App sends the query to **Gemini API**
5. Response is displayed as a **WordCard** with Meaning / Examples / Scientific tabs
6. **expo-speech** reads out the summary in your chosen language

---

## Project Structure

```
/app
  /components
    MicButton.tsx        ← animated mic with pulse
    LanguageToggle.tsx   ← EN / BN selector
    WordCard.tsx         ← tabbed info card + speaker replay
  /screens
    HomeScreen.tsx       ← main screen
  /services
    geminiService.ts     ← Gemini API calls + response parsing
    speechService.ts     ← STT start/stop via @react-native-voice/voice
    ttsService.ts        ← TTS wrapper around expo-speech
  /hooks
    useVoiceRecognition.ts ← voice state machine + wake-word detection
  /constants
    colors.ts            ← dark theme color tokens
    config.ts            ← GEMINI_API_KEY + endpoint URL
App.tsx                  ← entry point
```

---

## Environment Variables

| Variable | Description |
|----------|-------------|
| `EXPO_PUBLIC_GEMINI_API_KEY` | Your Google Gemini API key (required) |

Expo automatically exposes `EXPO_PUBLIC_*` variables to the app bundle at build time.

---

## License

MIT
