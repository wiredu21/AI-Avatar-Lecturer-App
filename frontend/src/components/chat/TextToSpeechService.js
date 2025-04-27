/**
 * Text to Speech Service
 * Provides browser-compatible text-to-speech functionality using Web Speech API
 */

// Cache for selected voice
let selectedVoice = null;

/**
 * Check if speech synthesis is supported in this browser
 * @returns {boolean} Whether speech synthesis is supported
 */
export const isSpeechSynthesisSupported = () => {
  return 'speechSynthesis' in window;
};

/**
 * Get available voices, filtered by language if specified
 * @param {string} lang - Optional language code to filter voices (e.g., 'en-US')
 * @returns {Array} List of available voices
 */
export const getAvailableVoices = (lang = null) => {
  if (!isSpeechSynthesisSupported()) {
    return [];
  }

  // Get all voices from the browser
  const voices = window.speechSynthesis.getVoices();

  // Filter by language if specified
  if (lang) {
    return voices.filter(voice => voice.lang.includes(lang));
  }

  return voices;
};

/**
 * Set the voice to use for speech synthesis
 * @param {Object|string} voice - Voice object or voice URI to use
 */
export const setVoice = (voice) => {
  if (typeof voice === 'string') {
    // If voice is a string, find the matching voice object
    const voices = getAvailableVoices();
    selectedVoice = voices.find(v => v.voiceURI === voice) || null;
  } else {
    // If voice is an object, use it directly
    selectedVoice = voice;
  }
};

/**
 * Get the currently selected voice
 * @returns {Object|null} The currently selected voice or null if none selected
 */
export const getSelectedVoice = () => {
  return selectedVoice;
};

/**
 * Convert text to speech
 * @param {string} text - Text to convert to speech
 * @param {Object} options - Options for speech synthesis
 * @param {number} options.rate - Speech rate (0.1 to 10)
 * @param {number} options.pitch - Speech pitch (0 to 2)
 * @param {number} options.volume - Speech volume (0 to 1)
 * @param {Function} options.onStart - Callback when speech starts
 * @param {Function} options.onEnd - Callback when speech ends
 * @param {Function} options.onError - Callback when an error occurs
 * @param {Object} options.voice - Voice to use (overrides selected voice)
 * @returns {SpeechSynthesisUtterance} The utterance object
 */
export const speak = (text, options = {}) => {
  if (!isSpeechSynthesisSupported()) {
    if (options.onError) {
      options.onError(new Error('Speech synthesis not supported'));
    }
    return null;
  }

  // Cancel any existing speech
  window.speechSynthesis.cancel();

  // Create a new utterance
  const utterance = new SpeechSynthesisUtterance(text);
  
  // Set voice (use specified voice, selected voice, or default)
  const voiceToUse = options.voice || selectedVoice;
  if (voiceToUse) {
    utterance.voice = voiceToUse;
  }

  // Set options
  if (options.rate !== undefined) utterance.rate = options.rate;
  if (options.pitch !== undefined) utterance.pitch = options.pitch;
  if (options.volume !== undefined) utterance.volume = options.volume;

  // Set event handlers
  if (options.onStart) utterance.onstart = options.onStart;
  if (options.onEnd) utterance.onend = options.onEnd;
  if (options.onError) utterance.onerror = options.onError;

  // Start speaking
  window.speechSynthesis.speak(utterance);

  return utterance;
};

/**
 * Stop speech synthesis
 */
export const stopSpeaking = () => {
  if (isSpeechSynthesisSupported()) {
    window.speechSynthesis.cancel();
  }
};

/**
 * Initialize voice selection with sane defaults
 * @param {string} preferredGender - 'male' or 'female'
 * @param {string} preferredLang - Language code (e.g., 'en-US')
 */
export const initializeVoice = (preferredGender = null, preferredLang = 'en-US') => {
  if (!isSpeechSynthesisSupported()) {
    return;
  }

  // Get available voices for the preferred language
  const voices = getAvailableVoices(preferredLang);
  
  if (voices.length === 0) {
    // If no voices are available for the preferred language, get all voices
    const allVoices = getAvailableVoices();
    if (allVoices.length > 0) {
      selectedVoice = allVoices[0];
      return;
    }
    return;
  }

  // If gender preference is specified, try to find a matching voice
  if (preferredGender) {
    // Convert to lowercase for comparison
    const gender = preferredGender.toLowerCase();
    
    // Look for voice names that might indicate gender
    // This is a best-effort approach as the Web Speech API doesn't provide gender info
    for (const voice of voices) {
      const name = voice.name.toLowerCase();
      
      if (gender === 'female' && 
          (name.includes('female') || name.includes('woman') || 
           name.includes('girl') || name.includes('fiona') || 
           name.includes('samantha') || name.includes('karen') || 
           name.includes('moira'))) {
        selectedVoice = voice;
        return;
      }
      
      if (gender === 'male' && 
          (name.includes('male') || name.includes('man') || 
           name.includes('boy') || name.includes('guy') || 
           name.includes('david') || name.includes('mark') || 
           name.includes('daniel'))) {
        selectedVoice = voice;
        return;
      }
    }
  }
  
  // If no voice was selected by gender preference, use the first available voice
  selectedVoice = voices[0];
};

export default {
  isSpeechSynthesisSupported,
  getAvailableVoices,
  setVoice,
  getSelectedVoice,
  speak,
  stopSpeaking,
  initializeVoice
}; 