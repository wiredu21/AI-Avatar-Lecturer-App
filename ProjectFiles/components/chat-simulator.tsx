"use client"

import type React from "react"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export default function ChatSimulator() {
  const [question, setQuestion] = useState("")
  const [answer, setAnswer] = useState("")

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Simulate AI response
    setAnswer("This is a simulated response to your question about your university or course.")
  }

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <h2 className="text-3xl font-bold text-center mb-8">Ask Your Question</h2>
        <div className="max-w-2xl mx-auto">
          <form onSubmit={handleSubmit} className="flex gap-4 mb-4">
            <Input
              type="text"
              placeholder="Ask a university or course specific question..."
              value={question}
              onChange={(e) => setQuestion(e.target.value)}
              className="flex-grow"
            />
            <Button type="submit">Ask</Button>
          </form>
          {answer && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-gray-100 p-4 rounded-lg"
            >
              <p className="font-semibold">Answer:</p>
              <p>{answer}</p>
            </motion.div>
          )}
        </div>
      </div>
    </section>
  )
}

