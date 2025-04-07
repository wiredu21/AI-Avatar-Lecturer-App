import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import './Chat.css';

const Chat = ({ courseId, userId }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const [chatHistory, setChatHistory] = useState([
    { id: "1", title: "Previous Chat 1", date: new Date(2023, 9, 15), active: true },
    { id: "2", title: "Previous Chat 2", date: new Date(2023, 9, 12) },
    { id: "3", title: "Previous Chat 3", date: new Date(2023, 9, 10) },
  ]);
  const [sidebarOpen, setSidebarOpen] = useState(false);

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
      const response = await axios.get(`/api/chat-history/by_course/?course_id=${courseId}`, {
        headers: {
          'Content-Type': 'application/json',
          // Add authentication headers here once auth is set up
        }
      });
      
      if (response.data) {
        setMessages(response.data);
      }
    } catch (error) {
      console.error('Error fetching chat history:', error);
    }
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim()) return;

    // Add user message to UI immediately
    const userMessage = {
      id: Date.now(), // temporary ID
      message: inputMessage,
      is_user_message: true,
      timestamp: new Date().toISOString()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      // Send message to API
      const response = await axios.post('/api/chat-history/', {
        course: courseId,
        message: inputMessage,
        is_user_message: true,
        context_data: {} // Optional context data
      }, {
        headers: {
          'Content-Type': 'application/json',
          // Add authentication headers here once auth is set up
        }
      });

      // Once we get a response, update the messages
      if (response.data) {
        // Update messages with the server response
        setMessages(prev => [
          ...prev.filter(msg => msg.id !== userMessage.id), // Remove temporary message
          response.data // Add the server-generated message with real ID
        ]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Show error in UI
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
    // Simulate voice recording feature
    setIsRecording(true);
    
    // Simulate voice recognition (would be replaced with actual implementation)
    setTimeout(() => {
      setIsRecording(false);
      setInputMessage("Can you explain this concept further?");
      inputRef.current?.focus();
    }, 2000);
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

  return (
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
                <p className="chat-history-title">{chat.title}</p>
                <p className="chat-history-date">{chat.date.toLocaleDateString()}</p>
              </div>
            </button>
          ))}
        </div>

        <div className="sidebar-footer">
          <button className="sidebar-footer-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="3"></circle>
              <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
            Settings
          </button>
          <button className="sidebar-footer-button">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
              <polyline points="16 17 21 12 16 7"></polyline>
              <line x1="21" y1="12" x2="9" y2="12"></line>
            </svg>
            Logout
          </button>
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="chat-main">
        {/* Message Thread */}
        <div className="chat-messages">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`message ${msg.is_user_message ? 'user-message' : 'ai-message'}`}
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
                <div className="message-timestamp">
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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
              onClick={startRecording}
              className={`voice-button ${isRecording ? 'recording' : ''}`}
              disabled={isLoading}
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
              disabled={isLoading || !inputMessage.trim()} 
              className="send-button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="22" y1="2" x2="11" y2="13"></line>
                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
              </svg>
              Send
            </button>
          </form>
          <p className="input-helper-text">Press Enter to send, Shift+Enter for a new line</p>
        </div>
      </div>
    </div>
  );
};

export default Chat;
