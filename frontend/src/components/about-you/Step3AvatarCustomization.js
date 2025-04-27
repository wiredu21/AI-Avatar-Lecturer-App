import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Label } from "../ui/label";
import { Controller } from "react-hook-form";
import VoiceSelector from "../VoiceSelector";

// Import all avatar options
import AvatarOption1 from "../../assets/images/AvatarOption1.png";
import AvatarOption2 from "../../assets/images/AvatarOption2.png";
import AvatarOption3 from "../../assets/images/AvatarOption3.png";
import AvatarOption4 from "../../assets/images/AvatarOption4.png";
import AvatarOption5 from "../../assets/images/AvatarOption5.png";
import AvatarOption6 from "../../assets/images/AvatarOption6.png";
import AvatarOption7 from "../../assets/images/AvatarOption7.png";
import AvatarOption8 from "../../assets/images/AvatarOption8.png";

const avatars = [
    { value: "1", src: AvatarOption1, label: "Professional male lecturer", gender: "male" },
    { value: "2", src: AvatarOption2, label: "Professional female lecturer", gender: "female" },
    { value: "3", src: AvatarOption3, label: "Casual male lecturer", gender: "male" },
    { value: "4", src: AvatarOption4, label: "Casual female lecturer", gender: "female" },
    { value: "5", src: AvatarOption5, label: "Young male lecturer", gender: "male" },
    { value: "6", src: AvatarOption6, label: "Young female lecturer", gender: "female" },
    { value: "7", src: AvatarOption7, label: "Senior male lecturer", gender: "male" },
    { value: "8", src: AvatarOption8, label: "Senior female lecturer", gender: "female" },
];

const Step3AvatarCustomization = ({ control, errors }) => {
    // State to manage the gender for voice selection
    const [voiceGender, setVoiceGender] = useState('female');

    // Update voice gender based on selected avatar
    useEffect(() => {
        const handleWatchAvatar = (value) => {
            if (value) {
                // Find the selected avatar
                const selectedAvatar = avatars.find(avatar => avatar.value === value);
                if (selectedAvatar) {
                    // Update voice gender to match avatar gender
                    setVoiceGender(selectedAvatar.gender);
                }
            }
        };

        // Get the current avatar value
        const subscription = control._formValues && control._formValues.avatar && 
            handleWatchAvatar(control._formValues.avatar);

        return () => subscription;
    }, [control._formValues]);

    return (
        <motion.div
            key="step3"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.3 }}
            className="space-y-6"
        >
            <h2 className="text-xl font-semibold text-gray-800">Customize Your AI Lecturer</h2>

            {/* Avatar Selection */}
            <div className="space-y-4">
                <Label>Choose Your Avatar</Label>
                <p className="text-sm text-gray-600 mb-4">
                    Select an avatar that will represent your AI lecturer throughout your learning journey.
                </p>
                <Controller
                    name="avatar"
                    control={control}
                    rules={{ required: "Please select an avatar" }}
                    render={({ field }) => (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {avatars.map((avatar) => (
                                <motion.div
                                    key={avatar.value}
                                    className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                                        field.value === avatar.value
                                            ? "border-teal-500 ring-2 ring-teal-200"
                                            : "border-gray-200 hover:border-teal-300"
                                    }`}
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    onClick={() => field.onChange(avatar.value)}
                                >
                                    <img
                                        src={avatar.src}
                                        alt={avatar.label}
                                        className="w-full h-auto aspect-square object-cover"
                                    />
                                    {field.value === avatar.value && (
                                        <div className="absolute top-2 right-2 bg-teal-500 text-white rounded-full p-1">
                                            <svg 
                                                xmlns="http://www.w3.org/2000/svg" 
                                                width="16" 
                                                height="16" 
                                                viewBox="0 0 24 24" 
                                                fill="none" 
                                                stroke="currentColor" 
                                                strokeWidth="2" 
                                                strokeLinecap="round" 
                                                strokeLinejoin="round"
                                            >
                                                <polyline points="20 6 9 17 4 12"></polyline>
                                            </svg>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </div>
                    )}
                />
                {errors.avatar && (
                    <p className="text-sm text-red-500">{errors.avatar.message}</p>
                )}
            </div>

            {/* Voice Selection with Murf AI */}
            <Controller
                name="voiceId"
                control={control}
                rules={{ required: "Please select a voice" }}
                render={({ field }) => (
                    <VoiceSelector
                        selectedVoice={field.value}
                        setSelectedVoice={field.onChange}
                        gender={voiceGender}
                        setGender={setVoiceGender}
                    />
                )}
            />
            {errors.voiceId && (
                <p className="text-sm text-red-500">{errors.voiceId.message}</p>
            )}
        </motion.div>
    );
};

export default Step3AvatarCustomization; 