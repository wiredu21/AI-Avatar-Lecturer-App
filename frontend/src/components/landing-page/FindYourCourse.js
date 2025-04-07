import React from "react";

export default function FindYourCourse() {
    return (
        <section className="relative py-24 overflow-hidden">
            <div className="absolute inset-0 z-0">
                <img
                    src="/course-background.jpg"
                    alt="Course themed background"
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-teal-400 opacity-60"></div>
            </div>
            <div className="container mx-auto px-4 relative z-10">
                <div className="max-w-3xl mx-auto text-center text-white">
                    <h2 className="text-4xl font-bold mb-4">Find Your Course</h2>
                    <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-6">
                        <p className="text-lg">
                            Select your chosen course of study from our comprehensive list, tailored to your academic and professional
                            goals.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
} 