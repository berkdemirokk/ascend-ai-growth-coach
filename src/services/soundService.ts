// Sound effects service using native Audio API
const sounds = {
  success: 'https://assets.mixkit.co/active_storage/sfx/2013/2013-preview.mp3', // Level up / Success
  complete: 'https://assets.mixkit.co/active_storage/sfx/2000/2000-preview.mp3', // Task complete
  click: 'https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3', // Button click
  error: 'https://assets.mixkit.co/active_storage/sfx/2535/2535-preview.mp3', // Error
};

export const playSound = (type: keyof typeof sounds) => {
  try {
    const audio = new Audio(sounds[type]);
    audio.volume = 0.4;
    audio.play().catch(e => console.warn("Sound playback blocked or failed", e));
  } catch (error) {
    console.error("Sound service error", error);
  }
};
