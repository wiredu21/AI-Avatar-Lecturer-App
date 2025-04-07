import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import { ArrowLeft, ArrowRight, Loader2 } from "lucide-react";
import Stepper from "./Stepper";
import OnboardingAvatar from "./OnboardingAvatar";
import Step1PersonalInfo from "./Step1PersonalInfo";
import Step2AcademicDetails from "./Step2AcademicDetails";
import Step3AvatarCustomization from "./Step3AvatarCustomization";
import iconImage from "../../assets/images/icon.png";

// Step messages for the avatar chat bubble
const stepMessages = [
    "Let's get to know you better! This helps me personalize your learning experience.",
    "Great! Now tell me about your academic background so I can tailor content to your needs.",
    "Almost done! Choose how you'd like me to appear during our learning sessions."
];

export default function AboutYouPage() {
    const [currentStep, setCurrentStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        control,
        watch,
        formState: { errors, isValid },
    } = useForm({
        mode: "onChange",
        defaultValues: {
            firstName: "",
            surname: "",
            dateOfBirth: "",
            gender: "",
            nationality: "",
            academicLevel: "",
            university: "",
            course: "",
            avatar: 0,
            voiceGender: "female",
        },
    });

    // Check if user is logged in
    useEffect(() => {
        const authToken = localStorage.getItem("authToken");
        const isFirstTimeLogin = localStorage.getItem("isFirstTimeLogin") === "true";
        
        if (!authToken) {
            // Redirect to login if not authenticated
            navigate("/login");
        } else if (!isFirstTimeLogin) {
            // If authenticated but not a first-time user, redirect to dashboard
            navigate("/dashboard");
        }
    }, [navigate]);

    const validateStep = (step) => {
        let stepErrors = {};
        let isValid = true;

        if (step === 1) {
            if (!watch("firstName")) {
                stepErrors.firstName = "First name is required";
                isValid = false;
            }
            if (!watch("surname")) {
                stepErrors.surname = "Surname is required";
                isValid = false;
            }
            if (!watch("academicLevel")) {
                stepErrors.academicLevel = "Academic level is required";
                isValid = false;
            }
        } else if (step === 2) {
            if (!watch("university")) {
                stepErrors.university = "Please select your university";
                isValid = false;
            }
            if (!watch("course")) {
                stepErrors.course = "Please select your course";
                isValid = false;
            }
        } else if (step === 3) {
            if (!watch("avatar")) {
                stepErrors.avatar = "Please select an avatar";
                isValid = false;
            }
        }

        return isValid;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            if (currentStep < 3) {
                setCurrentStep(currentStep + 1);
            } else {
                handleSubmit(onSubmit)();
            }
        }
    };

    const handlePrevious = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const onSubmit = (data) => {
        setIsLoading(true);

        // Simulate API call
        setTimeout(() => {
            // In a real implementation, save user profile to backend
            // const response = await fetch('/api/user/profile', {
            //    method: 'POST',
            //    headers: { 
            //        'Content-Type': 'application/json',
            //        'Authorization': `Bearer ${localStorage.getItem('authToken')}`
            //    },
            //    body: JSON.stringify(data)
            // });

            // Save preferences to localStorage
            localStorage.setItem("userProfile", JSON.stringify(data));
            
            // Mark that the user has completed onboarding
            localStorage.setItem("isFirstTimeLogin", "false");
            
            console.log("Profile data submitted:", data);
            setShowSuccessModal(true);
            setIsLoading(false);
        }, 1500);
    };

    const handleContinue = () => {
        navigate("/dashboard");
    };

    // Render the current step
    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <Step1PersonalInfo control={control} register={register} errors={errors} />;
            case 2:
                return <Step2AcademicDetails control={control} watch={watch} errors={errors} />;
            case 3:
                return <Step3AvatarCustomization control={control} errors={errors} />;
            default:
                return null;
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row relative">
            {/* Back to Home Link */}
            <Link
                to="/"
                className="absolute top-6 left-6 flex items-center text-white hover:text-teal-300 transition-colors z-10"
            >
                <ArrowLeft className="mr-2 h-4 w-4" />
                <span>Back to Home</span>
            </Link>

            {/* Progress Stepper - Mobile */}
            <div className="md:hidden w-full bg-white p-4 flex justify-center">
                <div className="flex items-center space-x-4">
                    {[1, 2, 3].map((step) => (
                        <div
                            key={step}
                            className={`rounded-full w-8 h-8 flex items-center justify-center text-sm font-medium transition-all
                                ${currentStep === step
                                    ? "bg-gradient-to-r from-teal-400 to-purple-600 text-white shadow-lg"
                                    : currentStep > step
                                        ? "bg-gray-200 text-gray-700"
                                        : "bg-gray-100 text-gray-400"
                                }`}
                        >
                            {step}
                        </div>
                    ))}
                </div>
            </div>

            {/* Visual Side (left) - Hidden on mobile */}
            <div className="hidden md:flex md:w-2/5 bg-gradient-to-br from-teal-400 to-purple-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-circuit-pattern opacity-10"></div>

                {/* Progress Stepper - Desktop */}
                <div className="absolute top-16 left-1/2 transform -translate-x-1/2 z-10">
                    <div className="flex items-center">
                        {[1, 2, 3].map((step, index) => (
                            <div key={step} className="flex items-center">
                                <div
                                    className={`rounded-full w-12 h-12 flex items-center justify-center text-base font-medium transition-all
                                        ${currentStep === step
                                            ? "bg-gradient-to-r from-teal-400 to-purple-600 text-white shadow-lg ring-2 ring-white scale-110 transform"
                                            : currentStep > step
                                                ? "bg-white text-purple-600"
                                                : "bg-white/50 text-gray-600"
                                        }`}
                                >
                                    {step}
                                </div>
                                {index < 2 && (
                                    <div className="w-16 h-1 mx-1 rounded-full bg-gradient-to-r from-teal-400 to-purple-600 opacity-50"></div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="flex items-center justify-center w-full h-full">
                    <div className="relative">
                        <motion.div
                            className="absolute -top-24 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-[280px] z-10"
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
                            <p className="text-gray-900 text-center">{stepMessages[currentStep - 1]}</p>
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-4 h-4 bg-white/90 rotate-45"></div>
                        </motion.div>
                        <OnboardingAvatar currentStep={currentStep} />
                    </div>
                </div>
            </div>

            {/* Form Side (right) */}
            <div className="w-full md:w-3/5 flex items-center justify-center p-4 md:p-8 bg-gray-50">
                <motion.div
                    className="w-full max-w-2xl p-6 md:p-8 bg-white rounded-lg shadow-lg"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5 }}
                >
                    {/* Logo and Header */}
                    <div className="flex flex-col items-center mb-8">
                        <Link to="/" className="flex items-center mb-4">
                            <div className="w-8 h-8 mr-2">
                                <img
                                    src={iconImage}
                                    alt="VirtuAId Logo"
                                    className="object-contain w-full h-full"
                                />
                            </div>
                            <span className="text-xl font-bold">
                                Virtu
                                <span className="bg-gradient-to-r from-teal-400 to-purple-600 text-transparent bg-clip-text">AId</span>
                            </span>
                        </Link>
                        <h1 className="text-2xl font-bold text-center text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-purple-600">
                            Tell Us About You
                        </h1>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <AnimatePresence mode="wait">
                            {renderStep()}
                        </AnimatePresence>

                        {/* Navigation Buttons */}
                        <div className="flex justify-between pt-4 border-t border-gray-100">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={handlePrevious}
                                disabled={currentStep === 1}
                                className="flex items-center"
                            >
                                <ArrowLeft className="mr-2 h-4 w-4" />
                                Previous
                            </Button>

                            {currentStep < 3 ? (
                                <Button
                                    type="button"
                                    onClick={handleNext}
                                    className="bg-gradient-to-r from-teal-400 to-purple-600 hover:from-teal-500 hover:to-purple-700 flex items-center"
                                >
                                    Next
                                    <ArrowRight className="ml-2 h-4 w-4" />
                                </Button>
                            ) : (
                                <Button
                                    type="submit"
                                    disabled={isLoading || !isValid}
                                    className="bg-gradient-to-r from-teal-400 to-purple-600 hover:from-teal-500 hover:to-purple-700"
                                >
                                    {isLoading ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Setting up your account...
                                        </>
                                    ) : (
                                        "Save and Continue"
                                    )}
                                </Button>
                            )}
                        </div>
                    </form>
                </motion.div>
            </div>

            {/* Success Modal */}
            <Dialog open={showSuccessModal} onClose={() => setShowSuccessModal(false)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Profile Completed!</DialogTitle>
                        <DialogDescription>
                            Your profile has been successfully set up. You're all set to start using VirtuAId!
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-6 flex justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500">
                            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                            <polyline points="22 4 12 14.01 9 11.01" />
                        </svg>
                    </div>
                    <div className="mt-6 flex justify-end">
                        <Button
                            onClick={handleContinue}
                            className="bg-gradient-to-r from-teal-400 to-purple-600 hover:from-teal-500 hover:to-purple-700"
                        >
                            Continue to Dashboard
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}



