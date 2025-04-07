import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { Check, X, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

const VerifyEmail = () => {
    const { uidb64, token } = useParams();
    const [verificationStatus, setVerificationStatus] = useState("loading"); // loading, success, error
    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    useEffect(() => {
        const verifyEmail = async () => {
            try {
                const response = await axios.get(
                    `/api/auth/verify-email/${uidb64}/${token}/`
                );
                
                setVerificationStatus("success");
                setMessage(response.data.message || "Email verified successfully!");
                
                // Save user data to localStorage
                if (response.data.user) {
                    localStorage.setItem("user", JSON.stringify(response.data.user));
                    localStorage.setItem("isLoggedIn", "true");
                }
                
                // Redirect to dashboard after a delay
                setTimeout(() => {
                    navigate("/dashboard");
                }, 3000);
                
            } catch (error) {
                setVerificationStatus("error");
                setMessage(
                    error.response?.data?.message || 
                    "Failed to verify your email. The link may be invalid or expired."
                );
            }
        };

        verifyEmail();
    }, [uidb64, token, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full text-center"
            >
                {verificationStatus === "loading" && (
                    <div className="flex flex-col items-center space-y-4">
                        <div className="rounded-full bg-blue-100 p-6">
                            <Loader2 className="h-12 w-12 text-blue-600 animate-spin" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Verifying Your Email</h2>
                        <p className="text-gray-600">Please wait while we verify your email address...</p>
                    </div>
                )}

                {verificationStatus === "success" && (
                    <div className="flex flex-col items-center space-y-4">
                        <div className="rounded-full bg-green-100 p-6">
                            <Check className="h-12 w-12 text-green-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Email Verified!</h2>
                        <p className="text-gray-600">{message}</p>
                        <p className="text-gray-500 text-sm">
                            Redirecting you to the dashboard...
                        </p>
                    </div>
                )}

                {verificationStatus === "error" && (
                    <div className="flex flex-col items-center space-y-4">
                        <div className="rounded-full bg-red-100 p-6">
                            <X className="h-12 w-12 text-red-600" />
                        </div>
                        <h2 className="text-2xl font-bold text-gray-800">Verification Failed</h2>
                        <p className="text-gray-600">{message}</p>
                        <div className="pt-4">
                            <button
                                onClick={() => navigate("/login")}
                                className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                            >
                                Go to Login
                            </button>
                        </div>
                    </div>
                )}
            </motion.div>
        </div>
    );
};

export default VerifyEmail; 