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
import { userApi } from "../../utils/axios";

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
    const [validationErrors, setValidationErrors] = useState({});

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
            courseYear: "",
            university: "",
            course: "",
            avatar: 0,
            voiceId: "",
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
            // Check firstName (required, min 3 chars, letters only)
            if (!watch("firstName")) {
                stepErrors.firstName = "First name is required";
                isValid = false;
            } else if (watch("firstName").length < 3) {
                stepErrors.firstName = "First name must be at least 3 characters";
                isValid = false;
            } else if (!/^[A-Za-z\s]+$/.test(watch("firstName"))) {
                stepErrors.firstName = "First name must contain only letters";
                isValid = false;
            }
            
            // Check surname (required, min 3 chars, letters only)
            if (!watch("surname")) {
                stepErrors.surname = "Surname is required";
                isValid = false;
            } else if (watch("surname").length < 3) {
                stepErrors.surname = "Surname must be at least 3 characters";
                isValid = false;
            } else if (!/^[A-Za-z\s]+$/.test(watch("surname"))) {
                stepErrors.surname = "Surname must contain only letters";
                isValid = false;
            }
            
            // Check dateOfBirth (required and age >= 18)
            if (!watch("dateOfBirth")) {
                stepErrors.dateOfBirth = "Date of birth is required";
                isValid = false;
            } else {
                const dob = new Date(watch("dateOfBirth"));
                const today = new Date();
                const eighteenYearsAgo = new Date(today);
                eighteenYearsAgo.setFullYear(today.getFullYear() - 18);
                
                if (dob > eighteenYearsAgo) {
                    stepErrors.dateOfBirth = "You must be at least 18 years old";
                    isValid = false;
                }
            }
            
            // Check gender (required)
            if (!watch("gender")) {
                stepErrors.gender = "Please select your gender";
                isValid = false;
            }
            
            // Check nationality (required)
            if (!watch("nationality")) {
                stepErrors.nationality = "Please select your nationality";
                isValid = false;
            }
            
            // Check academicLevel (required)
            if (!watch("academicLevel")) {
                stepErrors.academicLevel = "Academic level is required";
                isValid = false;
            }
            
            // Check courseYear (required)
            if (!watch("courseYear")) {
                stepErrors.courseYear = "Please select your course year";
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
            if (!watch("voiceId")) {
                stepErrors.voiceId = "Please select a specific voice for your avatar";
                isValid = false;
            }
        }

        setValidationErrors(stepErrors);
        return isValid;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setValidationErrors({});
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

    const onSubmit = async (data) => {
        // Validate that both avatar and voice are selected before proceeding
        if (!data.avatar || !data.voiceId) {
            const errors = {};
            if (!data.avatar) errors.avatar = "Please select an avatar";
            if (!data.voiceId) errors.voiceId = "Please select a specific voice for your avatar";
            setValidationErrors(errors);
            return; // Don't proceed if validation fails
        }

        setIsLoading(true);

        try {
            // Log the exact data being sent to the API
            const profileData = {
                first_name: data.firstName,
                surname: data.surname,
                date_of_birth: data.dateOfBirth,
                gender: data.gender,
                nationality: data.nationality,
                // Send university as a string - the backend will handle lookup
                university: data.university,
                course: data.course,
                course_year: data.courseYear,
                academic_level: data.academicLevel,
                // Ensure avatar is an integer
                avatar: parseInt(data.avatar) || 0,
                voice_id: data.voiceId
            };
            
            console.log("[DEBUG] AboutYouPage - Data being sent to API:", {
                rawData: profileData,
                dateType: typeof data.dateOfBirth,
                universityType: typeof data.university,
                avatarType: typeof data.avatar,
                parsedAvatar: parseInt(data.avatar) || 0
            });
            
            // Save profile to database and await completion
            const profileResponse = await userApi.saveUserProfile(profileData);

            console.log("Profile saved to database:", profileResponse);

            // Also update localStorage for backup
            localStorage.setItem("userProfile", JSON.stringify(data));
            localStorage.setItem("isFirstTimeLogin", "false");
            localStorage.setItem("hasCompletedOnboarding", "true");
            
            // Set a flag in sessionStorage to indicate we just completed onboarding
            // This will be used to bypass the onboarding check in DashboardLayout
            sessionStorage.setItem("justCompletedOnboarding", "true");

            console.log("[DEBUG] AboutYouPage - Flag set:", {
                sessionFlag: sessionStorage.getItem("justCompletedOnboarding"),
                localStorageHasCompleted: localStorage.getItem("hasCompletedOnboarding"),
                localStorageFirstTime: localStorage.getItem("isFirstTimeLogin")
            });

            console.log("Onboarding completed and flag set!");
            setShowSuccessModal(true);
        } catch (error) {
            console.error("Error saving profile:", error);
            // Show validation errors if returned from the server
            if (error.response?.data) {
                console.log("Server validation errors:", error.response.data);
                setValidationErrors(error.response.data);
            } else {
                // Fallback to localStorage-only if API fails
                localStorage.setItem("userProfile", JSON.stringify(data));
                localStorage.setItem("isFirstTimeLogin", "false");
                localStorage.setItem("hasCompletedOnboarding", "true");
                sessionStorage.setItem("justCompletedOnboarding", "true");
                setShowSuccessModal(true);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleContinue = () => {
        console.log("[DEBUG] AboutYouPage - Continue button clicked");
        console.log("[DEBUG] AboutYouPage - Before timeout, flags:", {
            sessionFlag: sessionStorage.getItem("justCompletedOnboarding"),
            localStorageHasCompleted: localStorage.getItem("hasCompletedOnboarding")
        });
        
        // We add a small delay before navigating to ensure all state changes have been processed
        setTimeout(() => {
            console.log("[DEBUG] AboutYouPage - After timeout, navigating to dashboard");
            navigate("/dashboard");
        }, 300);
    };

    // Render the current step
    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return <Step1PersonalInfo 
                    control={control} 
                    register={register} 
                    errors={{...errors, ...validationErrors}} 
                />;
            case 2:
                return <Step2AcademicDetails 
                    control={control} 
                    watch={watch} 
                    errors={{...errors, ...validationErrors}} 
                />;
            case 3:
                return <Step3AvatarCustomization 
                    control={control} 
                    errors={{...errors, ...validationErrors}} 
                />;
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

                        {/* Validation Summary */}
                        {Object.keys(validationErrors).length > 0 && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 bg-red-50 border border-red-200 rounded-md"
                            >
                                <h3 className="text-sm font-medium text-red-800 mb-1">
                                    Please correct the following errors before proceeding:
                                </h3>
                                <ul className="list-disc pl-5 text-xs text-red-700 space-y-1">
                                    {Object.values(validationErrors).map((error, index) => (
                                        <li key={index}>{error}</li>
                                    ))}
                                </ul>
                            </motion.div>
                        )}

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
                                    type="button"
                                    onClick={() => {
                                        if (validateStep(currentStep)) {
                                            handleSubmit(onSubmit)();
                                        }
                                    }}
                                    disabled={isLoading}
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