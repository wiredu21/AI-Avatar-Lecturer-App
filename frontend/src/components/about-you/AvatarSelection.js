import React from "react";
import { motion } from "framer-motion";
import { Label } from "../ui/label";

// Import all avatar options
import AvatarOption1 from "../../assets/images/AvatarOption1.png";
import AvatarOption2 from "../../assets/images/AvatarOption2.png";
import AvatarOption3 from "../../assets/images/AvatarOption3.png";
import AvatarOption4 from "../../assets/images/AvatarOption4.png";
import AvatarOption5 from "../../assets/images/AvatarOption5.png";
import AvatarOption6 from "../../assets/images/AvatarOption6.png";
import AvatarOption7 from "../../assets/images/AvatarOption7.png";
import AvatarOption8 from "../../assets/images/AvatarOption8.png";

const avatarOptions = [
    { id: 1, src: AvatarOption1, alt: "Professional male lecturer" },
    { id: 2, src: AvatarOption2, alt: "Professional female lecturer" },
    { id: 3, src: AvatarOption3, alt: "Casual male lecturer" },
    { id: 4, src: AvatarOption4, alt: "Casual female lecturer" },
    { id: 5, src: AvatarOption5, alt: "Young male lecturer" },
    { id: 6, src: AvatarOption6, alt: "Young female lecturer" },
    { id: 7, src: AvatarOption7, alt: "Senior male lecturer" },
    { id: 8, src: AvatarOption8, alt: "Senior female lecturer" },
];

const AvatarSelection = ({ selectedAvatar, setSelectedAvatar }) => {
    return (
        <div className="space-y-4">
            <Label className="text-lg font-medium">Choose Your AI Lecturer</Label>
            <p className="text-sm text-gray-600 mb-4">
                Select an avatar that will represent your AI lecturer throughout your learning journey.
            </p>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {avatarOptions.map((avatar) => (
                    <motion.div
                        key={avatar.id}
                        className={`relative rounded-lg overflow-hidden cursor-pointer border-2 ${selectedAvatar === avatar.id
                            ? "border-teal-500 ring-2 ring-teal-500"
                            : "border-transparent hover:border-gray-300"
                            }`}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setSelectedAvatar(avatar.id)}
                    >
                        <img
                            src={avatar.src}
                            alt={avatar.alt}
                            className="w-full h-auto aspect-square object-cover"
                        />
                        {selectedAvatar === avatar.id && (
                            <div className="absolute top-2 right-2 bg-teal-500 text-white rounded-full p-1">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <polyline points="20 6 9 17 4 12"></polyline>
                                </svg>
                            </div>
                        )}
                    </motion.div>
                ))}
            </div>
        </div>
    );
};

export default AvatarSelection;
