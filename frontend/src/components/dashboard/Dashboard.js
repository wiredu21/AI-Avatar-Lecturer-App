import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "./DashboardLayout";
import { userApi } from "../../utils/axios";
import { getUniversityName } from "../../utils/universityUtils";

export default function Dashboard() {
    const navigate = useNavigate();
    const [lastLogin, setLastLogin] = useState('');
    const [universityName, setUniversityName] = useState('University not set');
    
    console.log("[DEBUG] Dashboard - Component rendering");

    // Function to update university from localStorage
    const updateUniversityFromStorage = () => {
        const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
        setUniversityName(getUniversityName(userProfile.university));
    };

    useEffect(() => {
        // Check authentication and onboarding status from API
        const checkAuth = async () => {
            console.log("[DEBUG] Dashboard - checkAuth running", {
                authToken: localStorage.getItem('authToken'),
                sessionFlag: sessionStorage.getItem('justCompletedOnboarding'),
                hasCompleted: localStorage.getItem('hasCompletedOnboarding'),
                isFirstTime: localStorage.getItem('isFirstTimeLogin'),
                timestamp: new Date().toISOString()
            });
            
            const authToken = localStorage.getItem("authToken");
            
            if (!authToken) {
                console.log("Dashboard - Not authenticated, redirecting to login");
                navigate("/login");
                return;
            }
            
            // Check if user just completed onboarding
            const justCompletedOnboarding = sessionStorage.getItem("justCompletedOnboarding");
            if (justCompletedOnboarding === "true") {
                console.log("[DEBUG] Dashboard - Flag found, removing flag and continuing");
                sessionStorage.removeItem("justCompletedOnboarding");
                
                // Set last login time since we're skipping the rest of the function
                const now = new Date();
                const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                setLastLogin(`Today at ${formattedTime}`);
                return;
            }
            
            try {
                // Get onboarding status from API
                const onboardingStatus = await userApi.getOnboardingStatus();
                console.log("[DEBUG] Dashboard - API response:", {
                    rawResponse: onboardingStatus,
                    timestamp: new Date().toISOString()
                });
                
                // If user hasn't completed onboarding, redirect to about-you
                if (!onboardingStatus.has_completed_onboarding || onboardingStatus.is_first_time_login) {
                    console.log("Dashboard - User needs to complete onboarding, redirecting");
                    
                    // Update localStorage to match the backend
                    localStorage.setItem("hasCompletedOnboarding", onboardingStatus.has_completed_onboarding.toString());
                    localStorage.setItem("isFirstTimeLogin", onboardingStatus.is_first_time_login.toString());
                    
                    navigate("/about-you");
                    return;
                }
                
                // Get user profile
                const userProfileFromApi = await userApi.getUserProfile();
                if (userProfileFromApi) {
                    // If we have a profile in the database, use it
                    console.log("Dashboard - User profile from API:", userProfileFromApi);
                    localStorage.setItem("userProfile", JSON.stringify({
                        firstName: userProfileFromApi.first_name,
                        surname: userProfileFromApi.surname,
                        dateOfBirth: userProfileFromApi.date_of_birth,
                        gender: userProfileFromApi.gender,
                        nationality: userProfileFromApi.nationality,
                        university: userProfileFromApi.university,
                        course: userProfileFromApi.course,
                        courseYear: userProfileFromApi.course_year,
                        academicLevel: userProfileFromApi.academic_level,
                        avatar: userProfileFromApi.avatar,
                        voiceId: userProfileFromApi.voice_id,
                        email: userProfileFromApi.email
                    }));
                }
                
            } catch (error) {
                console.error("[DEBUG] Dashboard - API error:", error);
                
                // Fall back to localStorage if API call fails
                const isFirstTimeLogin = localStorage.getItem("isFirstTimeLogin") === "true";
                if (isFirstTimeLogin) {
                    navigate("/about-you");
                    return;
                }
            }
            
            // Set last login time for authenticated users
            const now = new Date();
            const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
            setLastLogin(`Today at ${formattedTime}`);
        };
        
        checkAuth();
    }, [navigate]);

    // Listen for changes to localStorage from other components
    useEffect(() => {
        // Initial load from localStorage
        updateUniversityFromStorage();
        
        // Function to handle storage events
        const handleStorageChange = (event) => {
            if (event.key === 'userProfile' && event.newValue) {
                console.log('[DEBUG] Dashboard - userProfile changed in localStorage, updating university...');
                updateUniversityFromStorage();
            }
        };
        
        // Add event listener
        window.addEventListener('storage', handleStorageChange);
        
        // Clean up on unmount
        return () => {
            window.removeEventListener('storage', handleStorageChange);
        };
    }, []);

    // Get user profile data from localStorage
    const userEmail = localStorage.getItem("userEmail");
    const userProfile = JSON.parse(localStorage.getItem("userProfile") || "{}");
    const userName = userProfile.firstName || userEmail?.split('@')[0] || 'User';
    
    // This is kept for compatibility but we use the state variable instead
    const university = getUniversityName(userProfile.university);
    
    // Map course values to labels
    const courses = {
        "computer-science": "Computer Science",
        "business": "Business Administration",
        "nursing": "Nursing",
        "education": "Education",
        "psychology": "Psychology",
        "mathematics": "Mathematics",
        "physics": "Physics",
        "engineering": "Engineering",
        "chemistry": "Chemistry",
        "economics": "Economics",
        "management": "Management", 
        "finance": "Finance",
        "accounting": "Accounting",
        "law": "Law"
    };
    
    // Map course year values to labels
    const courseYears = {
        "foundational": "Foundation Year",
        "year1": "Year 1",
        "year2": "Year 2",
        "year3": "Year 3",
        "year4": "Year 4",
        "year5": "Year 5+"
    };
    
    // Get user's course and course year
    const course = courses[userProfile.course] || "Course not set";
    const courseYear = courseYears[userProfile.courseYear] || "Year not set";

    return (
        <DashboardLayout>
            <div className="flex-1 p-6">
                {/* Header Section */}
                <div className="flex justify-between items-center mb-8">
                    <div className="space-y-1">
                        <h1 className="text-2xl font-bold text-teal-500">Welcome back, {userName}!</h1>
                        <p className="text-sm text-gray-500">{universityName} • {course} • {courseYear}</p>
                        <p className="text-xs text-gray-500">Last login: {lastLogin}</p>
                    </div>
                    <div className="flex items-center">
                        <button className="relative p-2 rounded-full hover:bg-gray-100">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
                            </svg>
                            <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
                        </button>
                    </div>
                </div>

                {/* Main Dashboard Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    {/* Learning Progress Tracker */}
                    <div className="bg-white p-6 rounded-lg border shadow-sm">
                        <div className="pb-2">
                            <h2 className="text-lg font-medium text-purple-600">Study Progress</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Object-Oriented Programming</span>
                                    <span className="font-medium">75%</span>
                                </div>
                                <div className="relative h-2 bg-gray-200 rounded-full">
                                    <div 
                                        className="absolute top-0 left-0 h-full bg-teal-500 rounded-full" 
                                        style={{ width: '75%' }}
                                    ></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Database Systems</span>
                                    <span className="font-medium">60%</span>
                                </div>
                                <div className="relative h-2 bg-gray-200 rounded-full">
                                    <div 
                                        className="absolute top-0 left-0 h-full bg-teal-500 rounded-full" 
                                        style={{ width: '60%' }}
                                    ></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>Web Development</span>
                                    <span className="font-medium">90%</span>
                                </div>
                                <div className="relative h-2 bg-gray-200 rounded-full">
                                    <div 
                                        className="absolute top-0 left-0 h-full bg-teal-500 rounded-full" 
                                        style={{ width: '90%' }}
                                    ></div>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <div className="flex justify-between text-sm">
                                    <span>AI Ethics</span>
                                    <span className="font-medium">45%</span>
                                </div>
                                <div className="relative h-2 bg-gray-200 rounded-full">
                                    <div 
                                        className="absolute top-0 left-0 h-full bg-teal-500 rounded-full" 
                                        style={{ width: '45%' }}
                                    ></div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Upcoming Deadlines */}
                    <div className="bg-white p-6 rounded-lg border shadow-sm">
                        <div className="pb-2">
                            <h2 className="text-lg font-medium text-purple-600">Upcoming Deadlines</h2>
                        </div>
                        <div className="space-y-4">
                            <div className="flex items-start gap-3 p-3 rounded-lg border border-red-200 bg-red-50">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-500 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                                    <line x1="12" y1="9" x2="12" y2="13"></line>
                                    <line x1="12" y1="17" x2="12.01" y2="17"></line>
                                </svg>
                                <div>
                                    <div className="flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                            <line x1="16" y1="2" x2="16" y2="6"></line>
                                            <line x1="8" y1="2" x2="8" y2="6"></line>
                                            <line x1="3" y1="10" x2="21" y2="10"></line>
                                        </svg>
                                        <span className="text-sm font-medium text-purple-600">Yesterday</span>
                                    </div>
                                    <p className="text-sm font-medium text-teal-500">Database Design Project</p>
                                    <p className="text-xs text-gray-500">Database Systems</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-lg border">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                            <line x1="16" y1="2" x2="16" y2="6"></line>
                                            <line x1="8" y1="2" x2="8" y2="6"></line>
                                            <line x1="3" y1="10" x2="21" y2="10"></line>
                                        </svg>
                                        <span className="text-sm font-medium text-purple-600">In 2 days</span>
                                    </div>
                                    <p className="text-sm font-medium text-teal-500">AI Ethics Essay</p>
                                    <p className="text-xs text-gray-500">Computer Science</p>
                                </div>
                            </div>
                            <div className="flex items-start gap-3 p-3 rounded-lg border">
                                <div>
                                    <div className="flex items-center gap-2">
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                                            <line x1="16" y1="2" x2="16" y2="6"></line>
                                            <line x1="8" y1="2" x2="8" y2="6"></line>
                                            <line x1="3" y1="10" x2="21" y2="10"></line>
                                        </svg>
                                        <span className="text-sm font-medium text-purple-600">In 5 days</span>
                                    </div>
                                    <p className="text-sm font-medium text-teal-500">OOP Assignment 3</p>
                                    <p className="text-xs text-gray-500">Object-Oriented Programming</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Saved Materials */}
                    <div className="bg-white p-6 rounded-lg border shadow-sm">
                        <div className="pb-2">
                            <h2 className="text-lg font-medium text-purple-600">Saved Materials</h2>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div className="p-3 border rounded-lg hover:bg-teal-50 transition-colors cursor-pointer">
                                <div className="flex items-center justify-center w-10 h-10 bg-teal-100 rounded-lg mb-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                        <polyline points="14 2 14 8 20 8"></polyline>
                                        <line x1="16" y1="13" x2="8" y2="13"></line>
                                        <line x1="16" y1="17" x2="8" y2="17"></line>
                                        <polyline points="10 9 9 9 8 9"></polyline>
                                    </svg>
                                </div>
                                <p className="text-sm font-medium truncate">Lecture 1 Notes.pdf</p>
                                <p className="text-xs text-gray-500">2 days ago</p>
                            </div>
                            <div className="p-3 border rounded-lg hover:bg-teal-50 transition-colors cursor-pointer">
                                <div className="flex items-center justify-center w-10 h-10 bg-teal-100 rounded-lg mb-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                        <polyline points="14 2 14 8 20 8"></polyline>
                                        <line x1="16" y1="13" x2="8" y2="13"></line>
                                        <line x1="16" y1="17" x2="8" y2="17"></line>
                                        <polyline points="10 9 9 9 8 9"></polyline>
                                    </svg>
                                </div>
                                <p className="text-sm font-medium truncate">OOP Principles.pdf</p>
                                <p className="text-xs text-gray-500">3 days ago</p>
                            </div>
                            <div className="p-3 border rounded-lg hover:bg-teal-50 transition-colors cursor-pointer">
                                <div className="flex items-center justify-center w-10 h-10 bg-teal-100 rounded-lg mb-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"></path>
                                    </svg>
                                </div>
                                <p className="text-sm font-medium truncate">Tutorial Code.zip</p>
                                <p className="text-xs text-gray-500">1 week ago</p>
                            </div>
                            <div className="p-3 border rounded-lg hover:bg-teal-50 transition-colors cursor-pointer">
                                <div className="flex items-center justify-center w-10 h-10 bg-teal-100 rounded-lg mb-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-teal-500" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                                        <polyline points="14 2 14 8 20 8"></polyline>
                                        <line x1="16" y1="13" x2="8" y2="13"></line>
                                        <line x1="16" y1="17" x2="8" y2="17"></line>
                                        <polyline points="10 9 9 9 8 9"></polyline>
                                    </svg>
                                </div>
                                <p className="text-sm font-medium truncate">SQL Query Examples.pdf</p>
                                <p className="text-xs text-gray-500">1 week ago</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Learning Insights */}
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <div className="pb-2">
                        <h2 className="text-lg font-medium text-purple-600">Learning Insights</h2>
                        <p className="text-sm text-gray-500">Your learning patterns and progress</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                        <div>
                            <h3 className="text-sm font-medium mb-2">Weekly Study Hours</h3>
                            <div className="h-[250px] bg-gray-50 rounded-lg p-4 flex items-end justify-between">
                                {/* Simple bar chart representation */}
                                <div className="flex-1 flex items-end justify-around h-full">
                                    {[2, 3, 1, 4, 2, 5, 3].map((hours, index) => (
                                        <div key={index} className="flex flex-col items-center">
                                            <div 
                                                className="w-8 bg-teal-500 rounded-t-sm" 
                                                style={{ height: `${hours * 40}px` }}
                                            ></div>
                                            <span className="text-xs mt-2">
                                                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'][index]}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div>
                            <h3 className="text-sm font-medium mb-2">Topic Mastery</h3>
                            <div className="h-[250px] bg-gray-50 rounded-lg p-4 flex justify-center items-center">
                                {/* Simple representation of pie chart */}
                                <div className="relative w-40 h-40">
                                    <div className="absolute inset-0 rounded-full bg-teal-500"></div>
                                    <div className="absolute inset-0 rounded-full bg-purple-600" 
                                        style={{ clipPath: 'polygon(50% 50%, 100% 0, 100% 100%)' }}></div>
                                    <div className="absolute inset-0 rounded-full bg-blue-500" 
                                        style={{ clipPath: 'polygon(50% 50%, 100% 100%, 0 100%, 0 70%)' }}></div>
                                    <div className="absolute inset-0 rounded-full bg-purple-400" 
                                        style={{ clipPath: 'polygon(50% 50%, 0 70%, 0 0, 30% 0)' }}></div>
                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-24 h-24 rounded-full bg-white"></div>
                                    </div>
                                </div>
                                <div className="ml-4 space-y-2">
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 bg-teal-500 rounded-full mr-2"></div>
                                        <span className="text-xs">OOP (40%)</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 bg-purple-600 rounded-full mr-2"></div>
                                        <span className="text-xs">Databases (30%)</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                                        <span className="text-xs">Web Dev (20%)</span>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-3 h-3 bg-purple-400 rounded-full mr-2"></div>
                                        <span className="text-xs">AI Ethics (10%)</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    );
}
