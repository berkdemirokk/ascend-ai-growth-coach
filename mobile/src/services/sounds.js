// Lightweight wrapper around expo-av for short UI sound effects.
// Lazy-loads modules + assets so missing files don't crash bundler.

let Audio = null;
let loaded = false;
const cache = {};
let muted = false;

// Resolve sound asset lazily; returns require() result or null.
function getSource(name) {
  try {
    switch (name) {
      case 'tap': return require('../../assets/sounds/tap.wav');
      case 'correct': return require('../../assets/sounds/correct.wav');
      case 'wrong': return require('../../assets/sounds/wrong.wav');
      case 'complete': return require('../../assets/sounds/complete.wav');
      case 'milestone': return require('../../assets/sounds/milestone.wav');
      default: return null;
    }
  } catch {
    return null;
  }
}

async function ensureLoaded() {
  if (loaded) return Audio;
  loaded = true;
  try {
    const mod = await import('expo-av');
    Audio = mod.Audio;
    if (Audio?.setAudioModeAsync) {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS: false,
        staysActiveInBackground: false,
        shouldDuckAndroid: true,
      });
    }
  } catch {
    Audio = null;
  }
  return Audio;
}

export async function playSound(name) {
  if (muted) return;
  const A = await ensureLoaded();
  if (!A) return;
  const src = getSource(name);
  if (!src) return; // file missing — silent no-op
  try {
    if (cache[name]) {
      await cache[name].replayAsync();
      return;
    }
    const { sound } = await A.Sound.createAsync(src, {
      shouldPlay: true,
      volume: 0.6,
    });
    cache[name] = sound;
    sound.setOnPlaybackStatusUpdate((status) => {
      if (status?.didJustFinish) {
        sound.unloadAsync().catch(() => {});
        delete cache[name];
      }
    });
  } catch {
    // silent
  }
}

export function setMuted(value) {
  muted = !!value;
}

export function isMuted() {
  return muted;
}
