import React from 'react';
import { motion } from 'framer-motion';

// Import all avatar options
import avatar1 from '../../assets/images/AvatarOption1.png';
import avatar2 from '../../assets/images/AvatarOption2.png';
import avatar3 from '../../assets/images/AvatarOption3.png';
import avatar4 from '../../assets/images/AvatarOption4.png';
import avatar5 from '../../assets/images/AvatarOption5.png';
import avatar6 from '../../assets/images/AvatarOption6.png';
import avatar7 from '../../assets/images/AvatarOption7.png';
import avatar8 from '../../assets/images/AvatarOption8.png';

const avatarOptions = [
    avatar1, avatar2, avatar3, avatar4, avatar5, avatar6, avatar7, avatar8
];

export default function OnboardingAvatar({ selectedAvatar, onSelectAvatar }) {
    return (
        <div className="relative w-48 h-48 mx-auto">
            {/* Main Avatar Display */}
            <motion.div
                className="w-full h-full rounded-full overflow-hidden border-4 border-white shadow-lg"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
            >
                <img
                    src={avatarOptions[selectedAvatar]}
                    alt="Selected Avatar"
                    className="w-full h-full object-cover"
                />
            </motion.div>

            {/* Avatar Selection Grid */}
            <div className="absolute -bottom-20 left-1/2 transform -translate-x-1/2 w-64 bg-white rounded-lg shadow-lg p-4">
                <div className="grid grid-cols-4 gap-2">
                    {avatarOptions.map((avatar, index) => (
                        <motion.button
                            key={index}
                            className={`w-12 h-12 rounded-full overflow-hidden border-2 transition-all ${selectedAvatar === index
                                    ? 'border-teal-500 scale-110'
                                    : 'border-transparent hover:border-teal-300'
                                }`}
                            onClick={() => onSelectAvatar(index)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <img
                                src={avatar}
                                alt={`Avatar Option ${index + 1}`}
                                className="w-full h-full object-cover"
                            />
                        </motion.button>
                    ))}
                </div>
            </div>
        </div>
    );
} 