import axios from 'axios';

// Murf AI API base URL - replace with actual Murf AI API endpoint
const MURF_API_BASE_URL = 'https://api.murf.ai/v1';

// Sample voice options from Murf AI
const VOICE_OPTIONS = {
  male: [
    { id: 'm1', name: 'James', accent: 'American', style: 'Professional' },
    { id: 'm2', name: 'Mike', accent: 'British', style: 'Conversational' },
    { id: 'm3', name: 'Daniel', accent: 'Australian', style: 'Friendly' },
    { id: 'm4', name: 'Thomas', accent: 'American', style: 'Authoritative' },
  ],
  female: [
    { id: 'f1', name: 'Emma', accent: 'American', style: 'Professional' },
    { id: 'f2', name: 'Sarah', accent: 'British', style: 'Conversational' },
    { id: 'f3', name: 'Olivia', accent: 'Australian', style: 'Friendly' },
    { id: 'f4', name: 'Sophia', accent: 'American', style: 'Authoritative' },
  ]
};

// Function to get available voices by gender
export const getVoicesByGender = (gender) => {
  return VOICE_OPTIONS[gender] || [];
};

// Function to get all available voices
export const getAllVoices = () => {
  return {
    male: VOICE_OPTIONS.male,
    female: VOICE_OPTIONS.female
  };
};

// Function to generate a voice sample
export const generateVoiceSample = async (voiceId, text) => {
  try {
    // For development/testing purposes, use a mock implementation
    // In a production environment, you'd make an actual API call to Murf AI
    
    // Mock successful response
    if (process.env.NODE_ENV === 'development') {
      // Return a promise that resolves after a delay to simulate network request
      return new Promise((resolve) => {
        setTimeout(() => {
          // This would normally be an audio URL from Murf AI
          // For now, we'll use a placeholder URL
          resolve({
            success: true,
            audioUrl: `https://example.com/voice-samples/${voiceId}-sample.mp3`,
            text: text
          });
        }, 1000);
      });
    }
    
    // Actual API implementation for production
    const response = await axios.post(`${MURF_API_BASE_URL}/speech`, {
      voice_id: voiceId,
      text: text,
      // Add other required parameters based on Murf AI API documentation
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.REACT_APP_MURF_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error generating voice sample:', error);
    throw error;
  }
};

// Function to convert text to speech using selected voice
export const textToSpeech = async (voiceId, text) => {
  try {
    // For development/testing purposes
    if (process.env.NODE_ENV === 'development') {
      // Simulate API response
      return new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            success: true,
            audioUrl: `https://example.com/tts/${voiceId}/${encodeURIComponent(text)}.mp3`,
            text: text
          });
        }, 1500);
      });
    }
    
    // Actual API implementation
    const response = await axios.post(`${MURF_API_BASE_URL}/tts`, {
      voice_id: voiceId,
      text: text,
      // Add other required parameters
    }, {
      headers: {
        'Authorization': `Bearer ${process.env.REACT_APP_MURF_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error('Error in text-to-speech conversion:', error);
    throw error;
  }
};

export default {
  getVoicesByGender,
  getAllVoices,
  generateVoiceSample,
  textToSpeech
}; 