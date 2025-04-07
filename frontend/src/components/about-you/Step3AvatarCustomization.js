import React from "react";
import { motion } from "framer-motion";
import { Label } from "../ui/label";
import { RadioGroup, RadioGroupItem } from "../ui/radio-group";
import { Controller } from "react-hook-form";
import { Play, Pause } from "lucide-react";

const avatars = [
    { value: "1", label: "Avatar 1", src: "/assets/images/AvatarOption1.png" },
    { value: "2", label: "Avatar 2", src: "/assets/images/AvatarOption2.png" },
    { value: "3", label: "Avatar 3", src: "/assets/images/AvatarOption3.png" },
    { value: "4", label: "Avatar 4", src: "/assets/images/AvatarOption4.png" },
    { value: "5", label: "Avatar 5", src: "/assets/images/AvatarOption5.png" },
    { value: "6", label: "Avatar 6", src: "/assets/images/AvatarOption6.png" },
    { value: "7", label: "Avatar 7", src: "/assets/images/AvatarOption7.png" },
    { value: "8", label: "Avatar 8", src: "/assets/images/AvatarOption8.png" },
];

const Step3AvatarCustomization = ({ control, errors }) => {
    const handleVoiceSample = (voiceGender) => {
        // Placeholder for voice sample playback
        console.log(`Playing voice sample for ${voiceGender} voice`);
    };

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
                <Controller
                    name="avatar"
                    control={control}
                    rules={{ required: "Please select an avatar" }}
                    render={({ field }) => (
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {avatars.map((avatar) => (
                                <div
                                    key={avatar.value}
                                    className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${field.value === avatar.value
                                            ? "border-teal-500 ring-2 ring-teal-200"
                                            : "border-gray-200 hover:border-teal-300"
                                        }`}
                                    onClick={() => field.onChange(avatar.value)}
                                >
                                    <img
                                        src={avatar.src}
                                        alt={avatar.label}
                                        className="w-full h-auto object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    )}
                />
                {errors.avatar && <p className="text-sm text-red-500">{errors.avatar.message}</p>}
            </div>

            {/* Voice Selection */}
            <div className="space-y-4">
                <Label>Choose Voice</Label>
                <Controller
                    name="voiceGender"
                    control={control}
                    defaultValue="female"
                    render={({ field }) => (
                        <RadioGroup
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                            className="flex flex-col space-y-2"
                        >
                            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                <div className="flex items-center space-x-3">
                                    <RadioGroupItem value="female" id="female" />
                                    <Label htmlFor="female">Female Voice</Label>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleVoiceSample("female")}
                                    className="p-2 rounded-full hover:bg-gray-100"
                                >
                                    <Play className="h-5 w-5 text-gray-600" />
                                </button>
                            </div>
                            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                <div className="flex items-center space-x-3">
                                    <RadioGroupItem value="male" id="male" />
                                    <Label htmlFor="male">Male Voice</Label>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => handleVoiceSample("male")}
                                    className="p-2 rounded-full hover:bg-gray-100"
                                >
                                    <Play className="h-5 w-5 text-gray-600" />
                                </button>
                            </div>
                        </RadioGroup>
                    )}
                />
            </div>
        </motion.div>
    );
};

export default Step3AvatarCustomization; 