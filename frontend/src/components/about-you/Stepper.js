import React from "react";
import { motion } from "framer-motion";

const Stepper = ({ currentStep, totalSteps = 3 }) => {
    const steps = Array.from({ length: totalSteps }, (_, i) => i + 1);

    return (
        <div className="w-full mb-8">
            {/* Desktop Stepper */}
            <div className="hidden md:flex items-center justify-between relative">
                {/* Gradient Line */}
                <div className="absolute h-1 bg-gradient-to-r from-teal-400 to-purple-600 left-0 right-0 top-1/2 transform -translate-y-1/2 z-0"
                    style={{
                        width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%`,
                        transition: 'width 0.5s ease-in-out'
                    }}
                />
                {/* Background Line */}
                <div className="absolute h-1 bg-gray-200 left-0 right-0 top-1/2 transform -translate-y-1/2 z-0" />

                {/* Step Circles */}
                {steps.map((step) => (
                    <motion.div
                        key={step}
                        className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full ${step <= currentStep
                            ? "bg-gradient-to-r from-teal-400 to-purple-600 text-white"
                            : "bg-white border-2 border-gray-300 text-gray-500"
                            }`}
                        initial={{ scale: 0.8 }}
                        animate={{
                            scale: step === currentStep ? 1.1 : 1,
                            transition: { duration: 0.3 }
                        }}
                    >
                        {step < currentStep ? (
                            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <polyline points="20 6 9 17 4 12"></polyline>
                            </svg>
                        ) : (
                            <span className="font-medium">{step}</span>
                        )}
                        <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 whitespace-nowrap text-xs font-medium">
                            {step === 1 && "Personal Info"}
                            {step === 2 && "Academic Details"}
                            {step === 3 && "Avatar Setup"}
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Mobile Stepper */}
            <div className="flex md:hidden justify-center space-x-4 mb-6">
                {steps.map((step) => (
                    <motion.div
                        key={step}
                        className={`w-3 h-3 rounded-full ${step === currentStep
                            ? "bg-gradient-to-r from-teal-400 to-purple-600"
                            : step < currentStep
                                ? "bg-teal-400"
                                : "bg-gray-300"
                            }`}
                        initial={{ scale: 0.8 }}
                        animate={{
                            scale: step === currentStep ? 1.2 : 1,
                            transition: { duration: 0.3 }
                        }}
                    />
                ))}
            </div>
        </div>
    );
};

export default Stepper; 