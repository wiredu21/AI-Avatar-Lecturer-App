import React from "react";
import { motion } from "framer-motion";
import LottieAnimation from "./LottieAnimation";
import { Button } from "../ui/button";

export default function Hero() {
    return (
        <section id="hero" className="relative min-h-screen overflow-hidden bg-gradient-to-br from-teal-400 to-blue-600">
            <div className="container mx-auto px-4 py-12 flex flex-col lg:flex-row items-center justify-between">
                <motion.div
                    className="lg:w-3/5 text-white"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                >
                    <h1 className="text-5xl font-bold mb-4">Meet Your 24/7 AI Lecturer</h1>
                    <p className="text-xl mb-8">Personalising support and guidance for university students</p>
                    <div className="flex space-x-4">
                        <Button
                            size="lg"
                            className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white text-lg"
                            onClick={() => window.location.href = "/signup"}
                        >
                            Get Started Free
                        </Button>
                        <Button
                            size="lg"
                            variant="outline"
                            className="text-teal-400 border-teal-400 hover:bg-teal-400 hover:text-white text-lg"
                            onClick={() => window.location.href = "/about-you"}
                        >
                            Watch Demo
                        </Button>
                    </div>
                </motion.div>
                <motion.div
                    className="lg:w-2/5 mt-12 lg:mt-0 flex justify-center"
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="relative mt-8">
                        <LottieAnimation />
                        <motion.div
                            className="absolute -top-24 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-[280px] z-10"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{
                                opacity: 1,
                                y: 0,
                                transition: {
                                    y: {
                                        repeat: Number.POSITIVE_INFINITY,
                                        repeatType: "reverse",
                                        duration: 3,
                                        ease: "easeInOut",
                                    },
                                },
                            }}
                        >
                            <p className="font-bold text-gray-900">Q: When is the due date for my dissertation?</p>
                            <p className="text-gray-700">
                                A: The due date for your dissertation is on Sunday the 27th of April 2025 at 11:59pm.
                            </p>
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-4 h-4 bg-white/90 rotate-45"></div>
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
} 