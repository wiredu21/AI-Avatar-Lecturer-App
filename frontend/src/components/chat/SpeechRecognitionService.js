/**
 * Speech Recognition Service
 * Provides browser-compatible speech recognition functionality using Web Speech API
 */

// Initialize speech recognition based on browser compatibility
const initSpeechRecognition = () => {
  // Check for browser support
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    return null;
  }

  // Create speech recognition instance based on browser support
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();

  // Configure the recognition
  recognition.continuous = true;
  recognition.interimResults = true;
  recognition.lang = 'en-US'; // Default language

  return recognition;
};

// Create a singleton instance
let recognitionInstance = null;

/**
 * Get the speech recognition instance
 * @returns {SpeechRecognition|null} The speech recognition instance or null if not supported
 */
export const getSpeechRecognition = () => {
  if (!recognitionInstance) {
    recognitionInstance = initSpeechRecognition();
  }
  return recognitionInstance;
};

/**
 * Check if speech recognition is supported in this browser
 * @returns {boolean} Whether speech recognition is supported
 */
export const isSpeechRecognitionSupported = () => {
  return ('webkitSpeechRecognition' in window) || ('SpeechRecognition' in window);
};

/**
 * Start speech recognition with callback handlers
 * @param {Object} callbacks - Callback functions for different speech recognition events
 * @param {Function} callbacks.onResult - Called when a result is received
 * @param {Function} callbacks.onEnd - Called when recognition ends
 * @param {Function} callbacks.onError - Called when an error occurs
 * @param {string} language - Language code (e.g., 'en-US')
 * @returns {boolean} Whether recognition was successfully started
 */
export const startRecognition = (callbacks, language = 'en-US') => {
  const recognition = getSpeechRecognition();
  
  if (!recognition) {
    if (callbacks.onError) {
      callbacks.onError(new Error('Speech recognition not supported'));
    }
    return false;
  }

  // Set language
  recognition.lang = language;
  
  // Set up event handlers
  recognition.onresult = (event) => {
    if (callbacks.onResult) {
      const results = Array.from(event.results)
        .map(result => ({
          transcript: result[0].transcript,
          isFinal: result.isFinal,
          confidence: result[0].confidence
        }));
      
      callbacks.onResult(results);
    }
  };

  recognition.onend = () => {
    if (callbacks.onEnd) {
      callbacks.onEnd();
    }
  };

  recognition.onerror = (event) => {
    if (callbacks.onError) {
      callbacks.onError(new Error(event.error));
    }
  };

  // Start recognition
  try {
    recognition.start();
    return true;
  } catch (error) {
    if (callbacks.onError) {
      callbacks.onError(error);
    }
    return false;
  }
};

/**
 * Stop speech recognition
 * @returns {boolean} Whether recognition was successfully stopped
 */
export const stopRecognition = () => {
  const recognition = getSpeechRecognition();
  
  if (!recognition) {
    return false;
  }

  try {
    recognition.stop();
    return true;
  } catch (error) {
    console.error('Error stopping speech recognition:', error);
    return false;
  }
};

export default {
  isSpeechRecognitionSupported,
  startRecognition,
  stopRecognition
}; 