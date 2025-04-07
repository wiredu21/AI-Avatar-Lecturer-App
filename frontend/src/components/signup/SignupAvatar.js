import React from "react";
import { motion } from "framer-motion";
import SignUpAvatarImage from "../../assets/images/SignUpAvatar.png";

const SignupAvatar = () => {
    return (
        <div className="relative w-[300px] h-[300px] md:w-[350px] md:h-[350px] rounded-full shadow-[0_0_50px_rgba(0,0,0,0.3)]">
            <motion.div
                className="absolute inset-0 rounded-full border border-blue-900"
                animate={{
                    scale: [1, 1.1, 1],
                    rotate: [0, 5, -5, 0],
                }}
                transition={{
                    duration: 5,
                    repeat: Number.POSITIVE_INFINITY,
                    repeatType: "reverse",
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-br from-teal-400 to-blue-600 rounded-full opacity-20" />
                <div className="absolute inset-0 bg-gradient-to-br from-teal-400/50 to-blue-600/50 rounded-full blur-xl" />
            </motion.div>
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
                        src={SignUpAvatarImage}
                        alt="AI Lecturer"
                        className="w-full h-full object-cover object-center scale-110"
                    />
                </div>
            </motion.div>
        </div>
    );
};

export default SignupAvatar; 