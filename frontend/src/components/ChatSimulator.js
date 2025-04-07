import React from "react";
import { motion } from "framer-motion";

export default function ChatSimulator() {
    return (
        <section className="py-20 bg-white">
            <div className="container mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-4">Ask Your Question</h2>
                <p className="text-center text-gray-600 max-w-2xl mx-auto mb-8">
                    With VirtuAId, students can ask any university or course-related questions to their personalised AI lecturer.
                    From assignment deadlines and course materials to career advice and study techniques, your AI lecturer is
                    available 24/7 to provide accurate, tailored responses.
                </p>

                <div className="max-w-2xl mx-auto">
                    <div className="flex gap-4 mb-4">
                        <input
                            type="text"
                            placeholder="Ask a university or course specific question..."
                            className="flex-grow p-2 border border-gray-300 rounded-md"
                            disabled
                        />
                        <button
                            type="button"
                            className="px-4 py-2 bg-primary text-white rounded-md"
                            disabled
                        >
                            Ask
                        </button>
                    </div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gray-100 p-4 rounded-lg"
                    >
                        <p className="font-semibold">Example Question:</p>
                        <p className="mb-2">When is the deadline for my Computer Science project submission?</p>
                        <p className="font-semibold">AI Lecturer Response:</p>
                        <p>
                            Based on your course schedule, the Computer Science project submission deadline is on Friday, May 15th at
                            11:59 PM. Remember to upload both your code and documentation to the learning portal. Would you like me to
                            send you a reminder a week before the deadline?
                        </p>
                    </motion.div>
                </div>
            </div>
        </section>
    );
} 