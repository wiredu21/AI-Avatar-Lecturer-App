import React, { useState, useEffect, useRef, useMemo } from 'react';
import axios from 'axios';
import './Chat.css';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
  isSpeechRecognitionSupported, 
  startRecognition, 
  stopRecognition 
} from '../chat/SpeechRecognitionService';
import {
  isSpeechSynthesisSupported,
  initializeVoice,
  speak,
  stopSpeaking
} from '../chat/TextToSpeechService';
import { getUniversityName } from '../../utils/universityUtils';
import AvatarAnimation from './AvatarAnimation';

// Import avatar images
import AvatarOption1 from "../../assets/images/AvatarOption1.png";
import AvatarOption2 from "../../assets/images/AvatarOption2.png";
import AvatarOption3 from "../../assets/images/AvatarOption3.png";
import AvatarOption4 from "../../assets/images/AvatarOption4.png";
import AvatarOption5 from "../../assets/images/AvatarOption5.png";
import AvatarOption6 from "../../assets/images/AvatarOption6.png";
import AvatarOption7 from "../../assets/images/AvatarOption7.png";
import AvatarOption8 from "../../assets/images/AvatarOption8.png";

const ChatComponent = ({ courseId, userId }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingMessageId, setSpeakingMessageId] = useState(null);
  const [transcription, setTranscription] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const [isTtsSupported, setIsTtsSupported] = useState(true);
  const [preferredVoiceGender, setPreferredVoiceGender] = useState('female');
  const [userUniversity, setUserUniversity] = useState('University');
  const [userAvatarId, setUserAvatarId] = useState(null);
  const [isAvatarSpeaking, setIsAvatarSpeaking] = useState(false);
  const [isAvatarListening, setIsAvatarListening] = useState(false);
  const [isAvatarThinking, setIsAvatarThinking] = useState(false);
  const [avatarAnimationLoaded, setAvatarAnimationLoaded] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  
  // Chat sessions state
  const [chatSessions, setChatSessions] = useState([]);
  const [activeChatSession, setActiveChatSession] = useState(null);
  const [isLoadingChatSessions, setIsLoadingChatSessions] = useState(false);
  
  // UI states
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [renamingChatId, setRenamingChatId] = useState(null);
  const [newChatName, setNewChatName] = useState('');
  const renameInputRef = useRef(null);
  
  // Avatar data - same structure as in Settings component
  const avatars = useMemo(() => [
    { id: 1, src: AvatarOption1, alt: "Professional male lecturer", gender: "male" },
    { id: 2, src: AvatarOption2, alt: "Professional female lecturer", gender: "female" },
    { id: 3, src: AvatarOption3, alt: "Casual male lecturer", gender: "male" },
    { id: 4, src: AvatarOption4, alt: "Casual female lecturer", gender: "female" },
    { id: 5, src: AvatarOption5, alt: "Young male lecturer", gender: "male" },
    { id: 6, src: AvatarOption6, alt: "Young female lecturer", gender: "female" },
    { id: 7, src: AvatarOption7, alt: "Senior male lecturer", gender: "male" },
    { id: 8, src: AvatarOption8, alt: "Senior female lecturer", gender: "female" }
  ], []);

  // New state for Ollama service status
  const [serviceStatus, setServiceStatus] = useState({
    checked: false,
    available: true,
    message: '',
    model: ''
  });

  // New state for selected voice
  const [selectedVoiceId, setSelectedVoiceId] = useState(null);

  // Check authentication and fetch chat sessions on mount
  useEffect(() => {
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    const authToken = localStorage.getItem('authToken');
    
    if (!isLoggedIn || !authToken) {
      console.log('User not authenticated, redirecting to login');
      window.location.href = '/login';
      return;
    }
    
    // If token is invalid JWT format, also redirect to login
    try {
      // Basic check that token looks like a JWT (has two periods)
      if (authToken.split('.').length !== 3) {
        console.log('Invalid token format, redirecting to login');
        window.location.href = '/login';
        return;
      }
    } catch (error) {
      console.error('Error checking token format:', error);
    }
    
    // Check Ollama service status
    checkOllamaStatus();
    
    // Fetch chat sessions
    fetchChatSessions();
  }, []);

  // Add a function to load user profile data
  const loadUserProfileData = () => {
    try {
      console.log('Loading user profile for avatar...', new Date().toISOString());
      console.log('Avatars available:', avatars.map(a => a.id).join(', '));
      
      const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
      console.log('User profile loaded from localStorage:', userProfile);
      console.log('Profile contains these keys:', Object.keys(userProfile).join(', '));
      
      if (userProfile) {
        // Use the utility function to get the university name regardless of format
        const universityName = getUniversityName(userProfile.university, "University of Northampton");
        setUserUniversity(universityName);
        console.log('University value type:', typeof userProfile.university);
        console.log('University raw value:', userProfile.university);
        console.log('Set university name to:', universityName);

        console.log('Checking for avatar in profile:', 'avatar' in userProfile);
        
        // First check for avatar field
        if (userProfile.avatar) {
          console.log('Avatar found in profile:', userProfile.avatar, typeof userProfile.avatar);
          
          // Convert to number if it's stored as a string
          const avatarId = typeof userProfile.avatar === 'string' 
            ? parseInt(userProfile.avatar, 10) 
            : userProfile.avatar;
          
          console.log('Parsed avatar ID:', avatarId, typeof avatarId);
          
          // Check if this ID exists in our avatars array
          const avatarExists = avatars.some(avatar => avatar.id === avatarId);
          
          if (avatarExists) {
            console.log('Setting avatar ID to:', avatarId);
            setUserAvatarId(avatarId);
          } else {
            console.warn('Avatar ID not found in avatars array:', avatarId);
          }
        } 
        // If avatar not found, check for selectedAvatar field as fallback
        else if (userProfile.selectedAvatar) {
          console.log('Found selectedAvatar in profile:', userProfile.selectedAvatar);
          const avatarId = typeof userProfile.selectedAvatar === 'string' 
            ? parseInt(userProfile.selectedAvatar, 10) 
            : userProfile.selectedAvatar;
          
          // Check if this ID exists in our avatars array
          const avatarExists = avatars.some(avatar => avatar.id === avatarId);
          
          if (avatarExists) {
            console.log('Setting avatar ID from selectedAvatar to:', avatarId);
            setUserAvatarId(avatarId);
          } else {
            console.warn('selectedAvatar ID not found in avatars array:', avatarId);
          }
        } else {
          console.log('No avatar found in user profile. Profile keys:', Object.keys(userProfile).join(', '));
        }
      } else {
        console.log('No user profile found in localStorage');
      }
    } catch (error) {
      console.error('Error retrieving user data:', error);
      // Default to "University of Northampton" as shown in the screenshot
      setUserUniversity('University of Northampton');
    }
  };

  // Get user university from localStorage
  useEffect(() => {
    loadUserProfileData();
  }, [avatars]);

  // React to location changes to reload profile when navigating to the Chat component
  useEffect(() => {
    console.log('Location changed, reloading user profile...', location.pathname);
    loadUserProfileData();
  }, [location, avatars]);

  // Listen for changes to localStorage from other components
  useEffect(() => {
    // Function to handle storage events (when localStorage changes)
    const handleStorageChange = (event) => {
      // Only react to userProfile changes
      if (event.key === 'userProfile' && event.newValue) {
        console.log('userProfile changed in localStorage, updating avatar...', new Date().toISOString());
        try {
          const userProfile = JSON.parse(event.newValue);
          console.log('Updated userProfile:', userProfile);
          
          // Update university using our utility function
          if (userProfile.university) {
            const universityName = getUniversityName(userProfile.university, "University of Northampton");
            setUserUniversity(universityName);
            console.log('Updated university name to:', universityName);
          }
          
          // Update avatar if it exists in the profile
          if (userProfile.avatar) {
            const avatarId = typeof userProfile.avatar === 'string' 
              ? parseInt(userProfile.avatar, 10) 
              : userProfile.avatar;
            
            const avatarExists = avatars.some(avatar => avatar.id === avatarId);
            
            if (avatarExists) {
              console.log('Updating avatar ID to:', avatarId);
              setUserAvatarId(avatarId);
            }
          }
        } catch (error) {
          console.error('Error handling storage event:', error);
        }
      }
    };

    // Add event listener when component mounts
    window.addEventListener('storage', handleStorageChange);
    
    // Remove event listener when component unmounts
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [avatars]);

  // Check browser support on mount
  useEffect(() => {
    setIsSpeechSupported(isSpeechRecognitionSupported());
    setIsTtsSupported(isSpeechSynthesisSupported());
    
    // Initialize TTS with preferred voice
    if (isSpeechSynthesisSupported()) {
      // Load user preferences from localStorage if available
      const savedVoiceGender = localStorage.getItem('preferredVoiceGender');
      if (savedVoiceGender) {
        setPreferredVoiceGender(savedVoiceGender);
      }
      
      // Initialize voice selection (with a delay to ensure voices are loaded)
      setTimeout(() => {
        initializeVoice(savedVoiceGender || 'female');
      }, 500);
    }
    
    // Cleanup speech on unmount
    return () => {
      if (isSpeechSynthesisSupported()) {
        stopSpeaking();
      }
    };
  }, []);

  // Update voice when preferred gender changes
  useEffect(() => {
    if (isSpeechSynthesisSupported()) {
      initializeVoice(preferredVoiceGender);
      
      // Save preference to localStorage
      localStorage.setItem('preferredVoiceGender', preferredVoiceGender);
    }
  }, [preferredVoiceGender]);

  // Fetch chat history when component mounts
  useEffect(() => {
    if (courseId) {
      fetchChatHistory();
    }
  }, [courseId]);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load selected voice from localStorage on mount
  useEffect(() => {
    const loadSelectedVoice = () => {
      try {
        const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
        if (userProfile && userProfile.voiceId) {
          setSelectedVoiceId(userProfile.voiceId);
        }
      } catch (error) {
        console.error('Error loading selected voice from localStorage:', error);
      }
    };
    loadSelectedVoice();
  }, []);

  // NEW: Reload selected voice when location changes
  useEffect(() => {
    const loadSelectedVoice = () => {
      try {
        const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
        if (userProfile && userProfile.voiceId) {
          setSelectedVoiceId(userProfile.voiceId);
        }
      } catch (error) {
        console.error('Error loading selected voice from localStorage on location change:', error);
      }
    };
    loadSelectedVoice();
  }, [location]);

  // Listen for changes to localStorage (userProfile) and update selectedVoiceId
  useEffect(() => {
    const handleStorageChange = (event) => {
      if (event.key === 'userProfile' && event.newValue) {
        try {
          const userProfile = JSON.parse(event.newValue);
          if (userProfile && userProfile.voiceId) {
            setSelectedVoiceId(userProfile.voiceId);
          }
        } catch (error) {
          console.error('Error updating selected voice from storage event:', error);
        }
      }
    };
    window.addEventListener('storage', handleStorageChange);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  const fetchChatHistory = async () => {
    try {
      const response = await axios.get(`/api/chat-history/by_course/?course_id=${courseId}`);
      
      if (response.data) {
        setMessages(response.data);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
      // If unauthorized (401), the axios interceptor will handle redirect
    }
  };

  // Function to check Ollama service status
  const checkOllamaStatus = async () => {
    try {
      const response = await axios.get('/api/chat-status/');
      console.log('Ollama service status:', response.data);
      
      setServiceStatus({
        checked: true,
        available: response.data.service_available,
        message: response.data.message,
        model: response.data.model
      });
      
      // If service is not available, add a system message
      if (!response.data.service_available) {
        setMessages(prev => [
          ...prev,
          {
            id: 'system-ollama-unavailable',
            message: `The AI service is currently unavailable. ${response.data.message}`,
            is_user_message: false,
            timestamp: new Date().toISOString(),
            is_system_message: true
          }
        ]);
      }
    } catch (error) {
      console.error('Error checking Ollama status:', error);
      
      // Set status as unavailable
      setServiceStatus({
        checked: true,
        available: false,
        message: 'Could not connect to the AI service',
        model: ''
      });
      
      // Add a system message
      setMessages(prev => [
        ...prev,
        {
          id: 'system-ollama-error',
          message: 'The AI service is currently unavailable. Please try again later.',
          is_user_message: false,
          timestamp: new Date().toISOString(),
          is_system_message: true
        }
      ]);
    }
  };

  // Format code blocks in messages
  const formatMessage = (content) => {
    // Check if message might contain code
    if (!content.includes('```')) return content;
    
    const parts = content.split('```');
    
    if (parts.length <= 1) return content;
    
    return (
      <>
        {parts.map((part, index) => {
          // Even indices are regular text, odd indices are code blocks
          if (index % 2 === 0) {
            return <p key={index}>{part}</p>;
          } else {
            // Handle language specification if present
            const firstLineBreak = part.indexOf('\n');
            const language = firstLineBreak > 0 ? part.substring(0, firstLineBreak) : '';
            const code = firstLineBreak > 0 ? part.substring(firstLineBreak + 1) : part;
            
            return (
              <pre key={index} className="code-block">
                {language && <div className="code-language">{language}</div>}
                <code>{code}</code>
              </pre>
            );
          }
        })}
      </>
    );
  };

  // Update the handleSubmit function to work with chat sessions
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    // Get the message to send (either from input or transcription)
    const messageToSend = inputMessage.trim() || transcription.trim();
    if (!messageToSend) return;
    
    // Check if we have an active chat session, if not create one
    let currentSessionId = activeChatSession;
    if (!currentSessionId) {
      try {
        const newSession = await createChatSession();
        currentSessionId = newSession.id;
      } catch (error) {
        console.error('Failed to create a new chat session:', error);
        // Use a temporary ID if we can't create a session
        currentSessionId = 'temp-' + Date.now();
      }
    }
    
    // Check if Ollama service is available before sending message
    if (!serviceStatus.available) {
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          message: messageToSend,
          is_user_message: true,
          timestamp: new Date().toISOString()
        },
        {
          id: Date.now() + 1,
          message: 'Sorry, the AI service is currently unavailable. Please try again later.',
          is_user_message: false,
          timestamp: new Date().toISOString(),
          is_system_message: true
        }
      ]);
      setInputMessage('');
      setTranscription('');
      setInterimTranscript('');
      setTimeout(scrollToBottom, 100);
      return;
    }

    // Add user message to UI immediately
    const userMessage = {
      id: Date.now(), // temporary ID
      message: messageToSend,
      is_user_message: true,
      timestamp: new Date().toISOString(),
      chat_session: currentSessionId
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setTranscription('');
    setInterimTranscript('');
    setIsLoading(true);
    setIsAvatarThinking(true);

    try {
      // Send message to API with the chat session ID
      const response = await axios.post('/api/chat-sessions/message/', {
        session_id: currentSessionId,
        message: messageToSend,
        course: courseId // Optional course context
      });
      
      // Add AI response to UI
      if (response.data) {
        // First update the messages state
        setMessages(prev => [...prev, response.data]);
        
        // Auto-play the response with TTS if enabled
        if (isTtsSupported && response.data.message && !response.data.is_user_message) {
          // Small delay to ensure message is rendered first
          setTimeout(() => {
            speakMessage(response.data.message, response.data.id);
          }, 300);
        }
        
        // If this is a new session, add it to the list or update title if needed
        if (response.data.chat_session && (!activeChatSession || activeChatSession === 'temp-' + Date.now())) {
          setActiveChatSession(response.data.chat_session);
          
          // Fetch updated session list to get the new title
          fetchChatSessions();
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      
      // Add error message to UI
      setMessages(prev => [
        ...prev,
        {
          id: Date.now(),
          message: 'Sorry, something went wrong. Please try again later.',
          is_user_message: false,
          timestamp: new Date().toISOString(),
          is_system_message: true,
          chat_session: currentSessionId
        }
      ]);
    } finally {
      setIsLoading(false);
      setIsAvatarThinking(false); // Stop thinking animation
      setTimeout(scrollToBottom, 100);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
      handleSubmit();
    }
  };

  const startRecording = () => {
    if (!isSpeechSupported) return;
    
    setTranscription('');
    setInterimTranscript('');
    setIsRecording(true);
    setIsAvatarListening(true); // Activate listening animation
    
    startRecognition({
      onResult: (event) => {
        // Get transcript
        let interimTranscript = '';
        let finalTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        // Update state with transcription
        setTranscription(prevTranscription => prevTranscription + finalTranscript);
        setInterimTranscript(interimTranscript);
      },
      onEnd: () => {
        setIsRecording(false);
        setIsAvatarListening(false); // Deactivate listening animation
      },
      onError: (event) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
        setIsAvatarListening(false); // Deactivate listening animation
      }
    });
  };

  const stopRecording = () => {
    if (isRecording) {
      stopRecognition();
      setIsRecording(false);
      setIsAvatarListening(false); // Deactivate listening animation
      
      // If we have transcription, set it as input
      if (transcription || interimTranscript) {
        const fullTranscription = (transcription + ' ' + interimTranscript).trim();
        setInputMessage(fullTranscription);
        setInterimTranscript('');
        inputRef.current?.focus();
      }
    }
  };

  const speakMessage = (text, messageId) => {
    if (!isTtsSupported) return;
    
    // Stop any current speech
    if (isSpeaking) {
      stopSpeaking();
    }
    
    // Clean text for speech (remove markdown, etc.)
    const cleanText = text.replace(/```[\s\S]*?```/g, 'Code block omitted for speech.'); 
    
    setIsSpeaking(true);
    setSpeakingMessageId(messageId);
    setIsAvatarSpeaking(true); // Trigger avatar speaking animation
    
    // Pass selectedVoiceId to speak
    speak(cleanText, {
      rate: 1.0,
      pitch: 1.0,
      voiceId: selectedVoiceId || undefined, // Use selectedVoiceId if available
      onStart: () => {
        setIsSpeaking(true);
        setIsAvatarSpeaking(true);
      },
      onEnd: () => {
        setIsSpeaking(false);
        setSpeakingMessageId(null);
        setIsAvatarSpeaking(false);
      },
      onError: (error) => {
        console.error('Text-to-speech error:', error);
        setIsSpeaking(false);
        setSpeakingMessageId(null);
        setIsAvatarSpeaking(false);
      }
    });
  };

  const toggleSpeech = (messageText, messageId) => {
    if (isSpeaking && speakingMessageId === messageId) {
      stopSpeaking();
      setIsSpeaking(false);
      setSpeakingMessageId(null);
      setIsAvatarSpeaking(false);
    } else {
      speakMessage(messageText, messageId);
    }
  };

  const toggleVoiceGender = () => {
    setPreferredVoiceGender(prev => prev === 'female' ? 'male' : 'female');
  };

  // Update the selectChat function to use the new API
  const selectChat = (sessionId) => {
    if (!sessionId || sessionId === activeChatSession) return;
    
    setActiveChatSession(sessionId);
    
    // Load messages for the selected chat session
    loadChatSessionMessages(sessionId);
    
    // Close sidebar on mobile after selection
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  // Update the startNewChat function to use the new API
  const startNewChat = () => {
    createChatSession();
  };

  // Update the handleDeleteChat function to use the new API
  const handleDeleteChat = (e, sessionId) => {
    // Prevent triggering the parent button's onClick
    e.stopPropagation();
    
    // Confirm before deleting
    if (window.confirm("Are you sure you want to delete this conversation? This action cannot be undone.")) {
      deleteChatSession(sessionId);
    }
  };
  
  // Update the handleRenameClick function
  const handleRenameClick = (e, sessionId, currentName) => {
    // Prevent triggering the parent button's onClick
    e.stopPropagation();
    
    // Set the chat being renamed
    setRenamingChatId(sessionId);
    setNewChatName(currentName);
    
    // Focus the input in the next render cycle
    setTimeout(() => {
      renameInputRef.current?.focus();
    }, 0);
  };
  
  // Update the saveRename function to use the new API
  const saveRename = (sessionId) => {
    if (newChatName.trim()) {
      renameChatSession(sessionId, newChatName.trim());
    }
    
    // Reset rename state
    setRenamingChatId(null);
    setNewChatName('');
  };
  
  // Handle input key events during rename
  const handleRenameKeyDown = (e, chatId) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      saveRename(chatId);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      setRenamingChatId(null);
      setNewChatName('');
    }
  };
  
  // Handle clicking outside of the rename input
  useEffect(() => {
    if (renamingChatId) {
      const handleClickOutside = (e) => {
        if (renameInputRef.current && !renameInputRef.current.contains(e.target)) {
          saveRename(renamingChatId);
        }
      };
      
      document.addEventListener('mousedown', handleClickOutside);
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }
  }, [renamingChatId]);

  // Fetch all chat sessions for the current user
  const fetchChatSessions = async () => {
    try {
      setIsLoadingChatSessions(true);
      
      // Use our axios instance to fetch chat sessions
      const response = await axios.get('/api/chat-sessions/');
      
      if (response.data && Array.isArray(response.data)) {
        // Sort sessions by most recent first
        const sortedSessions = response.data.sort((a, b) => 
          new Date(b.last_updated) - new Date(a.last_updated)
        );
        
        setChatSessions(sortedSessions);
        
        // If we have sessions and none is active, set the most recent one as active
        if (sortedSessions.length > 0 && !activeChatSession) {
          setActiveChatSession(sortedSessions[0].id);
          // Load messages for this session
          await loadChatSessionMessages(sortedSessions[0].id);
        }
      } else {
        // If no sessions returned or invalid data, create a new session
        await createChatSession();
      }
    } catch (error) {
      console.error('Error fetching chat sessions:', error);
      // If API fails, show sample data for demo (can be removed in production)
      const sampleSessions = [
        { id: "default", title: "New Conversation", created_at: new Date().toISOString(), last_updated: new Date().toISOString() }
      ];
      setChatSessions(sampleSessions);
      setActiveChatSession("default");
    } finally {
      setIsLoadingChatSessions(false);
    }
  };
  
  // Create a new chat session
  const createChatSession = async (title = "New Conversation") => {
    try {
      const response = await axios.post('/api/chat-sessions/', { title });
      
      if (response.data && response.data.id) {
        // Add the new session to the list and set it as active
        const newSession = response.data;
        setChatSessions(prev => [newSession, ...prev]);
        setActiveChatSession(newSession.id);
        
        // Clear messages for the new session
        setMessages([{
          id: "welcome",
          message: "Hello! How can I help you with your studies today?",
          is_user_message: false,
          timestamp: new Date().toISOString()
        }]);
        
        return newSession;
      }
    } catch (error) {
      console.error('Error creating chat session:', error);
      
      // Fallback for demo/development (can be removed in production)
      const fallbackSession = { 
        id: `local-${Date.now()}`, 
        title, 
        created_at: new Date().toISOString(),
        last_updated: new Date().toISOString()
      };
      
      setChatSessions(prev => [fallbackSession, ...prev]);
      setActiveChatSession(fallbackSession.id);
      
      // Clear messages for the new session
      setMessages([{
        id: "welcome",
        message: "Hello! How can I help you with your studies today?",
        is_user_message: false,
        timestamp: new Date().toISOString()
      }]);
      
      return fallbackSession;
    }
  };
  
  // Load messages for a specific chat session
  const loadChatSessionMessages = async (sessionId) => {
    if (!sessionId) return;
    
    try {
      setIsLoading(true);
      
      // Get messages for this chat session
      const response = await axios.get(`/api/chat-sessions/${sessionId}/messages/`);
      
      if (response.data && Array.isArray(response.data)) {
        // Sort messages by timestamp (oldest first)
        const sortedMessages = response.data.sort((a, b) => 
          new Date(a.timestamp) - new Date(b.timestamp)
        );
        
        setMessages(sortedMessages);
      } else {
        // If no messages or error, show a welcome message
        setMessages([{
          id: "welcome",
          message: "Hello! How can I help you with your studies today?",
          is_user_message: false,
          timestamp: new Date().toISOString()
        }]);
      }
    } catch (error) {
      console.error('Error loading chat session messages:', error);
      // Show a friendly message if we can't load the history
      setMessages([{
        id: "error",
        message: "Unable to load chat history. You can start a new conversation below.",
        is_user_message: false,
        timestamp: new Date().toISOString(),
        is_system_message: true
      }]);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Delete a chat session
  const deleteChatSession = async (sessionId) => {
    if (!sessionId) return;
    
    try {
      await axios.delete(`/api/chat-sessions/${sessionId}/`);
      // Remove from local state after successful deletion
      setChatSessions(prev => prev.filter(session => session.id !== sessionId));
      
      // If we deleted the active session, select another one
      if (activeChatSession === sessionId) {
        const remainingSessions = chatSessions.filter(session => session.id !== sessionId);
        if (remainingSessions.length > 0) {
          setActiveChatSession(remainingSessions[0].id);
          await loadChatSessionMessages(remainingSessions[0].id);
        } else {
          // If no sessions left, create a new one
          await createChatSession();
        }
      }
    } catch (error) {
      console.error('Error deleting chat session:', error);
      // For demo/development, remove from UI anyway (can be modified for production)
      setChatSessions(prev => prev.filter(session => session.id !== sessionId));
    }
  };
  
  // Rename a chat session
  const renameChatSession = async (sessionId, newTitle) => {
    if (!sessionId || !newTitle.trim()) return;
    
    try {
      await axios.patch(`/api/chat-sessions/${sessionId}/`, { title: newTitle });
      
      // Update in local state after successful update
      setChatSessions(prev => 
        prev.map(session => 
          session.id === sessionId 
            ? { ...session, title: newTitle } 
            : session
        )
      );
    } catch (error) {
      console.error('Error renaming chat session:', error);
      // For demo/development, update UI anyway (can be modified for production)
      setChatSessions(prev => 
        prev.map(session => 
          session.id === sessionId 
            ? { ...session, title: newTitle } 
            : session
        )
      );
    }
  };

  return (
    <div className="chat-page">
      {/* Service status banner */}
      {serviceStatus.checked && !serviceStatus.available && (
        <div className="service-status-banner">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="12" y1="8" x2="12" y2="12"></line>
            <line x1="12" y1="16" x2="12.01" y2="16"></line>
          </svg>
          <span>AI service unavailable: {serviceStatus.message}</span>
          <button onClick={checkOllamaStatus} className="retry-button">
            Retry
          </button>
        </div>
      )}

      <div className="chat-container">
        {/* Mobile Menu Toggle */}
        <div className="mobile-menu-toggle">
          <button onClick={() => setSidebarOpen(!sidebarOpen)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
          </div>
          
        {/* Left Sidebar - Chat History */}
        <div className={`chat-sidebar ${sidebarOpen ? 'open' : ''}`}>
          <div className="sidebar-header">
            <button onClick={startNewChat} className="new-chat-button">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
              New Chat
            </button>
          </div>
          
          <div className="chat-history">
            {isLoadingChatSessions ? (
              <div className="loading-sessions">
                <div className="chat-loading-indicator">
                  <div className="spinner"></div>
                  <span>Loading conversations...</span>
                </div>
              </div>
            ) : chatSessions.length === 0 ? (
              <div className="no-sessions">
                <p>No conversations yet</p>
                <button 
                  onClick={startNewChat}
                  className="start-chat-button"
                >
                  Start a new conversation
                </button>
              </div>
            ) : (
              chatSessions.map((session) => (
                <button
                  key={session.id}
                  className={`chat-history-item ${session.id === activeChatSession ? 'active' : ''}`}
                  onClick={() => selectChat(session.id)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10"></circle>
                    <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                  <div className="chat-history-info">
                    {renamingChatId === session.id ? (
                      <input
                        ref={renameInputRef}
                        type="text"
                        className="chat-rename-input"
                        value={newChatName}
                        onChange={(e) => setNewChatName(e.target.value)}
                        onKeyDown={(e) => handleRenameKeyDown(e, session.id)}
                        onClick={(e) => e.stopPropagation()}
                      />
                    ) : (
                      <p className="chat-history-title">{session.title}</p>
                    )}
                    <p className="chat-history-date">
                      {new Date(session.created_at || session.date).toLocaleDateString()}
                    </p>
                  </div>
                  {renamingChatId !== session.id && (
                    <>
                      <button 
                        className="chat-rename-button" 
                        onClick={(e) => handleRenameClick(e, session.id, session.title)}
                        title="Rename chat"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button 
                        className="chat-delete-button" 
                        onClick={(e) => handleDeleteChat(e, session.id)}
                        title="Delete chat"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="3 6 5 6 21 6"></polyline>
                          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        </svg>
                      </button>
                    </>
                  )}
                </button>
              ))
            )}
          </div>
          
          <div className="sidebar-footer">
            <button className="sidebar-footer-button" onClick={() => navigate('/dashboard')}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                <polyline points="9 22 9 12 15 12 15 22"></polyline>
              </svg>
              Dashboard
            </button>
          </div>
        </div>

        {/* Middle Section - Avatar Preview */}
        <div className="avatar-preview-section">
          <div className="avatar-preview-container">
            <div className="avatar-circle">
              {userAvatarId ? (
                (() => {
                  const selectedAvatar = avatars.find(avatar => avatar.id === userAvatarId);
                  return selectedAvatar ? (
                    <AvatarAnimation
                      avatarId={userAvatarId}
                      avatarSrc={selectedAvatar.src}
                      isSpeaking={isAvatarSpeaking}
                      isListening={isAvatarListening}
                      isThinking={isAvatarThinking}
                      onLoad={() => setAvatarAnimationLoaded(true)}
                    />
                  ) : (
                    <span className="avatar-text">AI</span>
                  );
                })()
              ) : (
                <span className="avatar-text">AI</span>
              )}
              
              {/* Speech indicator */}
              {isAvatarSpeaking && (
                <div className="speech-indicator">
                  <div className="speech-waves">
                    <div className="speech-wave"></div>
                    <div className="speech-wave"></div>
                    <div className="speech-wave"></div>
                    <div className="speech-wave"></div>
                  </div>
                </div>
              )}
            </div>
            <div className="avatar-info">
              <div className="avatar-title">AI Lecturer</div>
              <div className="avatar-university">{userUniversity}</div>
              <p className="avatar-description">
                I'm your personal AI lecturer assistant. Ask me anything about your courses, assignments, or university resources.
              </p>
            </div>
          </div>
        </div>
        
        {/* Right Section - Chat Messages */}
        <div className="chat-message-section">
          {/* Message Thread */}
          <div className="chat-messages">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`message ${msg.is_user_message ? 'user-message' : 'ai-message'} ${msg.is_system_message ? 'system-message' : ''}`}
              >
                {!msg.is_user_message && (
                  <div className="message-avatar ai-avatar">
                    <span>AI</span>
                  </div>
                )}
                <div className="message-bubble">
                  <div className="message-content">
                    {typeof msg.message === 'string' && msg.message.includes('```') 
                      ? formatMessage(msg.message) 
                      : msg.message}
                  </div>
                  <div className="message-actions">
                    {!msg.is_user_message && isTtsSupported && (
                      <button 
                        className={`speech-button ${speakingMessageId === msg.id ? 'speaking' : ''}`}
                        onClick={() => toggleSpeech(msg.message, msg.id)}
                        title={speakingMessageId === msg.id ? "Stop speaking" : "Speak this message"}
                      >
                        {speakingMessageId === msg.id ? (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <rect x="6" y="4" width="4" height="16"></rect>
                            <rect x="14" y="4" width="4" height="16"></rect>
                          </svg>
                        ) : (
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
                            <path d="M15.54 8.46a5 5 0 0 1 0 7.07"></path>
                            <path d="M19.07 4.93a10 10 0 0 1 0 14.14"></path>
                          </svg>
                        )}
                      </button>
                    )}
                    <div className="message-timestamp">
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
                {msg.is_user_message && (
                  <div className="message-avatar user-avatar">
                    <span>You</span>
                  </div>
                )}
                </div>
              ))}
            {isLoading && (
              <div className="message ai-message">
                <div className="message-avatar ai-avatar">
                  <span>AI</span>
                </div>
                <div className="message-bubble">
                  <div className="message-content">
                    <div className="typing-indicator">
                      <span></span>
                      <span></span>
                      <span></span>
                    </div>
                  </div>
                </div>
              </div>
            )}
              <div ref={messagesEndRef} />
          </div>
          
          {/* Transcription Display */}
          {(isRecording || transcription || interimTranscript) && (
            <div className="transcription-container">
              {isRecording && (
                <div className="recording-indicator">
                  <div className="recording-pulse"></div>
                  <span>Listening...</span>
                </div>
              )}
              {transcription && (
                <div className="transcription">
                  <p>{transcription}</p>
                </div>
              )}
              {interimTranscript && (
                <div className="interim-transcription">
                  <p>{interimTranscript}</p>
                </div>
              )}
            </div>
          )}
          
          {/* Input Form */}
          <div className="chat-input-container">
            <form onSubmit={handleSubmit} className="chat-form">
              <div className="input-wrapper">
                <textarea
                  ref={inputRef}
                  value={isRecording ? interimTranscript || transcription : inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={
                    messages.length <= 1 
                      ? "Start a new conversation..." 
                      : "Type a message..."
                  }
                  disabled={isRecording || isLoading}
                  className="chat-input"
                />
                
                {isRecording && (
                  <button
                    type="button"
                    onClick={stopRecording}
                    className="recording-stop-button"
                    title="Stop Recording"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <rect x="6" y="6" width="12" height="12"></rect>
                    </svg>
                  </button>
                )}

                {!isRecording && isSpeechSupported && (
                  <button
                    type="button"
                    onClick={startRecording}
                    className="mic-button"
                    title="Start Recording"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                      <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                      <line x1="12" y1="19" x2="12" y2="23"></line>
                      <line x1="8" y1="23" x2="16" y2="23"></line>
                    </svg>
                  </button>
                )}
              </div>
              
              <button
                type="submit"
                className="send-button"
                disabled={isLoading || ((!inputMessage.trim()) && (!transcription.trim()))}
              >
                {isLoading ? (
                  <div className="button-spinner"></div>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="22" y1="2" x2="11" y2="13"></line>
                    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                  </svg>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

// Create a wrapper component that includes DashboardLayout
const Chat = () => {
  // State for courseId and userId
  const [courseId, setCourseId] = useState(null);
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    // Get user profile from localStorage
    const userProfile = JSON.parse(localStorage.getItem('userProfile') || '{}');
    
    // Get user ID from localStorage if available
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(storedUserId);
    }
    
    // For courseId, we can use the user's course from the profile
    // This is a simplified approach - in a real app, you might want to 
    // fetch the active course ID from an API
    if (userProfile && userProfile.course) {
      // Using the course value as the courseId for demonstration
      // In a real app, you would likely have a mapping to actual course IDs
      setCourseId(userProfile.course);
    }
  }, []);

  return (
    <div className="flex-1 h-full overflow-hidden">
      {/* Pass the required props to the Chat component */}
      <ChatComponent courseId={courseId} userId={userId} />
    </div>
  );
};

export default Chat; 
