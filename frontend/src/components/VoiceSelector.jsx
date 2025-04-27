import React, { useState, useEffect, useRef } from "react";
import { Label } from "./ui/label";
import { RadioGroup, RadioGroupItem } from "./ui/radio-group";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { 
  Play, 
  Pause, 
  Volume2,
  VolumeX, 
  ChevronDown, 
  ChevronUp 
} from "lucide-react";
import { getVoicesByGender, generateVoiceSample } from "../services/MurfAIService";

// Sample text for voice preview
const SAMPLE_TEXT = "Hello, I'm your AI lecturer. I'm here to help you learn.";

const VoiceSelector = ({ selectedVoice, setSelectedVoice, gender, setGender }) => {
  const [femaleVoices, setFemaleVoices] = useState([]);
  const [maleVoices, setMaleVoices] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [loadingVoice, setLoadingVoice] = useState(null);
  const audioRef = useRef(null);

  // Load voices for both genders on component mount
  useEffect(() => {
    setFemaleVoices(getVoicesByGender('female'));
    setMaleVoices(getVoicesByGender('male'));
  }, []);

  // Remove gender mismatch check - let the parent component handle this instead
  // The parent will decide which voices to show and will prevent mismatches

  // Stop audio playback when component unmounts
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
    };
  }, []);

  // Handle voice sample playback
  const handleVoiceSample = async (voiceId) => {
    try {
      // Stop current audio if playing
      if (audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      }

      // If the same voice is clicked and was playing, just stop it
      if (isPlaying && currentAudio === voiceId) {
        setIsPlaying(false);
        setCurrentAudio(null);
        return;
      }

      setLoadingVoice(voiceId);
      setCurrentAudio(voiceId);

      // Get voice sample from Murf AI service
      const response = await generateVoiceSample(voiceId, SAMPLE_TEXT);
      
      // Create new audio element
      const audio = new Audio(response.audioUrl);
      audioRef.current = audio;
      
      // Add event listeners for audio
      audio.addEventListener('ended', () => {
        setIsPlaying(false);
        setCurrentAudio(null);
      });
      
      audio.addEventListener('error', () => {
        console.error('Error playing audio');
        setIsPlaying(false);
        setCurrentAudio(null);
        setLoadingVoice(null);
      });

      // Play the audio
      audio.play().then(() => {
        setIsPlaying(true);
        setLoadingVoice(null);
      }).catch(error => {
        console.error('Error playing audio:', error);
        setIsPlaying(false);
        setLoadingVoice(null);
      });
    } catch (error) {
      console.error('Error generating voice sample:', error);
      setIsPlaying(false);
      setCurrentAudio(null);
      setLoadingVoice(null);
    }
  };

  // Create Voice Item Component to avoid duplication
  const VoiceItem = ({ voice }) => (
    <div 
      key={voice.id}
      className={`flex items-center justify-between p-4 border rounded-lg transition-all ${
        selectedVoice === voice.id 
          ? 'border-teal-500 bg-teal-50' 
          : 'hover:bg-gray-50 border-gray-200'
      }`}
      // Simplify by using only a single onClick handler for the entire card
      onClick={(e) => {
        // Prevent both default behavior and propagation
        e.preventDefault();
        e.stopPropagation();
        // Update the selected voice
        setSelectedVoice(voice.id);
        // Explicitly return false to prevent any form submission
        return false;
      }}
    >
      <div className="flex items-center space-x-3">
        <RadioGroupItem 
          value={voice.id} 
          id={voice.id} 
          className="h-5 w-5" 
          checked={selectedVoice === voice.id} 
        />
        <div>
          <Label htmlFor={voice.id} className="font-medium cursor-pointer">{voice.name}</Label>
          <p className="text-sm text-gray-500">{voice.accent} • {voice.style}</p>
        </div>
      </div>
      <button
        type="button"
        onClick={(e) => {
          // For the play button, we need to fully prevent any events
          e.preventDefault();
          e.stopPropagation();
          handleVoiceSample(voice.id);
          // Explicitly return false to prevent any form submission
          return false;
        }}
        className={`p-2 rounded-full ${
          currentAudio === voice.id && isPlaying 
            ? 'bg-teal-100 text-teal-600' 
            : 'hover:bg-gray-100 text-gray-600'
        }`}
        disabled={loadingVoice !== null}
      >
        {loadingVoice === voice.id ? (
          <div className="h-5 w-5 border-2 border-gray-300 border-t-teal-500 rounded-full animate-spin"></div>
        ) : currentAudio === voice.id && isPlaying ? (
          <Pause className="h-5 w-5" />
        ) : (
          <Play className="h-5 w-5" />
        )}
      </button>
    </div>
  );

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <Label className="text-lg font-medium">Choose Voice</Label>
        <button 
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setExpanded(!expanded);
            return false;
          }}
          className="text-gray-500 hover:text-gray-700 flex items-center text-sm"
        >
          {expanded ? (
            <>
              <span>Show less</span>
              <ChevronUp className="ml-1 h-4 w-4" />
            </>
          ) : (
            <>
              <span>More options</span>
              <ChevronDown className="ml-1 h-4 w-4" />
            </>
          )}
        </button>
      </div>
      
      {!selectedVoice && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-md mb-2">
          <p className="text-sm text-amber-700">
            Please select a specific voice for your avatar to continue.
          </p>
        </div>
      )}

      {/* Use a custom tab implementation to avoid form submission issues */}
      <div className="w-full">
        <div className="inline-flex h-10 items-center justify-center rounded-md bg-gray-100 p-1 w-full grid grid-cols-2">
          <button
            type="button"
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all
              ${gender === 'female' 
                ? "bg-white shadow-sm text-teal-600" 
                : "text-gray-500 hover:text-gray-900"}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setGender('female');
              return false;
            }}
          >
            Female Voice
          </button>
          <button
            type="button" 
            className={`inline-flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium transition-all
              ${gender === 'male' 
                ? "bg-white shadow-sm text-teal-600" 
                : "text-gray-500 hover:text-gray-900"}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setGender('male');
              return false;
            }}
          >
            Male Voice
          </button>
        </div>
        
        <div className="mt-4">
          {gender === 'female' && (
            <RadioGroup
              value={selectedVoice}
              onValueChange={(value) => {
                setSelectedVoice(value);
              }}
              className="flex flex-col space-y-2"
            >
              {femaleVoices.slice(0, expanded ? femaleVoices.length : 2).map((voice) => (
                <VoiceItem key={voice.id} voice={voice} />
              ))}
            </RadioGroup>
          )}
          
          {gender === 'male' && (
            <RadioGroup
              value={selectedVoice}
              onValueChange={(value) => {
                setSelectedVoice(value);
              }}
              className="flex flex-col space-y-2"
            >
              {maleVoices.slice(0, expanded ? maleVoices.length : 2).map((voice) => (
                <VoiceItem key={voice.id} voice={voice} />
              ))}
            </RadioGroup>
          )}
        </div>
      </div>
    </div>
  );
};

export default VoiceSelector;