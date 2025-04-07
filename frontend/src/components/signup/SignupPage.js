import React, { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "../ui/dialog";
import SignupAvatar from "./SignupAvatar";
import iconImage from "../../assets/images/icon.png";
import api from "../../utils/axios";

export default function SignupPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm();

    const password = watch("password");

    const checkPasswordStrength = (password) => {
        let strength = 0;
        if (password.length >= 8) strength += 1;
        if (/[A-Z]/.test(password)) strength += 1;
        if (/[0-9]/.test(password)) strength += 1;
        if (/[^A-Za-z0-9]/.test(password)) strength += 1;
        setPasswordStrength(strength);
    };

    const getStrengthText = () => {
        if (passwordStrength === 0) return "";
        if (passwordStrength === 1) return "Weak";
        if (passwordStrength === 2) return "Medium";
        if (passwordStrength >= 3) return "Strong";
    };

    const getStrengthColor = () => {
        if (passwordStrength === 1) return "bg-red-500";
        if (passwordStrength === 2) return "bg-yellow-500";
        if (passwordStrength >= 3) return "bg-green-500";
        return "bg-gray-200";
    };

    const onSubmit = async (data) => {
        setIsLoading(true);
        setErrorMessage("");

        try {
            console.log('Attempting to submit form data:', data);
            // Send registration request to API
            const response = await api.post('/api/auth/register/', {
                username: data.email.split('@')[0], // generate username from email
                email: data.email,
                password: data.password,
                consent_given: data.gdprConsent
            });

            console.log('Registration API response:', response);
            // Show success modal
            setShowSuccessModal(true);
            
            // Log successful registration
            console.log('Registration successful:', response.data);
        } catch (error) {
            // Handle API errors
            console.error('Registration error:', error);
            const errorMsg = error.response?.data?.email?.[0] || 
                           error.response?.data?.username?.[0] ||
                           error.response?.data?.message ||
                           error.response?.data?.detail ||
                           'Registration failed. Please try again later.';
            
            setErrorMessage(errorMsg);
            console.error('Registration error details:', error.response?.data);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col md:flex-row relative">
            {/* Back to Home Link */}
            <Link
                to="/"
                className="absolute top-6 left-6 flex items-center text-white hover:text-teal-300 transition-colors z-10"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4">
                    <path d="m12 19-7-7 7-7" />
                    <path d="M19 12H5" />
                </svg>
                <span>Back to Home</span>
            </Link>

            {/* Visual Side (left) - Hidden on mobile */}
            <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-teal-400 to-purple-600 relative overflow-hidden">
                <div className="absolute inset-0 bg-circuit-pattern opacity-10"></div>
                <div className="flex items-center justify-center w-full h-full">
                    <div className="relative">
                        <motion.div
                            className="absolute -top-14 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-[280px] z-10"
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
                            <p className="text-gray-900 text-center">Let's get started!</p>
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-4 h-4 bg-white/90 rotate-45"></div>
                        </motion.div>
                        <SignupAvatar />
                    </div>
                </div>
            </div>

            {/* Form Side (right) */}
            <div className="w-full md:w-1/2 flex items-center justify-center p-4 md:p-8 bg-gray-50">
                <motion.div
                    className="w-full max-w-md p-8 bg-white rounded-lg shadow-lg"
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
                            Create Your VirtuAId Account
                        </h1>
                    </div>

                    {/* Form fields */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 text-center">
                        {/* Email Field */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="text-center block">
                                University Email
                            </Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="name@university.ac.uk"
                                {...register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Please use your university email",
                                    },
                                })}
                                className={`text-center ${errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                            />
                            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <Label htmlFor="password" className="text-center block">
                                Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Create a strong password"
                                    {...register("password", {
                                        required: "Password is required",
                                        minLength: {
                                            value: 8,
                                            message: "Password must be at least 8 characters",
                                        },
                                    })}
                                    className={`text-center ${errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                    onChange={(e) => checkPasswordStrength(e.target.value)}
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    onClick={() => setShowPassword(!showPassword)}
                                >
                                    {showPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                                            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                                            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                                            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                                            <line x1="2" x2="22" y1="2" y2="22" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {password && (
                                <div className="space-y-2">
                                    <div className="flex gap-2 h-1">
                                        {[...Array(4)].map((_, i) => (
                                            <div
                                                key={i}
                                                className={`h-full w-full rounded-full ${i < passwordStrength ? getStrengthColor() : "bg-gray-200"
                                                    }`}
                                            />
                                        ))}
                                    </div>
                                    <p className="text-sm text-gray-600">Password strength: {getStrengthText()}</p>
                                </div>
                            )}
                            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                        </div>

                        {/* Confirm Password Field */}
                        <div className="space-y-2">
                            <Label htmlFor="confirmPassword" className="text-center block">
                                Confirm Password
                            </Label>
                            <div className="relative">
                                <Input
                                    id="confirmPassword"
                                    type={showConfirmPassword ? "text" : "password"}
                                    placeholder="Confirm your password"
                                    {...register("confirmPassword", {
                                        validate: (value) => value === password || "The passwords do not match",
                                    })}
                                    className={`text-center ${errors.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                />
                                <button
                                    type="button"
                                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                >
                                    {showConfirmPassword ? (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                                            <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                                            <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                                            <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61" />
                                            <line x1="2" x2="22" y1="2" y2="22" />
                                        </svg>
                                    ) : (
                                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                                            <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                            {errors.confirmPassword && <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>}
                        </div>

                        {/* GDPR Consent */}
                        <div className="flex items-start space-x-2">
                            <Checkbox
                                id="gdprConsent"
                                {...register("gdprConsent", {
                                    required: "You must accept the terms and privacy policy",
                                })}
                            />
                            <Label htmlFor="gdprConsent" className="text-sm leading-tight">
                                I agree to the{" "}
                                <Link to="/terms" className="text-teal-500 underline hover:text-teal-600">
                                    Terms of Service
                                </Link>{" "}
                                and{" "}
                                <Link to="/privacy" className="text-teal-500 underline hover:text-teal-600">
                                    Privacy Policy
                                </Link>
                            </Label>
                        </div>
                        {errors.gdprConsent && <p className="text-sm text-red-500">{errors.gdprConsent.message}</p>}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            className="w-full bg-gradient-to-r from-teal-400 to-purple-600 hover:from-teal-500 hover:to-purple-700"
                            disabled={isLoading}
                        >
                            {isLoading ? (
                                <>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2 h-4 w-4 animate-spin">
                                        <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                                    </svg>
                                    Creating Account...
                                </>
                            ) : (
                                "Create Account"
                            )}
                        </Button>

                        {/* Login Link */}
                        <p className="text-center text-sm">
                            Already have an account?{" "}
                            <Link to="/login" className="text-teal-500 hover:text-teal-600 font-medium">
                                Sign In
                            </Link>
                        </p>
                    </form>
                </motion.div>
            </div>

            {/* Success Modal */}
            <Dialog open={showSuccessModal} onClose={() => setShowSuccessModal(false)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Account Created Successfully!</DialogTitle>
                        <DialogDescription>
                            Your VirtuAId account has been created. Please check your email to verify your account. 
                            The verification link will expire in 24 hours.
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
                            onClick={() => {
                                setShowSuccessModal(false);
                                window.location.href = "/login";
                            }}
                            className="bg-gradient-to-r from-teal-400 to-purple-600 hover:from-teal-500 hover:to-purple-700"
                        >
                            Go to Login
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
} 