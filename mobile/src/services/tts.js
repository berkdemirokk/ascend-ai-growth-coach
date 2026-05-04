// Text-to-speech wrapper around expo-speech (Apple's native AVSpeechSynthesizer
// on iOS, Android TTS engine on Android). Free, on-device — no audio assets to
// ship and no per-character cloud bill. Locale follows the device by default.
//
// We lazy-import the module so a missing native binding doesn't crash the app
// in dev builds where the pod hasn't been installed.

let speech = null;
let activeListener = null;

const loadSpeech = async () => {
  if (speech) return speech;
  try {
    const mod = await import('expo-speech');
    speech = mod.default ?? mod;
    return speech;
  } catch (e) {
    console.warn('[tts] expo-speech load failed:', e?.message || e);
    return null;
  }
};

export const speak = async (text, { lang, onDone, onError } = {}) => {
  if (!text || typeof text !== 'string') return false;
  const S = await loadSpeech();
  if (!S || typeof S.speak !== 'function') {
    onError?.(new Error('tts unavailable'));
    return false;
  }
  try {
    // Stop anything currently playing before starting the next utterance —
    // tapping "play" again on a different lesson should switch tracks, not
    // queue them.
    if (typeof S.stop === 'function') await S.stop();
    activeListener = { onDone, onError };
    S.speak(text, {
      language: lang,
      rate: 1.0,
      pitch: 1.0,
      onDone: () => {
        activeListener?.onDone?.();
        activeListener = null;
      },
      onStopped: () => {
        // Treat user-initiated stop as 'done' for the listener — same UX state.
        activeListener?.onDone?.();
        activeListener = null;
      },
      onError: (err) => {
        activeListener?.onError?.(err);
        activeListener = null;
      },
    });
    return true;
  } catch (e) {
    console.warn('[tts] speak error:', e?.message || e);
    onError?.(e);
    return false;
  }
};

export const stop = async () => {
  if (!speech || typeof speech.stop !== 'function') return false;
  try {
    await speech.stop();
    activeListener = null;
    return true;
  } catch (e) {
    console.warn('[tts] stop error:', e?.message || e);
    return false;
  }
};

export const isSpeakingAsync = async () => {
  if (!speech || typeof speech.isSpeakingAsync !== 'function') return false;
  try {
    return await speech.isSpeakingAsync();
  } catch {
    return false;
  }
};
