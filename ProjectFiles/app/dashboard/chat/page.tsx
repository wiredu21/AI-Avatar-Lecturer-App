"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Mic, Send, LogOut, Settings, Clock, Plus, Menu, ArrowLeft, Sparkles } from "lucide-react"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { motion, AnimatePresence } from "framer-motion"
import { format } from "date-fns"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"
import "@/styles/chat.css"

type Message = {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
  hasCode?: boolean
}

type ChatHistory = {
  id: string
  title: string
  date: Date
  active?: boolean
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content: "Hello Sarah! How can I help you with your studies today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isRecording, setIsRecording] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [chatHistory, setChatHistory] = useState<ChatHistory[]>([
    { id: "1", title: "Explain OOP Concepts", date: new Date(2023, 9, 15), active: true },
    { id: "2", title: "Database Normalization", date: new Date(2023, 9, 12) },
    { id: "3", title: "Web Development Basics", date: new Date(2023, 9, 10) },
    { id: "4", title: "AI Ethics Discussion", date: new Date(2023, 9, 5) },
  ])

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleSend = () => {
    if (!input.trim()) return

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    }
    setMessages((prev) => [...prev, userMessage])
    setInput("")

    // Show loading state
    setIsLoading(true)

    // Simulate AI response with code example
    setTimeout(() => {
      setIsLoading(false)

      // Check if the message contains certain keywords to trigger an error
      if (input.toLowerCase().includes("unrelated") || input.toLowerCase().includes("off-topic")) {
        toast({
          title: "Invalid Query",
          description: "I can only answer questions about your course or university.",
          variant: "destructive",
        })
        return
      }

      // Check if the message should include code
      const shouldIncludeCode =
        input.toLowerCase().includes("code") ||
        input.toLowerCase().includes("example") ||
        input.toLowerCase().includes("syntax")

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: shouldIncludeCode
          ? 'Here\'s an example of object-oriented programming in Java:\n\n```java\npublic class Student {\n    private String name;\n    private int id;\n    \n    public Student(String name, int id) {\n        this.name = name;\n        this.id = id;\n    }\n    \n    public void displayInfo() {\n        System.out.println("Student: " + name + ", ID: " + id);\n    }\n}\n```\n\nThis class demonstrates encapsulation by using private fields and public methods to access them.'
          : "I'm your AI lecturer assistant. I'm here to help with your coursework and answer questions about your university modules. What specific topic would you like to explore today?",
        sender: "ai",
        timestamp: new Date(),
        hasCode: shouldIncludeCode,
      }
      setMessages((prev) => [...prev, aiMessage])
    }, 2000)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  const startRecording = () => {
    // Check if browser supports speech recognition
    if (!("webkitSpeechRecognition" in window) && !("SpeechRecognition" in window)) {
      toast({
        title: "Voice Input Not Supported",
        description: "Your browser doesn't support voice input. Please type your question.",
        variant: "destructive",
      })
      return
    }

    setIsRecording(true)

    // Simulate voice recording and failure for demo
    setTimeout(() => {
      setIsRecording(false)

      // Randomly decide if voice recognition fails (for demo purposes)
      const voiceRecognitionFails = Math.random() > 0.7

      if (voiceRecognitionFails) {
        toast({
          title: "Voice Input Failed",
          description: "Voice input failed. Please type your question.",
          variant: "destructive",
        })
      } else {
        setInput("Can you explain object-oriented programming concepts?")
        inputRef.current?.focus()
      }
    }, 3000)
  }

  const selectChat = (id: string) => {
    setChatHistory((prev) =>
      prev.map((chat) => ({
        ...chat,
        active: chat.id === id,
      })),
    )

    // Simulate loading a different chat
    setMessages([
      {
        id: "loaded-1",
        content: "Hello! How can I help you with this topic?",
        sender: "ai",
        timestamp: new Date(),
      },
    ])
  }

  const startNewChat = () => {
    // Create a new chat and set it as active
    const newChat = {
      id: Date.now().toString(),
      title: "New Conversation",
      date: new Date(),
      active: true,
    }

    setChatHistory((prev) =>
      prev
        .map((chat) => ({
          ...chat,
          active: false,
        }))
        .concat(newChat),
    )

    // Reset messages
    setMessages([
      {
        id: "new-1",
        content: "Hello! How can I help you with your studies today?",
        sender: "ai",
        timestamp: new Date(),
      },
    ])
  }

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Format code blocks with syntax highlighting
  const formatMessage = (content: string, hasCode?: boolean) => {
    if (!hasCode) return content

    const parts = content.split("```")

    if (parts.length <= 1) return content

    return (
      <>
        {parts.map((part, index) => {
          // Even indices are regular text, odd indices are code blocks
          if (index % 2 === 0) {
            return <p key={index}>{part}</p>
          } else {
            // Extract language if specified (e.g., \`\`\`java)
            const firstLineBreak = part.indexOf("\n")
            const language = firstLineBreak > 0 ? part.substring(0, firstLineBreak) : ""
            const code = firstLineBreak > 0 ? part.substring(firstLineBreak + 1) : part

            return (
              <pre key={index} className="bg-purple-50 p-3 rounded-md my-2 overflow-x-auto border border-purple-200">
                {language && <div className="text-xs text-purple-600 mb-1 font-bold">{language}</div>}
                <code className="text-purple-700 font-mono">{code}</code>
              </pre>
            )
          }
        })}
      </>
    )
  }

  return (
    <div className="h-screen flex flex-col bg-gradient-to-br from-teal-50 to-purple-50">
      {/* Back to Dashboard Link */}
      <div className="p-4 border-b border-teal-200 bg-white/80 backdrop-blur-sm shadow-sm">
        <Link
          href="/dashboard"
          className="flex items-center text-teal-600 hover:text-teal-700 font-medium transition-colors"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Link>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Mobile Menu Toggle */}
        <div className="md:hidden fixed bottom-4 right-4 z-10">
          <Button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="rounded-full h-12 w-12 flex items-center justify-center bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700 shadow-lg"
          >
            <Menu className="h-6 w-6 text-white" />
          </Button>
        </div>

        {/* Left Sidebar - Chat History (20% width) */}
        <div
          className={`w-full md:w-1/5 border-r border-teal-200 flex flex-col chat-sidebar ${sidebarOpen ? "open" : ""} bg-white/80 backdrop-blur-sm`}
        >
          <div className="p-4 border-b border-teal-200 bg-gradient-to-r from-teal-500 to-purple-600">
            <Button
              onClick={startNewChat}
              className="w-full flex items-center justify-center gap-2 bg-white text-purple-700 border-none hover:bg-teal-50 shadow-md transition-all duration-300 hover:shadow-lg"
            >
              <Plus className="h-4 w-4" />
              New Chat
            </Button>
          </div>

          <div className="flex-1 overflow-y-auto">
            {chatHistory.map((chat) => (
              <button
                key={chat.id}
                className={`w-full text-left p-3 flex items-start gap-2 transition-all duration-200 ${
                  chat.active
                    ? "bg-gradient-to-r from-teal-500 to-purple-600 text-white shadow-md"
                    : "bg-white text-gray-800 hover:bg-teal-50"
                }`}
                onClick={() => {
                  selectChat(chat.id)
                  if (window.innerWidth < 768) {
                    setSidebarOpen(false)
                  }
                }}
              >
                <Clock className={`h-4 w-4 mt-0.5 ${chat.active ? "text-white" : "text-teal-500"}`} />
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{chat.title}</p>
                  <p className={`text-xs ${chat.active ? "text-teal-100" : "text-purple-500"}`}>
                    {format(chat.date, "d MMM")}
                  </p>
                </div>
              </button>
            ))}
          </div>

          <div className="p-4 border-t border-teal-200 bg-white/60">
            <Link href="/dashboard/settings">
              <Button
                variant="ghost"
                className="w-full flex items-center justify-start gap-2 text-purple-700 hover:bg-purple-50 mb-2"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Button>
            </Link>
            <Button
              variant="ghost"
              className="w-full flex items-center justify-start gap-2 text-purple-700 hover:bg-purple-50"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>

        {/* Avatar Preview (50% width) */}
        <div className="hidden md:flex w-1/2 flex-col items-center justify-center bg-gradient-to-b from-teal-100/50 to-purple-100/50 border-r border-teal-200">
          <div className="relative">
            <div className="h-64 w-64 rounded-full border-4 border-teal-500 flex items-center justify-center overflow-hidden bg-white shadow-xl relative">
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-br from-teal-100 to-purple-100 opacity-50"></div>

              {/* Animated particles */}
              <div className="absolute inset-0 overflow-hidden">
                {[...Array(10)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute h-2 w-2 rounded-full bg-teal-400"
                    initial={{
                      x: Math.random() * 100 - 50,
                      y: Math.random() * 100 - 50,
                      opacity: 0.3,
                    }}
                    animate={{
                      x: [Math.random() * 100 - 50, Math.random() * 100 - 50],
                      y: [Math.random() * 100 - 50, Math.random() * 100 - 50],
                      opacity: [0.3, 0.7, 0.3],
                    }}
                    transition={{
                      duration: 3 + Math.random() * 2,
                      repeat: Number.POSITIVE_INFINITY,
                      repeatType: "reverse",
                    }}
                  />
                ))}
              </div>

              <Avatar className="h-56 w-56 relative z-10">
                <AvatarImage src="/avatars/female2.png" alt="AI Lecturer" />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>

              {/* Animated glow effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-teal-500/20 to-purple-500/20 z-0"
                animate={{
                  opacity: [0.2, 0.4, 0.2],
                  scale: [1, 1.05, 1],
                }}
                transition={{
                  duration: 4,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
              />
            </div>

            {/* Animated speech bubble */}
            {isLoading ? (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="absolute -top-20 left-1/2 transform -translate-x-1/2 bg-white p-4 rounded-lg shadow-md border border-teal-200 max-w-[200px]"
              >
                <div className="flex space-x-1 justify-center">
                  <motion.div
                    className="h-3 w-3 bg-teal-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                  />
                  <motion.div
                    className="h-3 w-3 bg-purple-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, delay: 0.2 }}
                  />
                  <motion.div
                    className="h-3 w-3 bg-teal-500 rounded-full"
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY, delay: 0.4 }}
                  />
                </div>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 rotate-45 h-4 w-4 bg-white border-r border-b border-teal-200"></div>
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute -top-16 -right-8 transform rotate-12"
              >
                <div className="bg-purple-600 text-white p-2 rounded-full shadow-lg">
                  <Sparkles className="h-5 w-5" />
                </div>
              </motion.div>
            )}
          </div>

          <div className="mt-8 text-center">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-teal-600 to-purple-600 text-transparent bg-clip-text">
              AI Lecturer
            </h2>
            <p className="text-purple-600 font-medium">University of Northampton</p>
            <p className="mt-4 text-sm text-gray-700 max-w-md px-6 bg-white/60 backdrop-blur-sm p-4 rounded-lg shadow-md border border-teal-200">
              I'm your personal AI lecturer assistant. Ask me anything about your courses, assignments, or university
              resources.
            </p>

            <div className="mt-6">
              <Link href="/dashboard/settings?tab=avatar">
                <Button className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700 text-white border-none shadow-md hover:shadow-lg transition-all duration-300">
                  Customize Avatar
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Message Thread and Input Bar (30% width) */}
        <div className="w-full md:w-3/10 flex flex-col h-full bg-white/80 backdrop-blur-sm">
          {/* Mobile Avatar Header */}
          <div className="md:hidden p-4 border-b border-teal-200 flex items-center bg-gradient-to-r from-teal-500/90 to-purple-600/90 text-white">
            <div className="relative">
              <Avatar className="h-10 w-10 border-2 border-white">
                <AvatarImage src="/avatars/female2.png" alt="AI Lecturer" />
                <AvatarFallback>AI</AvatarFallback>
              </Avatar>
              <motion.div
                className="absolute -top-1 -right-1 h-3 w-3 bg-teal-300 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
              />
            </div>
            <div className="ml-3">
              <h2 className="font-medium">AI Lecturer</h2>
              <p className="text-xs text-teal-100">University of Northampton</p>
            </div>
          </div>

          {/* Message Thread */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gradient-to-br from-teal-50/50 to-purple-50/50">
            <AnimatePresence>
              {messages.map((message) => (
                <motion.div
                  key={message.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}
                >
                  {message.sender === "ai" && (
                    <div className="relative mr-2 mt-1">
                      <Avatar className="h-8 w-8 border border-teal-300">
                        <AvatarImage src="/avatars/female2.png" alt="AI Lecturer" />
                        <AvatarFallback>AI</AvatarFallback>
                      </Avatar>
                      <motion.div
                        className="absolute -bottom-1 -right-1 h-2 w-2 bg-teal-400 rounded-full"
                        animate={{ scale: [1, 1.2, 1] }}
                        transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
                      />
                    </div>
                  )}
                  <div
                    className={`max-w-[90%] rounded-lg px-4 py-2 shadow-md ${
                      message.sender === "user"
                        ? "bg-gradient-to-r from-teal-500 to-teal-600 text-white"
                        : "bg-gradient-to-r from-purple-500 to-purple-600 text-white"
                    }`}
                  >
                    {message.hasCode ? formatMessage(message.content, message.hasCode) : <p>{message.content}</p>}
                    <p className="text-xs opacity-80 mt-1 text-right">{format(message.timestamp, "h:mm a")}</p>
                  </div>
                  {message.sender === "user" && (
                    <Avatar className="h-8 w-8 ml-2 mt-1 border border-teal-300">
                      <AvatarImage src="/avatars/female1.png" alt="User" />
                      <AvatarFallback>SJ</AvatarFallback>
                    </Avatar>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>

          {/* Input Bar */}
          <div className="border-t border-teal-200 p-4 bg-white/90 backdrop-blur-sm">
            <div className="flex gap-2">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask me about your course or university..."
                className="flex-1 focus-visible:ring-teal-500 border-teal-200 shadow-sm"
                aria-label="Message input"
              />
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={startRecording}
                      className={`border-teal-200 ${isRecording ? "bg-red-100" : "hover:bg-purple-50"}`}
                      aria-label="Voice input"
                    >
                      <Mic className={`h-4 w-4 ${isRecording ? "text-red-500" : "text-purple-600"}`} />
                      {isRecording && (
                        <motion.div
                          className="absolute inset-0 rounded-md border border-red-500"
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 1, repeat: Number.POSITIVE_INFINITY }}
                        />
                      )}
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    <p>Voice input</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <Button
                onClick={handleSend}
                disabled={!input.trim()}
                className="bg-gradient-to-r from-teal-500 to-purple-600 hover:from-teal-600 hover:to-purple-700 text-white shadow-md hover:shadow-lg transition-all duration-300"
                aria-label="Send message"
              >
                <Send className="h-4 w-4 mr-2" />
                Send
              </Button>
            </div>
            <p className="text-xs text-purple-600 mt-2 text-center">Press Enter to send, Shift+Enter for a new line</p>
          </div>
        </div>
      </div>
    </div>
  )
}

