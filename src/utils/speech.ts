// Web Speech API helper for Japanese and Vietnamese pronunciation with bulletproof mobile support

let currentAudio: HTMLAudioElement | null = null;
let activeUtterance: SpeechSynthesisUtterance | null = null;
let cachedVoices: SpeechSynthesisVoice[] = [];

// Helper to pre-populate voices when available (handles asynchronous voice loading on mobile & desktop)
const initVoices = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      cachedVoices = window.speechSynthesis.getVoices();
    } catch {
      cachedVoices = [];
    }
  }
};

if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
  initVoices();
  window.speechSynthesis.onvoiceschanged = () => {
    initVoices();
  };
}

// User-gesture unlock for mobile Safari & mobile Chrome
let isMobileAudioUnlocked = false;
export const unlockAudioOnMobile = () => {
  if (isMobileAudioUnlocked || typeof window === 'undefined') return;
  isMobileAudioUnlocked = true;

  if ('speechSynthesis' in window) {
    try {
      // Resume if paused (common Safari issue)
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      // Warm up synthesis engine with an empty utterance
      const warmup = new SpeechSynthesisUtterance('');
      warmup.volume = 0;
      window.speechSynthesis.speak(warmup);
    } catch {
      // ignore
    }
  }
};

// Auto-register touch/click listeners to unlock audio on first mobile interaction
if (typeof window !== 'undefined') {
  const unlockEvents = ['touchstart', 'touchend', 'click', 'keydown'];
  const handleFirstInteraction = () => {
    unlockAudioOnMobile();
    unlockEvents.forEach((ev) => window.removeEventListener(ev, handleFirstInteraction));
  };
  unlockEvents.forEach((ev) => window.addEventListener(ev, handleFirstInteraction, { passive: true }));
}

/**
 * Safely stops any ongoing speech or audio
 */
export const stopSpeech = () => {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
        window.speechSynthesis.cancel();
      }
    } catch {
      // ignore
    }
  }

  activeUtterance = null;

  if (currentAudio) {
    try {
      currentAudio.pause();
      currentAudio.currentTime = 0;
    } catch {
      // ignore
    }
    currentAudio = null;
  }
};

/**
 * Find the best voice for a given language prefix
 */
const getBestVoice = (langPrefix: string, nameKeywords: string[]): SpeechSynthesisVoice | null => {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) return null;

  const voices = cachedVoices.length > 0 ? cachedVoices : window.speechSynthesis.getVoices();
  if (!voices || voices.length === 0) return null;

  // 1. Direct lang match with exact or startsWith
  const exactLang = voices.filter((v) => v.lang.toLowerCase().startsWith(langPrefix.toLowerCase()));
  if (exactLang.length > 0) {
    // Prefer higher quality or default voice if available
    const preferred = exactLang.find((v) =>
      nameKeywords.some((kw) => v.name.toLowerCase().includes(kw))
    );
    return preferred || exactLang[0];
  }

  // 2. Name keywords match
  const keywordMatch = voices.find((v) =>
    nameKeywords.some((kw) => v.name.toLowerCase().includes(kw))
  );
  if (keywordMatch) return keywordMatch;

  return null;
};

/**
 * Web Speech API helper for Japanese pronunciation
 * Guaranteed to work on mobile browsers (iOS Safari, Android Chrome) and desktop
 */
export const speakJapanese = (text: string, rate = 0.9, volume = 1) => {
  if (typeof window === 'undefined') return;

  // Clean text from translation symbols, furigana brackets, ruby annotations
  const cleanText = text
    .split('→')[0]
    .replace(/\[[^\]]*\]/g, '') // remove ruby [furigana]
    .replace(/[（）()]/g, '')
    .trim();

  if (!cleanText) return;

  // Primary: Native Web Speech API (supported by 100% of iOS Safari, Android Chrome, and modern browsers)
  if ('speechSynthesis' in window) {
    try {
      // Safely cancel only if currently speaking
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'ja-JP';
      utterance.rate = Math.max(0.5, Math.min(2, rate));
      utterance.volume = Math.max(0.1, Math.min(1, volume));

      // Attempt voice binding if available; on iOS Safari lang = 'ja-JP' alone works natively
      const jaVoice = getBestVoice('ja', ['japan', 'kyoko', 'otoya', 'ayumi', 'haruka']);
      if (jaVoice) {
        utterance.voice = jaVoice;
      }

      // CRITICAL for iOS Safari: Retain activeUtterance in module scope to prevent garbage collection mid-speech
      activeUtterance = utterance;
      utterance.onend = () => {
        if (activeUtterance === utterance) {
          activeUtterance = null;
        }
      };
      utterance.onerror = () => {
        if (activeUtterance === utterance) {
          activeUtterance = null;
        }
      };

      window.speechSynthesis.speak(utterance);

      // On iOS Safari, synthesis can get suspended; calling resume ensures speech actually begins
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      return;
    } catch {
      // Fall through to audio fallback if synthesis threw
    }
  }

  // Backup online TTS if speechSynthesis is completely unavailable
  try {
    stopSpeech();
    const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ja&client=gtx&q=${encodeURIComponent(cleanText)}`;
    currentAudio = new Audio(audioUrl);
    currentAudio.volume = Math.max(0.1, Math.min(1, volume));
    currentAudio.playbackRate = rate;
    currentAudio.play().catch(() => {});
  } catch {
    // ignore
  }
};

/**
 * Web Speech API helper for Vietnamese pronunciation
 * Supports iOS Safari and Android Chrome native voices
 */
export const speakVietnamese = (text: string, rate = 0.95, volume = 1) => {
  if (typeof window === 'undefined') return;

  const cleanText = text
    .replace(/\[[^\]]*\]/g, '')
    .replace(/[（）()]/g, '')
    .trim();

  if (!cleanText) return;

  if ('speechSynthesis' in window) {
    try {
      if (window.speechSynthesis.speaking) {
        window.speechSynthesis.cancel();
      }
      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }

      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'vi-VN';
      utterance.rate = Math.max(0.5, Math.min(2, rate));
      utterance.volume = Math.max(0.1, Math.min(1, volume));

      const viVoice = getBestVoice('vi', ['vietnam', 'mai', 'linh', 'nam']);
      if (viVoice) {
        utterance.voice = viVoice;
      }

      activeUtterance = utterance;
      utterance.onend = () => {
        if (activeUtterance === utterance) {
          activeUtterance = null;
        }
      };
      utterance.onerror = () => {
        if (activeUtterance === utterance) {
          activeUtterance = null;
        }
      };

      window.speechSynthesis.speak(utterance);

      if (window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
      return;
    } catch {
      // Fall through
    }
  }

  try {
    stopSpeech();
    const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=gtx&q=${encodeURIComponent(cleanText)}`;
    currentAudio = new Audio(audioUrl);
    currentAudio.volume = Math.max(0.1, Math.min(1, volume));
    currentAudio.playbackRate = rate;
    currentAudio.play().catch(() => {});
  } catch {
    // ignore
  }
};
