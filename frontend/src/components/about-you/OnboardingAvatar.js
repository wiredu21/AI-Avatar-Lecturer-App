import React from "react";
import { motion } from "framer-motion";

const OnboardingAvatar = ({ currentStep }) => {
    // Different messages for each step
    const messages = {
        1: "Let's get to know you better! This helps me personalize your learning experience.",
        2: "Great! Now tell me about your academic background so I can tailor content to your needs.",
        3: "Almost done! Choose how you'd like me to appear during our learning sessions."
    };

    return (
        <div className="relative w-full h-full flex items-center justify-center">
            <motion.div
                className="relative w-[250px] h-[250px] md:w-[300px] md:h-[300px] rounded-full shadow-[0_0_50px_rgba(0,0,0,0.3)]"
                animate={{
                    scale: [1, 1.05, 1],
                }}
                transition={{
                    duration: 5,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                }}
            >
                <div className="absolute inset-0 rounded-full border border-blue-900">
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-blue-600 rounded-full opacity-20" />
                    <div className="absolute inset-0 bg-gradient-to-br from-teal-400/50 to-blue-600/50 rounded-full blur-xl" />
                </div>
                <motion.div
                    className="absolute inset-0 flex items-center justify-center"
                    animate={{
                        y: [0, -10, 0],
                    }}
                    transition={{
                        duration: 3,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: "reverse",
                        ease: "easeInOut",
                    }}
                >
                    <div className="relative w-[90%] h-[90%] rounded-full overflow-hidden">
                        <img
                            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Default_Image_is_a_studio_portrait_featuring_a_young_woman_wit_3_fa1cad51-2ef9-4135-8cd2-ace6229c93ef_0-xyVRodXqAs5HxBKiWAdmxu9J2PCkfA.png"
                            alt="AI Lecturer"
                            className="w-full h-full object-cover object-center scale-110"
                        />
                    </div>
                </motion.div>
            </motion.div>

            {/* Chat Bubble */}
            <motion.div
                className="absolute -top-16 left-1/2 transform -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-[280px] z-10"
                initial={{ opacity: 0, y: 20 }}
                animate={{
                    opacity: 1,
                    y: 0,
                }}
                key={currentStep} // Force re-render animation when step changes
                transition={{
                    duration: 0.5,
                    ease: "easeOut",
                }}
            >
                <p className="text-gray-900 text-center">{messages[currentStep]}</p>
                <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-4 h-4 bg-white/90 rotate-45"></div>
            </motion.div>
        </div>
    );
};

export default OnboardingAvatar; 