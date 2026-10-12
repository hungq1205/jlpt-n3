let currentAudio: HTMLAudioElement | null = null;

export const stopSpeech = () => {
  if ('speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
    currentAudio = null;
  }
};

/**
 * Web Speech API helper for Japanese pronunciation
 */
export const speakJapanese = (text: string, rate = 0.9, volume = 1) => {
  stopSpeech();

  // Clean text from translation symbols or furigana brackets if needed
  const cleanText = text.split('→')[0].replace(/[（）()]/g, '').trim();
  if (!cleanText) return;

  const voices = 'speechSynthesis' in window ? window.speechSynthesis.getVoices() : [];
  const jaVoice = voices.find(
    (v) => v.lang.toLowerCase().startsWith('ja') || v.name.toLowerCase().includes('japan')
  );

  if ('speechSynthesis' in window && jaVoice) {
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'ja-JP';
    utterance.rate = rate;
    utterance.volume = Math.max(0, Math.min(1, volume));
    utterance.voice = jaVoice;
    window.speechSynthesis.speak(utterance);
    return;
  }

  // Fallback: Online TTS for authentic native pronunciation
  try {
    const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=ja&client=tw-ob&q=${encodeURIComponent(cleanText)}`;
    currentAudio = new Audio(audioUrl);
    currentAudio.volume = Math.max(0, Math.min(1, volume));
    currentAudio.playbackRate = rate;
    currentAudio.play().catch(() => {});
  } catch {
    // If online audio blocked, try default speech synthesis
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'ja-JP';
      utterance.volume = Math.max(0, Math.min(1, volume));
      window.speechSynthesis.speak(utterance);
    }
  }
};

/**
 * Web Speech API helper for Vietnamese pronunciation
 * Falls back to native Vietnamese TTS audio so it is never spoken with an English accent
 */
export const speakVietnamese = (text: string, rate = 0.95, volume = 1) => {
  stopSpeech();

  const cleanText = text.replace(/[（）()]/g, '').trim();
  if (!cleanText) return;

  const voices = 'speechSynthesis' in window ? window.speechSynthesis.getVoices() : [];
  // Must be an actual Vietnamese voice, not a generic fallback
  const viVoice = voices.find(
    (v) => v.lang.toLowerCase().startsWith('vi') || v.name.toLowerCase().includes('vietnam')
  );

  if ('speechSynthesis' in window && viVoice) {
    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'vi-VN';
    utterance.rate = rate;
    utterance.volume = Math.max(0, Math.min(1, volume));
    utterance.voice = viVoice;
    window.speechSynthesis.speak(utterance);
    return;
  }

  // Fallback: Online Vietnamese TTS ensuring authentic native Vietnamese accent
  try {
    const audioUrl = `https://translate.google.com/translate_tts?ie=UTF-8&tl=vi&client=tw-ob&q=${encodeURIComponent(cleanText)}`;
    currentAudio = new Audio(audioUrl);
    currentAudio.volume = Math.max(0, Math.min(1, volume));
    currentAudio.playbackRate = rate;
    currentAudio.play().catch(() => {});
  } catch {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(cleanText);
      utterance.lang = 'vi-VN';
      utterance.volume = Math.max(0, Math.min(1, volume));
      window.speechSynthesis.speak(utterance);
    }
  }
};


