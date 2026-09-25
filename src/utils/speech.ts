/**
 * Web Speech API helper for Japanese pronunciation
 */
export const speakJapanese = (text: string, rate = 0.9) => {
  if (!('speechSynthesis' in window)) {
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  // Clean text from translation symbols or furigana brackets if needed
  const cleanText = text.split('→')[0].replace(/[（）()]/g, '').trim();

  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = 'ja-JP';
  utterance.rate = rate;

  // Try to pick a Japanese voice if available
  const voices = window.speechSynthesis.getVoices();
  const jaVoice = voices.find(v => v.lang.startsWith('ja') || v.lang.replace('_', '-').toLowerCase() === 'ja-jp');
  if (jaVoice) {
    utterance.voice = jaVoice;
  }

  window.speechSynthesis.speak(utterance);
};

/**
 * Web Speech API helper for Vietnamese pronunciation
 */
export const speakVietnamese = (text: string, rate = 0.95) => {
  if (!('speechSynthesis' in window)) {
    return;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  const cleanText = text.replace(/[（）()]/g, '').trim();
  const utterance = new SpeechSynthesisUtterance(cleanText);
  utterance.lang = 'vi-VN';
  utterance.rate = rate;

  // Try to pick a Vietnamese voice if available
  const voices = window.speechSynthesis.getVoices();
  const viVoice = voices.find(v => v.lang.startsWith('vi') || v.lang.replace('_', '-').toLowerCase() === 'vi-vn');
  if (viVoice) {
    utterance.voice = viVoice;
  }

  window.speechSynthesis.speak(utterance);
};

