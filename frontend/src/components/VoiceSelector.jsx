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
import { 
  getAvailableVoices, 
  speak, 
  stopSpeaking,
  isSpeechSynthesisSupported
} from "../components/chat/TextToSpeechService";

// Sample text for voice preview
const SAMPLE_TEXT = "Hello, I'm your AI lecturer. I'm here to help you learn.";

const VoiceSelector = ({ selectedVoice, setSelectedVoice, gender, setGender }) => {
  const [femaleVoices, setFemaleVoices] = useState([]);
  const [maleVoices, setMaleVoices] = useState([]);
  const [expanded, setExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentAudio, setCurrentAudio] = useState(null);
  const [loadingVoice, setLoadingVoice] = useState(null);
  // Store all browser voices
  const [browserVoices, setBrowserVoices] = useState([]);

  // Load voices from browser's speech synthesis
  useEffect(() => {
    const loadVoices = () => {
      // Check if TTS is supported
      if (!isSpeechSynthesisSupported()) {
        console.error("Speech synthesis not supported in this browser");
        return;
      }

      // Get all available voices
      const voices = getAvailableVoices();
      console.log("All available voices:", voices.map(v => `${v.name} (${v.lang})`));
      
      // Store all voices for lookup
      setBrowserVoices(voices);
      
      // Filter voices by likely gender (based on voice name)
      const female = voices.filter(voice => {
        const name = voice.name.toLowerCase();
        // Expanded patterns for female voices
        return name.includes('female') || name.includes('woman') || 
               name.includes('girl') || name.includes('fiona') || 
               name.includes('samantha') || name.includes('karen') || 
               name.includes('moira') || name.includes('lisa') ||
               name.includes('victoria') || name.includes('zira') ||
               name.includes('susan') || name.includes('mary') || 
               name.includes('catherine') || name.includes('donna') ||
               name.includes('emily') || name.includes('linda') ||
               name.includes('sandy') || name.includes('serena') ||
               name.includes('veena') || name.includes('alex') || // Alex on Mac is female
               name.includes('allison') || name.includes('ava') ||
               name.includes('evelyn') || name.includes('samantha') ||
               name.includes('tessa') || name.includes('kathy') ||
               name.includes('kimberly') || name.includes('laura') ||
               // Voice IDs that don't include clear gender names but are female
               name === 'microsoft hazel desktop' || 
               name === 'microsoft zira desktop' ||
               name === 'microsoft elsa desktop' ||
               name === 'google us english' || // Often female in Chrome
               name === 'google uk english female';
      });
      
      const male = voices.filter(voice => {
        const name = voice.name.toLowerCase();
        // Expanded patterns for male voices
        return name.includes('male') || name.includes('man') || 
               name.includes('boy') || name.includes('guy') || 
               name.includes('david') || name.includes('mark') || 
               name.includes('daniel') || name.includes('lee') ||
               name.includes('tom') || name.includes('eric') ||
               name.includes('george') || name.includes('james') ||
               name.includes('john') || name.includes('josh') ||
               name.includes('paul') || name.includes('richard') ||
               name.includes('steve') || name.includes('tim') ||
               name.includes('bruce') || name.includes('fred') ||
               name.includes('reed') || name.includes('ryan') ||
               name.includes('sean') || name.includes('wayne') ||
               // Voice IDs that don't include clear gender names but are male
               name === 'microsoft david desktop' ||
               name === 'microsoft mark desktop' ||
               name === 'microsoft george desktop' ||
               name === 'google uk english male';
      });
      
      console.log("Voices initially categorized as female:", female.map(v => v.name));
      console.log("Voices initially categorized as male:", male.map(v => v.name));
      
      // Track categorized voices to avoid duplicates
      const categorized = new Set([...female, ...male].map(v => v.name));
      
      // If we couldn't identify by name, make a best guess based on pitch
      // Add remaining voices to gender categories based on default criterion
      const uncategorized = voices.filter(voice => !categorized.has(voice.name));
      console.log("Uncategorized voices (will be auto-assigned):", uncategorized.map(v => v.name));
      
      voices.forEach(voice => {
        if (!female.includes(voice) && !male.includes(voice)) {
          // A rough heuristic - many female voices have higher default pitch
          if (female.length <= male.length) {
            female.push(voice);
          } else {
            male.push(voice);
          }
        }
      });
      
      console.log("Final female voices count:", female.length);
      console.log("Final male voices count:", male.length);
      
      // Set the categorized voices
      setFemaleVoices(female.map(voice => ({
        id: voice.voiceURI,
        name: voice.name,
        accent: voice.lang,
        style: "Natural",
        // Store the actual SpeechSynthesisVoice object for use with speak()
        voiceObject: voice
      })));
      
      setMaleVoices(male.map(voice => ({
        id: voice.voiceURI,
        name: voice.name,
        accent: voice.lang,
        style: "Natural",
        // Store the actual SpeechSynthesisVoice object for use with speak()
        voiceObject: voice
      })));
    };

    // Load voices initially
    loadVoices();

    // The voiceschanged event fires when the list of voices is loaded or changes
    window.speechSynthesis.onvoiceschanged = loadVoices;

    // Cleanup
    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, []);

  // Stop audio playback when component unmounts
  useEffect(() => {
    return () => {
      stopSpeaking();
    };
  }, []);

  // Handle voice sample playback
  const handleVoiceSample = (voiceId) => {
    try {
      // Stop any current speech if playing
      stopSpeaking();
      
      // If the same voice is clicked and was playing, just stop it
      if (isPlaying && currentAudio === voiceId) {
        setIsPlaying(false);
        setCurrentAudio(null);
        return;
      }

      setLoadingVoice(voiceId);
      setCurrentAudio(voiceId);

      // Find the voice object from our voice lists
      let voiceObject = null;
      const allVoices = [...femaleVoices, ...maleVoices];
      const voiceData = allVoices.find(v => v.id === voiceId);
      
      if (voiceData) {
        voiceObject = voiceData.voiceObject;
      }
      
      if (!voiceObject) {
        console.error('Voice not found:', voiceId);
        setIsPlaying(false);
        setCurrentAudio(null);
        setLoadingVoice(null);
        return;
      }

      // Use the browser's speech synthesis
      speak(SAMPLE_TEXT, {
        voice: voiceObject,
        rate: 1.0,
        pitch: 1.0,
        onStart: () => {
          setIsPlaying(true);
          setLoadingVoice(null);
        },
        onEnd: () => {
          setIsPlaying(false);
          setCurrentAudio(null);
        },
        onError: (error) => {
          console.error('Error playing speech:', error);
          setIsPlaying(false);
          setCurrentAudio(null);
          setLoadingVoice(null);
        }
      });
    } catch (error) {
      console.error('Error playing voice sample:', error);
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