import React from "react";

export default function CustomiseAILecturer() {
    return (
        <section className="py-24 bg-gray-50">
            <div className="container mx-auto px-4">
                <div className="flex flex-col lg:flex-row items-center gap-12">
                    <div className="w-full lg:w-1/2">
                        <div className="relative group max-w-lg mx-auto lg:mx-0">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-teal-400 to-blue-600 rounded-lg opacity-75 group-hover:opacity-100 transition duration-300 blur"></div>
                            <div className="relative rounded-lg overflow-hidden bg-gradient-to-br from-teal-500 to-blue-600 p-1">
                                <img
                                    src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/Leonardo_Phoenix_10_A_professional_waistlength_group_picture_o_1.jpg-u7mBUGWhQkpiZZClFaeWodESkiQwxj.jpeg"
                                    alt="AI Lecturer Avatars"
                                    className="w-full h-auto rounded-lg"
                                />
                            </div>
                        </div>
                    </div>
                    <div className="w-full lg:w-1/2">
                        <h2 className="text-4xl font-bold mb-6 text-gray-800">
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-purple-600">
                                Customise Your AI Lecturer
                            </span>
                        </h2>
                        <p className="text-xl text-gray-600 mb-8">Create unique avatars to match your learning style.</p>
                        <p className="text-lg text-gray-600">
                            Choose from a variety of appearances, voices, and teaching styles to create an AI lecturer that resonates
                            with you. Personalise your learning experience and make your studies more engaging and effective.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
} 