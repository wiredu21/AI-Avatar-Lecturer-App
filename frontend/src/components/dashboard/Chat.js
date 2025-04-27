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
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [chatHistory, setChatHistory] = useState([
    { id: "1", title: "Previous Chat 1", date: new Date(2023, 9, 15), active: true },
    { id: "2", title: "Previous Chat 2", date: new Date(2023, 9, 12) },
    { id: "3", title: "Previous Chat 3", date: new Date(2023, 9, 10) },
  ]);
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

  // Check authentication on mount
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

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    // Get the message to send (either from input or transcription)
    const messageToSend = inputMessage.trim() || transcription.trim();
    if (!messageToSend) return;
    
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
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setTranscription('');
    setInterimTranscript('');
    setIsLoading(true);

    try {
      // Send message to API - no need to manually add auth token, the axios interceptor handles it
      const response = await axios.post('/api/chat-history/', {
        course: courseId,
        message: messageToSend,
        is_user_message: true,
        context_data: {} // Optional context data
      });

      // Stop any current speech when new message arrives
      if (isSpeaking) {
        stopSpeaking();
        setIsSpeaking(false);
        setSpeakingMessageId(null);
      }

      // Once we get a response, update the messages
      if (response.data) {
        console.log('Received API response:', response.data);
        
        // The backend now directly returns the AI response entry
        const aiResponse = response.data;
        
        // Update messages by removing the temporary user message
        // and adding both the user message and AI response
        setMessages(prev => [
          ...prev.filter(msg => msg.id !== userMessage.id), // Remove temporary message
          {
            id: Date.now() - 100, // Generate stable ID for user message
            message: messageToSend,
            is_user_message: true,
            timestamp: new Date().toISOString()
          },
          aiResponse // Add the AI response from server
        ]);
        
        // Automatically speak the AI's response if it's not a code block
        if (isTtsSupported && !aiResponse.message.includes('```')) {
          speakMessage(aiResponse.message, aiResponse.id);
        }
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Show more detailed error in console
      if (error.response) {
        console.error('Error response data:', error.response.data);
        console.error('Error response status:', error.response.status);
      }
      
      // Show user-friendly error in UI
      setMessages(prev => [
        ...prev, 
        { 
          id: Date.now(), 
          message: 'Sorry, there was an error sending your message. Please try again.',
          is_user_message: false,
          timestamp: new Date().toISOString()
        }
      ]);
    } finally {
      setIsLoading(false);
      // Ensure we scroll to bottom to show the new messages
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
    if (!isSpeechSupported) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }
    
    // Reset transcription
    setTranscription('');
    setInterimTranscript('');
    setIsRecording(true);
    
    // Start speech recognition
    startRecognition({
      onResult: (results) => {
        // Process recognition results
        let finalTranscript = '';
        let interimTranscript = '';
        
        results.forEach(result => {
          if (result.isFinal) {
            finalTranscript += result.transcript + ' ';
          } else {
            interimTranscript += result.transcript;
          }
        });
        
        if (finalTranscript) {
          setTranscription(prev => (prev + ' ' + finalTranscript).trim());
        }
        
        if (interimTranscript) {
          setInterimTranscript(interimTranscript);
        }
      },
      onEnd: () => {
        setIsRecording(false);
        // If transcription exists, set it as input message
        if (transcription) {
          setInputMessage(transcription);
          setInterimTranscript('');
          inputRef.current?.focus();
        }
      },
      onError: (error) => {
        console.error('Speech recognition error:', error);
        setIsRecording(false);
        alert(`Speech recognition error: ${error.message}`);
      }
    });
  };

  const stopRecording = () => {
    if (isRecording) {
      stopRecognition();
      setIsRecording(false);
      
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
    
    speak(cleanText, {
      rate: 1.0,
      pitch: 1.0,
      onStart: () => {
        setIsSpeaking(true);
      },
      onEnd: () => {
        setIsSpeaking(false);
        setSpeakingMessageId(null);
      },
      onError: (error) => {
        console.error('Text-to-speech error:', error);
        setIsSpeaking(false);
        setSpeakingMessageId(null);
      }
    });
  };

  const toggleSpeech = (messageText, messageId) => {
    if (isSpeaking && speakingMessageId === messageId) {
      stopSpeaking();
      setIsSpeaking(false);
      setSpeakingMessageId(null);
    } else {
      speakMessage(messageText, messageId);
    }
  };

  const toggleVoiceGender = () => {
    setPreferredVoiceGender(prev => prev === 'female' ? 'male' : 'female');
  };

  const selectChat = (id) => {
    setChatHistory(prev =>
      prev.map(chat => ({
        ...chat,
        active: chat.id === id
      }))
    );
    
    // Simulate loading a different chat
    setMessages([
      {
        id: "loaded-1",
        message: "This is a previous conversation. How can I help you?",
        is_user_message: false,
        timestamp: new Date().toISOString()
      }
    ]);
    
    // Close sidebar on mobile after selection
    if (window.innerWidth < 768) {
      setSidebarOpen(false);
    }
  };

  const startNewChat = () => {
    // Create a new chat and set it as active
    const newChat = {
      id: Date.now().toString(),
      title: "New Conversation",
      date: new Date(),
      active: true
    };
    
    setChatHistory(prev =>
      prev.map(chat => ({
        ...chat,
        active: false
      })).concat(newChat)
    );
    
    // Reset messages
    setMessages([
      {
        id: "new-1",
        message: "Hello! How can I help you with your studies today?",
        is_user_message: false,
        timestamp: new Date().toISOString()
      }
    ]);
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

  // Add a handleDeleteChat function to ChatComponent
  const handleDeleteChat = (e, chatId) => {
    // Prevent triggering the parent button's onClick
    e.stopPropagation();
    
    // Remove the chat from chatHistory
    setChatHistory(prev => prev.filter(chat => chat.id !== chatId));
    
    // If the active chat was deleted, select another chat if available
    const wasActive = chatHistory.find(chat => chat.id === chatId)?.active;
    if (wasActive && chatHistory.length > 1) {
      // Find the first remaining chat
      const remainingChats = chatHistory.filter(chat => chat.id !== chatId);
      if (remainingChats.length > 0) {
        selectChat(remainingChats[0].id);
      }
    }
  };

  // Add a handleRenameChat function
  const handleRenameClick = (e, chatId, currentName) => {
    // Prevent triggering the parent button's onClick
    e.stopPropagation();
    
    // Set the chat being renamed
    setRenamingChatId(chatId);
    setNewChatName(currentName);
    
    // Focus the input in the next render cycle
    setTimeout(() => {
      renameInputRef.current?.focus();
    }, 0);
  };
  
  // Function to save the rename
  const saveRename = (chatId) => {
    if (newChatName.trim()) {
      setChatHistory(prev => 
        prev.map(chat => 
          chat.id === chatId 
            ? { ...chat, title: newChatName.trim() } 
            : chat
        )
      );
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
            {chatHistory.map((chat) => (
              <button
                key={chat.id}
                className={`chat-history-item ${chat.active ? 'active' : ''}`}
                onClick={() => selectChat(chat.id)}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                  </svg>
                <div className="chat-history-info">
                  {renamingChatId === chat.id ? (
                    <input
                      ref={renameInputRef}
                      type="text"
                      className="chat-rename-input"
                      value={newChatName}
                      onChange={(e) => setNewChatName(e.target.value)}
                      onKeyDown={(e) => handleRenameKeyDown(e, chat.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                  ) : (
                    <p className="chat-history-title">{chat.title}</p>
                  )}
                  <p className="chat-history-date">{chat.date.toLocaleDateString()}</p>
                </div>
                {renamingChatId !== chat.id && (
                  <>
                    <button 
                      className="chat-rename-button" 
                      onClick={(e) => handleRenameClick(e, chat.id, chat.title)}
                      title="Rename chat"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                      </svg>
                    </button>
                    <button 
                      className="chat-delete-button" 
                      onClick={(e) => handleDeleteChat(e, chat.id)}
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
            ))}
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
              {console.log('Rendering avatar component:', {
                userAvatarIdExists: !!userAvatarId,
                userAvatarIdValue: userAvatarId
              })}
              {userAvatarId ? (
                <>
                  {console.log('Rendering avatar with ID:', userAvatarId)}
                  {(() => {
                    const selectedAvatar = avatars.find(avatar => avatar.id === userAvatarId);
                    return selectedAvatar ? (
                      <img
                        src={selectedAvatar.src}
                        alt={selectedAvatar.alt}
                        className="user-avatar-image"
                      />
                    ) : (
                      <span className="avatar-text">AI</span>
                    );
                  })()}
                </>
              ) : (
                <>
                  {console.log('Rendering fallback AI text')}
                  <span className="avatar-text">AI</span>
                </>
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
            <form className="chat-input-form" onSubmit={handleSubmit}>
              <input
                ref={inputRef}
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me about your course or university..."
                disabled={isLoading}
                className="chat-input"
              />
              <button 
                type="button"
                onClick={isRecording ? stopRecording : startRecording}
                className={`voice-button ${isRecording ? 'recording' : ''}`}
                disabled={isLoading || !isSpeechSupported}
                title={!isSpeechSupported ? "Speech recognition not supported in your browser" : ""}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
                  <line x1="12" y1="19" x2="12" y2="23"></line>
                  <line x1="8" y1="23" x2="16" y2="23"></line>
                </svg>
              </button>
              <button 
                type="submit"
                disabled={isLoading || (!inputMessage.trim() && !transcription.trim())} 
                className="send-button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
                Send
              </button>
            </form>
            <p className="input-helper-text">
              {isRecording 
                ? "Click the microphone again to stop recording" 
                : "Press Enter to send, Shift+Enter for a new line"}
            </p>
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
