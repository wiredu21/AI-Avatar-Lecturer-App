import React, { useState } from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "../ui/button";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import LoginAvatar from "./LoginAvatar";
import iconImage from "../../assets/images/icon.png";
import api from "../../utils/axios";

export default function LoginPage() {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [loginError, setLoginError] = useState("");
    const navigate = useNavigate();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm();

    const onSubmit = async (data) => {
        setIsLoading(true);
        setLoginError("");
        
        try {
            // Check if we have stored credentials for demo purposes
            const storedCredentialsJSON = localStorage.getItem("userCredentials");
            
            if (storedCredentialsJSON) {
                // Parse stored credentials
                const storedCredentials = JSON.parse(storedCredentialsJSON);
                
                // Check if this is the same email
                if (storedCredentials.email === data.email) {
                    // Verify password matches
                    if (storedCredentials.password === data.password) {
                        console.log("Login successful using stored credentials");
                        
                        // Set authentication state
                        localStorage.setItem("isLoggedIn", "true");
                        localStorage.setItem("userEmail", data.email);
                        
                        // Need to actually authenticate with the backend to get a real token
                        // Will continue to API login below instead of using demo auth
                    } else {
                        // Password doesn't match - continue to normal login flow
                        console.log("Stored password doesn't match, trying API login");
                    }
                }
            }
            
            // Normal login flow with API
            // Get CSRF token first
            await api.get('/api/auth/csrf/');
            
            // Make actual login API call with withCredentials explicitly set
            const response = await api.post('/api/auth/login/', {
                username: data.email.split('@')[0], // Use email username as the username
                password: data.password
            }, {
                withCredentials: true // Ensure cookies are included
            });
            
            // Store user info and authentication data
            if (response.data) {
                console.log("Login response:", response.data);
                
                // Set authentication state
                localStorage.setItem("isLoggedIn", "true");
                localStorage.setItem("userEmail", data.email);
                
                // Store the tokens from response - prioritize JWT tokens
                if (response.data.token) {
                    localStorage.setItem("authToken", response.data.token);
                    console.log("JWT access token stored");
                
                    // Also store refresh token if available
                    if (response.data.refresh) {
                        localStorage.setItem("refreshToken", response.data.refresh);
                        console.log("JWT refresh token stored");
                    }
                } else if (response.data.key) {
                    // Fallback for legacy token format
                    localStorage.setItem("authToken", response.data.key);
                    console.log("Auth token stored from response (key)");
                } else {
                    // If no token in response, authentication is incomplete
                    console.log("No token in response. Authentication may be incomplete.");
                    // Display warning to user
                    setLoginError("Authentication partially complete. Some features may not work correctly.");
                }
                
                // Get onboarding status from login response
                const { has_completed_onboarding, is_first_time_login } = response.data.onboarding_status;
                
                // Store flags in localStorage for easy access in components
                localStorage.setItem("hasCompletedOnboarding", has_completed_onboarding.toString());
                localStorage.setItem("isFirstTimeLogin", is_first_time_login.toString());
                
                console.log("Login successful", response.data);
                
                // Also store the credentials for our password change feature
                const credentials = {
                    email: data.email,
                    password: data.password,
                    lastUpdated: new Date().toISOString()
                };
                localStorage.setItem("userCredentials", JSON.stringify(credentials));
                
                // Redirect based on onboarding status
                if (is_first_time_login || !has_completed_onboarding) {
                    // First-time users go to onboarding
                    navigate("/about-you");
                } else {
                    // Returning users go directly to dashboard
                    navigate("/dashboard");
                }
            }
        } catch (error) {
            console.error("Login error:", error);
            const errorMsg = error.response?.data?.detail || 
                            error.response?.data?.message ||
                            error.response?.data?.non_field_errors?.[0] ||
                            "An error occurred during login. Please try again.";
            setLoginError(errorMsg);
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
                            className="absolute -top-20 left-1/2 -translate-x-[65%] bg-white/90 backdrop-blur-sm rounded-lg p-4 shadow-lg max-w-[280px] z-10"
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
                            <p className="text-gray-900 text-center">Welcome back! Let's continue learning.</p>
                            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 translate-y-1/2 w-4 h-4 bg-white/90 rotate-45"></div>
                        </motion.div>
                        <LoginAvatar />
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
                        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-purple-600">
                            Sign In to Your Account
                        </h1>
                    </div>

                    {/* Login Form */}
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        {/* Email Field */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="Enter your university email"
                                className={`${errors.email || loginError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                {...register("email", {
                                    required: "Email is required",
                                    pattern: {
                                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                        message: "Invalid email address",
                                    },
                                })}
                            />
                            {errors.email && <p className="text-sm text-red-500">{errors.email.message}</p>}
                        </div>

                        {/* Password Field */}
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Password"
                                    className={`${errors.password || loginError ? "border-red-500 focus-visible:ring-red-500" : ""}`}
                                    {...register("password", {
                                        required: "Password is required",
                                        minLength: {
                                            value: 6,
                                            message: "Password must be at least 6 characters",
                                        },
                                    })}
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
                            {errors.password && <p className="text-sm text-red-500">{errors.password.message}</p>}
                        </div>

                        {/* Login Error Message */}
                        {loginError && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="p-3 bg-red-50 border border-red-200 rounded-md"
                            >
                                <p className="text-sm text-red-500">{loginError}</p>
                            </motion.div>
                        )}

                        {/* Additional Options */}
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <Checkbox id="rememberMe" {...register("rememberMe")} />
                                <Label htmlFor="rememberMe" className="text-sm cursor-pointer">
                                    Remember Me
                                </Label>
                            </div>
                            <button type="button" className="text-sm text-teal-500 hover:text-teal-600">
                                Forgot Password?
                            </button>
                        </div>

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
                                    Signing In...
                                </>
                            ) : (
                                "Sign In"
                            )}
                        </Button>

                        {/* Sign Up Link */}
                        <p className="text-center text-sm">
                            Don't have an account?{" "}
                            <Link to="/signup" className="text-teal-500 hover:text-teal-600 font-medium">
                                Sign Up
                            </Link>
                        </p>
                    </form>
                </motion.div>
            </div>
        </div>
    );
} 