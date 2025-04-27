import React, { useState, useEffect } from "react";
import DashboardLayout from "./DashboardLayout";
import { 
  Card, 
  CardHeader, 
  CardContent, 
  CardTitle, 
  CardDescription 
} from "../ui/card";
import { 
  Tabs, 
  TabsList, 
  TabsTrigger, 
  TabsContent 
} from "../ui/tabs";
import { Switch } from "../ui/switch";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";
import { motion, AnimatePresence } from "framer-motion";
import VoiceSelector from "../VoiceSelector";
import { AlertCircle, CheckCircle2, Loader2, X } from "lucide-react";
// Import API utilities
import { userApi } from "../../utils/axios";

// Import avatar images
import AvatarOption1 from "../../assets/images/AvatarOption1.png";
import AvatarOption2 from "../../assets/images/AvatarOption2.png";
import AvatarOption3 from "../../assets/images/AvatarOption3.png";
import AvatarOption4 from "../../assets/images/AvatarOption4.png";
import AvatarOption5 from "../../assets/images/AvatarOption5.png";
import AvatarOption6 from "../../assets/images/AvatarOption6.png";
import AvatarOption7 from "../../assets/images/AvatarOption7.png";
import AvatarOption8 from "../../assets/images/AvatarOption8.png";

// Toast Notification Component
const Toast = ({ message, type, onClose }) => {
  return (
    <motion.div 
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`fixed top-4 right-4 z-50 flex items-center p-4 mb-4 rounded-lg shadow-lg ${
        type === 'success' ? 'bg-green-50 text-green-800 border border-green-200' :
        type === 'error' ? 'bg-red-50 text-red-800 border border-red-200' :
        'bg-blue-50 text-blue-800 border border-blue-200'
      }`}
    >
      {type === 'success' && <CheckCircle2 className="w-5 h-5 mr-2 text-green-500" />}
      {type === 'error' && <AlertCircle className="w-5 h-5 mr-2 text-red-500" />}
      <span className="font-medium">{message}</span>
      <button 
        type="button" 
        className="ml-4 text-gray-400 hover:text-gray-900"
        onClick={onClose}
      >
        <X className="w-4 h-4" />
      </button>
    </motion.div>
  );
};

// University ID to string value mapping
const UNIVERSITY_MAPPING = {
  // Map numeric IDs to string codes
  ids: {
    1: "northampton",
    2: "oxford",
    3: "cambridge",
    4: "imperial",
    5: "ucl",
    6: "lse",
    7: "edinburgh",
    8: "manchester",
    9: "bristol",
    10: "glasgow",
    11: "warwick"
  },
  // Map string codes to numeric IDs
  names: {
    "northampton": 1,
    "oxford": 2,
    "cambridge": 3, 
    "imperial": 4,
    "ucl": 5,
    "lse": 6,
    "edinburgh": 7,
    "manchester": 8,
    "bristol": 9,
    "glasgow": 10,
    "warwick": 11
  },
  // Helper to convert API ID to dropdown value
  idToString: function(id) {
    return this.ids[id] || "northampton"; // Default to northampton if not found
  },
  // Helper to convert dropdown value to API ID
  stringToId: function(str) {
    return this.names[str] || 1; // Default to ID 1 if not found
  }
};

// Avatar data - moved outside component to prevent recreation on each render
const AVATARS = [
  { id: 1, src: AvatarOption1, alt: "Professional male lecturer", gender: "male" },
  { id: 2, src: AvatarOption2, alt: "Professional female lecturer", gender: "female" },
  { id: 3, src: AvatarOption3, alt: "Casual male lecturer", gender: "male" },
  { id: 4, src: AvatarOption4, alt: "Casual female lecturer", gender: "female" },
  { id: 5, src: AvatarOption5, alt: "Young male lecturer", gender: "male" },
  { id: 6, src: AvatarOption6, alt: "Young female lecturer", gender: "female" },
  { id: 7, src: AvatarOption7, alt: "Senior male lecturer", gender: "male" },
  { id: 8, src: AvatarOption8, alt: "Senior female lecturer", gender: "female" },
];

const Settings = () => {
  // Avatar and voice states
  const [selectedAvatar, setSelectedAvatar] = useState(1);
  const [selectedVoice, setSelectedVoice] = useState("");
  const [voiceGender, setVoiceGender] = useState('female');
  
  // Profile states
  const [firstName, setFirstName] = useState("");
  const [surname, setSurname] = useState("");
  const [dateOfBirth, setDateOfBirth] = useState("");
  const [gender, setGender] = useState("");
  const [nationality, setNationality] = useState("");
  const [academicLevel, setAcademicLevel] = useState("");
  const [courseYear, setCourseYear] = useState("");
  const [university, setUniversity] = useState("");
  const [course, setCourse] = useState("");
  const [email, setEmail] = useState("");
  
  // Password change states
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [isPasswordChanging, setIsPasswordChanging] = useState(false);
  
  // UI states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [dataRequestSent, setDataRequestSent] = useState(false);
  const [showDataLog, setShowDataLog] = useState(false);
  const [profileSaved, setProfileSaved] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  
  // Toast notification state
  const [toast, setToast] = useState(null);

  // Show toast message
  const showToast = (message, type = 'success') => {
    setToast({ message, type });
    
    // Auto close after 3 seconds
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  // Close toast manually
  const closeToast = () => {
    setToast(null);
  };

  // Load saved settings on component mount
  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        // First try to get profile from API
        const apiProfile = await userApi.getUserProfile();
        
        if (apiProfile) {
          console.log("Loaded profile from API:", apiProfile);
          
          // Set avatar and voice settings
          if (apiProfile.avatar) {
            const avatarId = parseInt(apiProfile.avatar);
            setSelectedAvatar(avatarId);
            
            // Set voice gender based on the selected avatar
            const selectedAvatarData = AVATARS.find(avatar => avatar.id === avatarId);
            if (selectedAvatarData) {
              setVoiceGender(selectedAvatarData.gender);
            }
          }
          if (apiProfile.voice_id) {
            setSelectedVoice(apiProfile.voice_id);
          }
          
          // Set profile information from API
          setFirstName(apiProfile.first_name || "");
          setSurname(apiProfile.surname || "");
          setDateOfBirth(apiProfile.date_of_birth || "");
          setGender(apiProfile.gender || "");
          setNationality(apiProfile.nationality || "");
          setAcademicLevel(apiProfile.academic_level || "");
          setCourseYear(apiProfile.course_year || "");
          
          // Handle university - could be an ID or object
          if (apiProfile.university) {
            let universityId;
            
            // Check if university is an object or direct ID
            if (typeof apiProfile.university === 'object' && apiProfile.university.id) {
              universityId = apiProfile.university.id;
            } else if (!isNaN(parseInt(apiProfile.university))) {
              universityId = parseInt(apiProfile.university);
            }
            
            // Convert the ID to the corresponding string value for the dropdown
            if (universityId) {
              const universityString = UNIVERSITY_MAPPING.idToString(universityId);
              console.log(`Converting university ID ${universityId} to string value: ${universityString}`);
              setUniversity(universityString);
            } else {
              // Fallback if we can't determine the ID
              setUniversity(typeof apiProfile.university === 'string' ? apiProfile.university : "northampton");
            }
          }
          
          setCourse(apiProfile.course || "");
          
          // Set default email based on name and university
          if (apiProfile.first_name && apiProfile.surname) {
            const emailPrefix = `${apiProfile.first_name.toLowerCase()}.${apiProfile.surname.toLowerCase()}`;
            const universityDomain = typeof apiProfile.university === 'object' 
              ? apiProfile.university.name 
              : apiProfile.university;
            setEmail(`${emailPrefix}@student.${universityDomain}.ac.uk`);
          }
          
          return; // Exit early if we loaded from API successfully
        }
      } catch (error) {
        console.error("Error loading profile from API:", error);
        showToast("Could not load profile from server. Using local data instead.", "error");
      }
      
      // Fall back to localStorage if API fetch fails
      try {
        console.log("Falling back to localStorage for profile data");
        const userProfile = JSON.parse(localStorage.getItem("userProfile"));
        if (userProfile) {
          // Avatar and voice settings
          if (userProfile.avatar) {
            const avatarId = parseInt(userProfile.avatar);
            setSelectedAvatar(avatarId);
            
            // Set voice gender based on the selected avatar
            const selectedAvatarData = AVATARS.find(avatar => avatar.id === avatarId);
            if (selectedAvatarData) {
              setVoiceGender(selectedAvatarData.gender);
            }
          }
          if (userProfile.voiceId) {
            setSelectedVoice(userProfile.voiceId);
          }
          
          // Profile information
          if (userProfile.firstName) setFirstName(userProfile.firstName);
          if (userProfile.surname) setSurname(userProfile.surname);
          if (userProfile.dateOfBirth) setDateOfBirth(userProfile.dateOfBirth);
          if (userProfile.gender) setGender(userProfile.gender);
          if (userProfile.nationality) setNationality(userProfile.nationality);
          if (userProfile.academicLevel) setAcademicLevel(userProfile.academicLevel);
          if (userProfile.courseYear) setCourseYear(userProfile.courseYear);
          if (userProfile.university) setUniversity(userProfile.university);
          if (userProfile.course) setCourse(userProfile.course);
          
          // Set a default email based on name and university
          if (userProfile.firstName && userProfile.surname && userProfile.university) {
            const emailPrefix = `${userProfile.firstName.toLowerCase()}.${userProfile.surname.toLowerCase()}`;
            setEmail(`${emailPrefix}@student.${userProfile.university}.ac.uk`);
          }
        }
      } catch (error) {
        console.error("Error loading saved settings from localStorage:", error);
        showToast("Could not load profile data.", "error");
      }
    };

    fetchProfileData();
  }, []);
  
  // Save profile information
  const saveProfileInfo = async () => {
    setProfileSaved(false);
    
    try {
      // Convert university string to ID for API
      const universityId = UNIVERSITY_MAPPING.stringToId(university);
      console.log(`Converting university string "${university}" to ID: ${universityId}`);
      
      // Prepare data for API in the format the backend expects
      const profileData = {
        first_name: firstName,
        surname: surname,
        date_of_birth: dateOfBirth,
        gender: gender,
        nationality: nationality,
        university: universityId, // Use university ID instead of string value
        course: course,
        course_year: courseYear,
        academic_level: academicLevel,
        avatar: selectedAvatar,
        voice_id: selectedVoice
      };
      
      console.log("Saving profile to API:", profileData);
      
      // Create localStorage format for consistent storage
      const localStorageProfile = {
        firstName: firstName,
        surname: surname,
        dateOfBirth: dateOfBirth,
        gender: gender,
        nationality: nationality,
        academicLevel: academicLevel,
        courseYear: courseYear,
        university: university, // Store string value in localStorage
        course: course,
        avatar: selectedAvatar,
        voiceId: selectedVoice
      };
      
      // Try to save to API first
      try {
        const response = await userApi.saveUserProfile(profileData);
        console.log("Profile saved to API:", response);
        
        // Verify API success by checking response data
        if (!response || !response.profile) {
          throw new Error("API returned an invalid response");
        }
        
        // Show success message via toast
        showToast("Profile updated successfully!", "success");
        
        // Also save to localStorage and dispatch event for successful API calls
        localStorage.setItem("userProfile", JSON.stringify(localStorageProfile));
        
        // Manually dispatch a storage event to notify other components
        const storageEvent = new StorageEvent('storage', {
          key: 'userProfile',
          newValue: JSON.stringify(localStorageProfile),
          oldValue: localStorage.getItem('userProfile'),
          storageArea: localStorage,
          url: window.location.href
        });
        window.dispatchEvent(storageEvent);
        
        // Refresh profile data from API to ensure everything is in sync
        try {
          const refreshedProfile = await userApi.getUserProfile();
          if (refreshedProfile) {
            console.log("Refreshed profile data from API:", refreshedProfile);

            // Update component state with refreshed data
            if (refreshedProfile.avatar) {
              setSelectedAvatar(parseInt(refreshedProfile.avatar));
            }
            if (refreshedProfile.voice_id) {
              setSelectedVoice(refreshedProfile.voice_id);
            }
            
            setFirstName(refreshedProfile.first_name || firstName);
            setSurname(refreshedProfile.surname || surname);
            setDateOfBirth(refreshedProfile.date_of_birth || dateOfBirth);
            setGender(refreshedProfile.gender || gender);
            setNationality(refreshedProfile.nationality || nationality);
            setAcademicLevel(refreshedProfile.academic_level || academicLevel);
            setCourseYear(refreshedProfile.course_year || courseYear);
            setCourse(refreshedProfile.course || course);
            
            // Handle university ID conversion
            if (refreshedProfile.university) {
              let universityId;
              
              // Determine university ID from response
              if (typeof refreshedProfile.university === 'object' && refreshedProfile.university.id) {
                universityId = refreshedProfile.university.id;
              } else if (!isNaN(parseInt(refreshedProfile.university))) {
                universityId = parseInt(refreshedProfile.university);
              }
              
              // Convert ID to string value
              if (universityId) {
                const universityString = UNIVERSITY_MAPPING.idToString(universityId);
                console.log(`Refresh: Converting university ID ${universityId} to string value: ${universityString}`);
                setUniversity(universityString);
              }
            }
          }
        } catch (refreshError) {
          console.warn("Failed to refresh profile data after save:", refreshError);
          // Non-critical error, don't show to user as the save was successful
        }
      } catch (apiError) {
        console.error("Failed to save profile to API:", apiError);
        
        // Extract specific error messages from API response if available
        let errorMessage = "Failed to save profile to server. Saving locally only.";
        if (apiError.response?.data) {
          const responseData = apiError.response.data;
          if (typeof responseData === 'object') {
            // Find the first error message in the response
            const firstErrorField = Object.keys(responseData)[0];
            if (firstErrorField && responseData[firstErrorField]) {
              const fieldError = Array.isArray(responseData[firstErrorField]) 
                ? responseData[firstErrorField][0] 
                : responseData[firstErrorField];
              errorMessage = `${firstErrorField}: ${fieldError}`;
            }
          } else if (typeof responseData === 'string') {
            errorMessage = responseData;
          }
        }
        
        showToast(errorMessage, "error");
      
        // Fall back to localStorage if API fails
        localStorage.setItem("userProfile", JSON.stringify(localStorageProfile));
        
        // Manually dispatch a storage event to notify other components
        const storageEvent = new StorageEvent('storage', {
          key: 'userProfile',
          newValue: JSON.stringify(localStorageProfile),
          oldValue: localStorage.getItem('userProfile'),
          storageArea: localStorage,
          url: window.location.href
        });
        window.dispatchEvent(storageEvent);
      }
      
      // Set success state
      setProfileSaved(true);
      setTimeout(() => setProfileSaved(false), 3000);
    } catch (error) {
      console.error("Error saving profile information:", error);
      showToast("Failed to save profile information. Please try again.", "error");
    }
  };

  // Update voice gender when avatar changes
  const handleAvatarChange = (id) => {
    setSelectedAvatar(id);
    const selectedAvatarData = AVATARS.find(avatar => avatar.id === id);
    if (selectedAvatarData) {
      // Set initial voice gender based on avatar, but don't enforce it
      // and don't reset the voice if already selected
      if (!selectedVoice) {
        setVoiceGender(selectedAvatarData.gender);
      }
      // We no longer reset the voice when gender changes
    }
  };

  // Save avatar settings
  const saveAvatarSettings = async () => {
    try {
      // First get current profile data to ensure we have all fields
      let profileData;
      
      try {
        // Try to get current profile from API
        const currentProfile = await userApi.getUserProfile();
        
        if (currentProfile) {
          // Convert university value if present
          let universityValue = currentProfile.university;
          
          // Determine if we need to convert the university value
          if (currentProfile.university) {
            if (typeof currentProfile.university === 'object' && currentProfile.university.id) {
              // Already have the ID in the object
              universityValue = currentProfile.university.id;
            } else if (!isNaN(parseInt(currentProfile.university))) {
              // Direct ID value
              universityValue = parseInt(currentProfile.university);
            } else if (typeof currentProfile.university === 'string') {
              // String value that needs conversion
              universityValue = UNIVERSITY_MAPPING.stringToId(currentProfile.university);
            }
          }
          
          // Use the existing profile data as a base
          profileData = {
            first_name: currentProfile.first_name,
            surname: currentProfile.surname,
            date_of_birth: currentProfile.date_of_birth,
            gender: currentProfile.gender,
            nationality: currentProfile.nationality,
            university: universityValue, // Use the properly converted university value
            course: currentProfile.course,
            course_year: currentProfile.course_year,
            academic_level: currentProfile.academic_level,
            // Update with new avatar and voice settings
            avatar: selectedAvatar,
            voice_id: selectedVoice
          };
        } else {
          // Convert university string to ID
          const universityId = UNIVERSITY_MAPPING.stringToId(university);
          
          // If we don't have an existing profile, use current state values
          profileData = {
            first_name: firstName,
            surname: surname,
            date_of_birth: dateOfBirth,
            gender: gender,
            nationality: nationality,
            university: universityId, // Use university ID instead of string
            course: course,
            course_year: courseYear,
            academic_level: academicLevel,
            avatar: selectedAvatar,
            voice_id: selectedVoice
          };
        }
        
        // Get existing profile for localStorage or create new one
        const existingProfile = JSON.parse(localStorage.getItem("userProfile")) || {};
      
        // Update with new avatar settings
        const updatedProfile = {
          ...existingProfile,
          avatar: selectedAvatar.toString(),
          voiceId: selectedVoice,
          // Ensure university is stored as string in localStorage
          university: university
        };
        
        // Save to API
        console.log("Saving avatar settings to API:", profileData);
        const response = await userApi.saveUserProfile(profileData);
        console.log("Avatar settings saved to API:", response);
        
        // Show success toast
        showToast("Avatar settings saved successfully!", "success");
        
        // Also save to localStorage and dispatch event for successful API calls
        localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
        
        // Manually dispatch a storage event to notify other components
        const storageEvent = new StorageEvent('storage', {
          key: 'userProfile',
          newValue: JSON.stringify(updatedProfile),
          oldValue: localStorage.getItem('userProfile'),
          storageArea: localStorage,
          url: window.location.href
        });
        window.dispatchEvent(storageEvent);
        
        // Refresh profile data from API to ensure everything is in sync
        try {
          const refreshedProfile = await userApi.getUserProfile();
          if (refreshedProfile) {
            console.log("Refreshed profile data after avatar save:", refreshedProfile);
            
            // Update state with refreshed data
            if (refreshedProfile.avatar) {
              setSelectedAvatar(parseInt(refreshedProfile.avatar));
            }
            if (refreshedProfile.voice_id) {
              setSelectedVoice(refreshedProfile.voice_id);
            }
            
            // Handle university ID conversion
            if (refreshedProfile.university) {
              let universityId;
              
              // Determine university ID from response
              if (typeof refreshedProfile.university === 'object' && refreshedProfile.university.id) {
                universityId = refreshedProfile.university.id;
              } else if (!isNaN(parseInt(refreshedProfile.university))) {
                universityId = parseInt(refreshedProfile.university);
              }
              
              // Convert ID to string value
              if (universityId) {
                const universityString = UNIVERSITY_MAPPING.idToString(universityId);
                console.log(`Avatar Refresh: Converting university ID ${universityId} to string value: ${universityString}`);
                setUniversity(universityString);
              }
            }
          }
        } catch (refreshError) {
          console.warn("Failed to refresh profile data after avatar save:", refreshError);
          // Non-critical error, don't show to user
        }
      } catch (apiError) {
        console.error("Failed to save avatar settings to API:", apiError);
        showToast("Failed to save to server. Saving locally only.", "error");
        
        // Fall back to localStorage if API fails
        // Get existing profile or create new one
        const existingProfile = JSON.parse(localStorage.getItem("userProfile")) || {};
      
        // Update with new avatar settings
        const updatedProfile = {
          ...existingProfile,
          avatar: selectedAvatar.toString(),
          voiceId: selectedVoice,
          // Ensure university is stored as string in localStorage
          university: university
        };
      
        // Save back to localStorage
        localStorage.setItem("userProfile", JSON.stringify(updatedProfile));
      
        // Manually dispatch a storage event to notify other components
        const storageEvent = new StorageEvent('storage', {
          key: 'userProfile',
          newValue: JSON.stringify(updatedProfile),
          oldValue: localStorage.getItem('userProfile'),
          storageArea: localStorage,
          url: window.location.href
        });
        window.dispatchEvent(storageEvent);
      }
    } catch (error) {
      console.error("Error saving avatar settings:", error);
      showToast("Failed to save avatar settings. Please try again.", "error");
    }
  };

  // Sample data modification log
  const dataModificationLog = [
    { id: 1, date: "2023-11-25 14:32:05", action: "Profile updated", details: "Name, bio, and profile picture changed" },
    { id: 2, date: "2023-11-20 09:15:22", action: "Password changed", details: "Password updated via account settings" },
    { id: 3, date: "2023-11-15 16:45:10", action: "Privacy settings updated", details: "Data retention period changed to 90 days" },
    { id: 4, date: "2023-11-01 11:20:33", action: "Account created", details: "Initial account setup and registration" }
  ];

  // Function to render select element since we don't have the Select component
  const renderSelect = (id, value, setValue, options) => (
    <select 
      id={id}
      value={value}
      onChange={(e) => setValue(e.target.value)}
      className="w-full p-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-teal-500"
    >
      <option value="" disabled>Select an option</option>
      {options.map(option => (
        <option key={option.value} value={option.value}>{option.label}</option>
      ))}
    </select>
  );

  // GDPR - Handle account deletion request
  const handleDeleteAccount = async () => {
    // Validate the confirmation text
    if (deleteConfirmText !== "DELETE") {
      showToast("Please type DELETE to confirm account deletion", "error");
      return;
    }
    
    // Disable buttons and show loading state
    setIsDeleting(true);
    
    try {
      // Call the API to delete the account
      await userApi.deleteAccount();
      
      // Show success message
      showToast("Your account has been deleted successfully", "success");
      
      // Close the modal
      setShowDeleteModal(false);
      setDeleteConfirmText("");
      
      // Add a small delay to allow the toast to be visible
      setTimeout(() => {
        // Redirect to login page or home
        window.location.href = "/login";
      }, 1500);
    } catch (error) {
      // Show error message
      let errorMessage = "Failed to delete account. Please try again.";
      
      // Extract specific error message if available
      if (error.response?.data?.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      } else if (typeof error.response?.data === 'string') {
        errorMessage = error.response.data;
      }
      
      showToast(errorMessage, "error");
      setIsDeleting(false);
    }
  };

  // GDPR - Handle data export
  const handleDataExport = () => {
    // In a real app, you would make an API call here
    setDataRequestSent(true);
    setTimeout(() => {
      // Simulate data preparation delay
      setDataRequestSent(false);
      alert("Your data has been prepared. Download starting...");
      // In a real app, you would trigger a file download here
    }, 2000);
  };

  // Handle password change
  const handlePasswordChange = async () => {
    // Reset states
    setPasswordError("");
    setPasswordSuccess(false);
    
    // Validate inputs
    if (!currentPassword) {
      setPasswordError("Current password is required");
      return;
    }
    
    if (!newPassword) {
      setPasswordError("New password is required");
      return;
    }
    
    if (newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters");
      return;
    }
    
    if (newPassword !== confirmPassword) {
      setPasswordError("Passwords do not match");
      return;
    }
    
    // Start loading state
    setIsPasswordChanging(true);
    
    try {
      // Call the API to change the password
      const response = await userApi.changePassword({
        current_password: currentPassword,
        new_password: newPassword,
        confirm_password: confirmPassword
      });
      
      // Show success message
      setPasswordSuccess(true);
      showToast("Password changed successfully!", "success");
      
      // Clear form
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      
      // Reset success message after 3 seconds
      setTimeout(() => {
        setPasswordSuccess(false);
      }, 3000);
    } catch (error) {
      // Handle API error
      console.error("Password change error:", error);
      const errorMessage = error.response?.data?.current_password ||
                          error.response?.data?.new_password ||
                          error.response?.data?.confirm_password ||
                          error.response?.data?.detail ||
                          error.response?.data?.message ||
                          "Failed to change password. Please try again.";
      
      setPasswordError(Array.isArray(errorMessage) ? errorMessage[0] : errorMessage);
      showToast("Password change failed: " + errorMessage, "error");
    } finally {
      setIsPasswordChanging(false);
    }
  };

  return (
    <DashboardLayout>
      {/* Toast notification */}
      <AnimatePresence>
        {toast && (
          <Toast 
            message={toast.message} 
            type={toast.type} 
            onClose={closeToast} 
          />
        )}
      </AnimatePresence>

      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-6">Settings</h1>

        <Tabs defaultValue="profile">
          <TabsList className="mb-6">
            <TabsTrigger value="profile">Profile</TabsTrigger>
            <TabsTrigger value="avatar">AI Avatar</TabsTrigger>
            <TabsTrigger value="preferences">Preferences</TabsTrigger>
            <TabsTrigger value="account">Account</TabsTrigger>
          </TabsList>

          {/* Profile Tab */}
          <TabsContent value="profile">
            <Card>
              <CardHeader>
                <CardTitle>Profile Information</CardTitle>
                <CardDescription>Update your personal details</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      value={firstName} 
                      onChange={(e) => setFirstName(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      value={surname} 
                      onChange={(e) => setSurname(e.target.value)} 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="dateOfBirth">Date of Birth</Label>
                    <Input 
                      id="dateOfBirth" 
                      type="date" 
                      value={dateOfBirth} 
                      onChange={(e) => setDateOfBirth(e.target.value)} 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="gender">Gender</Label>
                    {renderSelect("gender", gender, setGender, [
                      { value: "male", label: "Male" },
                      { value: "female", label: "Female" },
                      { value: "prefer-not-to-say", label: "Prefer not to say" }
                    ])}
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="nationality">Nationality</Label>
                    {renderSelect("nationality", nationality, setNationality, [
                      { value: "af", label: "Afghanistan" },
                      { value: "al", label: "Albania" },
                      { value: "dz", label: "Algeria" },
                      { value: "ad", label: "Andorra" },
                      { value: "ao", label: "Angola" },
                      { value: "ag", label: "Antigua and Barbuda" },
                      { value: "ar", label: "Argentina" },
                      { value: "am", label: "Armenia" },
                      { value: "au", label: "Australia" },
                      { value: "at", label: "Austria" },
                      { value: "az", label: "Azerbaijan" },
                      { value: "bs", label: "Bahamas" },
                      { value: "bh", label: "Bahrain" },
                      { value: "bd", label: "Bangladesh" },
                      { value: "bb", label: "Barbados" },
                      { value: "by", label: "Belarus" },
                      { value: "be", label: "Belgium" },
                      { value: "bz", label: "Belize" },
                      { value: "bj", label: "Benin" },
                      { value: "bt", label: "Bhutan" },
                      { value: "bo", label: "Bolivia" },
                      { value: "ba", label: "Bosnia and Herzegovina" },
                      { value: "bw", label: "Botswana" },
                      { value: "br", label: "Brazil" },
                      { value: "bn", label: "Brunei" },
                      { value: "bg", label: "Bulgaria" },
                      { value: "bf", label: "Burkina Faso" },
                      { value: "bi", label: "Burundi" },
                      { value: "cv", label: "Cabo Verde" },
                      { value: "kh", label: "Cambodia" },
                      { value: "cm", label: "Cameroon" },
                      { value: "ca", label: "Canada" },
                      { value: "cf", label: "Central African Republic" },
                      { value: "td", label: "Chad" },
                      { value: "cl", label: "Chile" },
                      { value: "cn", label: "China" },
                      { value: "co", label: "Colombia" },
                      { value: "km", label: "Comoros" },
                      { value: "cg", label: "Congo" },
                      { value: "cr", label: "Costa Rica" },
                      { value: "hr", label: "Croatia" },
                      { value: "cu", label: "Cuba" },
                      { value: "cy", label: "Cyprus" },
                      { value: "cz", label: "Czech Republic" },
                      { value: "dk", label: "Denmark" },
                      { value: "dj", label: "Djibouti" },
                      { value: "dm", label: "Dominica" },
                      { value: "do", label: "Dominican Republic" },
                      { value: "tl", label: "East Timor" },
                      { value: "ec", label: "Ecuador" },
                      { value: "eg", label: "Egypt" },
                      { value: "sv", label: "El Salvador" },
                      { value: "gq", label: "Equatorial Guinea" },
                      { value: "er", label: "Eritrea" },
                      { value: "ee", label: "Estonia" },
                      { value: "et", label: "Ethiopia" },
                      { value: "fj", label: "Fiji" },
                      { value: "fi", label: "Finland" },
                      { value: "fr", label: "France" },
                      { value: "ga", label: "Gabon" },
                      { value: "gm", label: "Gambia" },
                      { value: "ge", label: "Georgia" },
                      { value: "de", label: "Germany" },
                      { value: "gh", label: "Ghana" },
                      { value: "gr", label: "Greece" },
                      { value: "gd", label: "Grenada" },
                      { value: "gt", label: "Guatemala" },
                      { value: "gn", label: "Guinea" },
                      { value: "gw", label: "Guinea-Bissau" },
                      { value: "gy", label: "Guyana" },
                      { value: "ht", label: "Haiti" },
                      { value: "hn", label: "Honduras" },
                      { value: "hu", label: "Hungary" },
                      { value: "is", label: "Iceland" },
                      { value: "in", label: "India" },
                      { value: "id", label: "Indonesia" },
                      { value: "ir", label: "Iran" },
                      { value: "iq", label: "Iraq" },
                      { value: "ie", label: "Ireland" },
                      { value: "il", label: "Israel" },
                      { value: "it", label: "Italy" },
                      { value: "jm", label: "Jamaica" },
                      { value: "jp", label: "Japan" },
                      { value: "jo", label: "Jordan" },
                      { value: "kz", label: "Kazakhstan" },
                      { value: "ke", label: "Kenya" },
                      { value: "ki", label: "Kiribati" },
                      { value: "kp", label: "North Korea" },
                      { value: "kr", label: "South Korea" },
                      { value: "kw", label: "Kuwait" },
                      { value: "kg", label: "Kyrgyzstan" },
                      { value: "la", label: "Laos" },
                      { value: "lv", label: "Latvia" },
                      { value: "lb", label: "Lebanon" },
                      { value: "ls", label: "Lesotho" },
                      { value: "lr", label: "Liberia" },
                      { value: "ly", label: "Libya" },
                      { value: "li", label: "Liechtenstein" },
                      { value: "lt", label: "Lithuania" },
                      { value: "lu", label: "Luxembourg" },
                      { value: "mg", label: "Madagascar" },
                      { value: "mw", label: "Malawi" },
                      { value: "my", label: "Malaysia" },
                      { value: "mv", label: "Maldives" },
                      { value: "ml", label: "Mali" },
                      { value: "mt", label: "Malta" },
                      { value: "mh", label: "Marshall Islands" },
                      { value: "mr", label: "Mauritania" },
                      { value: "mu", label: "Mauritius" },
                      { value: "mx", label: "Mexico" },
                      { value: "fm", label: "Micronesia" },
                      { value: "md", label: "Moldova" },
                      { value: "mc", label: "Monaco" },
                      { value: "mn", label: "Mongolia" },
                      { value: "me", label: "Montenegro" },
                      { value: "ma", label: "Morocco" },
                      { value: "mz", label: "Mozambique" },
                      { value: "mm", label: "Myanmar" },
                      { value: "na", label: "Namibia" },
                      { value: "nr", label: "Nauru" },
                      { value: "np", label: "Nepal" },
                      { value: "nl", label: "Netherlands" },
                      { value: "nz", label: "New Zealand" },
                      { value: "ni", label: "Nicaragua" },
                      { value: "ne", label: "Niger" },
                      { value: "ng", label: "Nigeria" },
                      { value: "no", label: "Norway" },
                      { value: "om", label: "Oman" },
                      { value: "pk", label: "Pakistan" },
                      { value: "pw", label: "Palau" },
                      { value: "pa", label: "Panama" },
                      { value: "pg", label: "Papua New Guinea" },
                      { value: "py", label: "Paraguay" },
                      { value: "pe", label: "Peru" },
                      { value: "ph", label: "Philippines" },
                      { value: "pl", label: "Poland" },
                      { value: "pt", label: "Portugal" },
                      { value: "qa", label: "Qatar" },
                      { value: "ro", label: "Romania" },
                      { value: "ru", label: "Russia" },
                      { value: "rw", label: "Rwanda" },
                      { value: "kn", label: "Saint Kitts and Nevis" },
                      { value: "lc", label: "Saint Lucia" },
                      { value: "vc", label: "Saint Vincent and the Grenadines" },
                      { value: "ws", label: "Samoa" },
                      { value: "sm", label: "San Marino" },
                      { value: "st", label: "Sao Tome and Principe" },
                      { value: "sa", label: "Saudi Arabia" },
                      { value: "sn", label: "Senegal" },
                      { value: "rs", label: "Serbia" },
                      { value: "sc", label: "Seychelles" },
                      { value: "sl", label: "Sierra Leone" },
                      { value: "sg", label: "Singapore" },
                      { value: "sk", label: "Slovakia" },
                      { value: "si", label: "Slovenia" },
                      { value: "sb", label: "Solomon Islands" },
                      { value: "so", label: "Somalia" },
                      { value: "za", label: "South Africa" },
                      { value: "ss", label: "South Sudan" },
                      { value: "es", label: "Spain" },
                      { value: "lk", label: "Sri Lanka" },
                      { value: "sd", label: "Sudan" },
                      { value: "sr", label: "Suriname" },
                      { value: "sz", label: "Eswatini" },
                      { value: "se", label: "Sweden" },
                      { value: "ch", label: "Switzerland" },
                      { value: "sy", label: "Syria" },
                      { value: "tj", label: "Tajikistan" },
                      { value: "tz", label: "Tanzania" },
                      { value: "th", label: "Thailand" },
                      { value: "tg", label: "Togo" },
                      { value: "to", label: "Tonga" },
                      { value: "tt", label: "Trinidad and Tobago" },
                      { value: "tn", label: "Tunisia" },
                      { value: "tr", label: "Turkey" },
                      { value: "tm", label: "Turkmenistan" },
                      { value: "tv", label: "Tuvalu" },
                      { value: "ug", label: "Uganda" },
                      { value: "ua", label: "Ukraine" },
                      { value: "ae", label: "United Arab Emirates" },
                      { value: "gb", label: "United Kingdom" },
                      { value: "us", label: "United States" },
                      { value: "uy", label: "Uruguay" },
                      { value: "uz", label: "Uzbekistan" },
                      { value: "vu", label: "Vanuatu" },
                      { value: "va", label: "Vatican City" },
                      { value: "ve", label: "Venezuela" },
                      { value: "vn", label: "Vietnam" },
                      { value: "ye", label: "Yemen" },
                      { value: "zm", label: "Zambia" },
                      { value: "zw", label: "Zimbabwe" }
                    ])}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="academicLevel">Academic Level</Label>
                    {renderSelect("academicLevel", academicLevel, setAcademicLevel, [
                      { value: "undergraduate", label: "Undergraduate" },
                      { value: "masters", label: "Masters" },
                      { value: "postgraduate", label: "Postgraduate" },
                      { value: "phd", label: "PhD" }
                    ])}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="courseYear">Course Year</Label>
                  {renderSelect("courseYear", courseYear, setCourseYear, [
                    { value: "foundational", label: "Foundational" },
                    { value: "year1", label: "Year 1" },
                    { value: "year2", label: "Year 2" },
                    { value: "year3", label: "Year 3" },
                    { value: "year4", label: "Year 4" },
                    { value: "year5", label: "Year 5+" }
                  ])}
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="university">University</Label>
                    {renderSelect("university", university, setUniversity, [
                      { value: "northampton", label: "University of Northampton" },
                      { value: "oxford", label: "University of Oxford" },
                      { value: "cambridge", label: "University of Cambridge" },
                      { value: "imperial", label: "Imperial College London" },
                      { value: "ucl", label: "University College London" },
                      { value: "lse", label: "London School of Economics" },
                      { value: "edinburgh", label: "University of Edinburgh" },
                      { value: "manchester", label: "University of Manchester" },
                      { value: "bristol", label: "University of Bristol" },
                      { value: "warwick", label: "University of Warwick" },
                      { value: "glasgow", label: "University of Glasgow" }
                    ])}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="course">Course</Label>
                    {renderSelect("course", course, setCourse, [
                      { value: "computer-science", label: "Computer Science" },
                      { value: "business", label: "Business Administration" },
                      { value: "mathematics", label: "Mathematics" },
                      { value: "physics", label: "Physics" },
                      { value: "engineering", label: "Engineering" },
                      { value: "chemistry", label: "Chemistry" },
                      { value: "economics", label: "Economics" },
                      { value: "management", label: "Management" },
                      { value: "finance", label: "Finance" },
                      { value: "accounting", label: "Accounting" },
                      { value: "law", label: "Law" }
                    ])}
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bio">Bio</Label>
                  <textarea
                    id="bio"
                    className="w-full min-h-[100px] p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
                    defaultValue={`${academicLevel || 'Student'} at the University of ${university || 'Northampton'}. Studying ${course || 'Computer Science'}.`}
                  />
                </div>
                <div className="flex items-center space-x-4">
                  <Button 
                    className="bg-teal-500 hover:bg-teal-600 text-white"
                    onClick={saveProfileInfo}
                  >
                    Save Changes
                  </Button>
                  {profileSaved && (
                    <p className="text-green-600 font-medium">Profile updated successfully!</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Avatar Tab */}
          <TabsContent value="avatar">
            <Card>
              <CardHeader>
                <CardTitle>AI Avatar Customization</CardTitle>
                <CardDescription>Choose your preferred AI lecturer avatar</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                  {AVATARS.map((avatar) => (
                    <motion.div
                      key={avatar.id}
                      className={`relative cursor-pointer rounded-lg overflow-hidden border-2 transition-all ${
                        selectedAvatar === avatar.id 
                          ? "border-teal-500 ring-2 ring-teal-200" 
                          : "border-gray-200 hover:border-teal-300"
                      }`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={() => handleAvatarChange(avatar.id)}
                    >
                      <img 
                        src={avatar.src} 
                        alt={avatar.alt} 
                        className="w-full h-auto aspect-square object-cover" 
                      />
                      {selectedAvatar === avatar.id && (
                        <div className="absolute top-2 right-2 bg-teal-500 text-white rounded-full p-1">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          >
                            <polyline points="20 6 9 17 4 12"></polyline>
                          </svg>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </div>

                <div className="space-y-4">
                  {/* Voice Selector Component */}
                  {!selectedVoice && (
                    <div className="p-3 bg-amber-50 border border-amber-200 rounded-md mb-2">
                      <p className="text-sm text-amber-700">
                        Please select a specific voice for your avatar.
                      </p>
                    </div>
                  )}
                  <VoiceSelector
                    selectedVoice={selectedVoice}
                    setSelectedVoice={setSelectedVoice}
                    gender={voiceGender}
                    setGender={setVoiceGender}
                  />

                  <Button 
                    className="bg-teal-500 hover:bg-teal-600 text-white"
                    onClick={saveAvatarSettings}
                    disabled={!selectedVoice}
                  >
                    Save Avatar Settings
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Preferences Tab */}
          <TabsContent value="preferences">
            <Card>
              <CardHeader>
                <CardTitle>App Preferences</CardTitle>
                <CardDescription>Customize your app experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Dark Mode</h3>
                    <p className="text-sm text-gray-500">Switch between light and dark themes</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Notifications</h3>
                    <p className="text-sm text-gray-500">Receive notifications about deadlines and updates</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Sound Effects</h3>
                    <p className="text-sm text-gray-500">Play sound effects during interactions</p>
                  </div>
                  <Switch />
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Auto-save Chats</h3>
                    <p className="text-sm text-gray-500">Automatically save your conversations with the AI</p>
                  </div>
                  <Switch defaultChecked />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  {renderSelect("language", "en", () => {}, [
                    { value: "en", label: "English" },
                    { value: "fr", label: "French" },
                    { value: "es", label: "Spanish" },
                    { value: "de", label: "German" }
                  ])}
                </div>

                <Button className="bg-teal-500 hover:bg-teal-600 text-white">Save Preferences</Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Account Tab */}
          <TabsContent value="account">
            <Card>
              <CardHeader>
                <CardTitle>Account Settings</CardTitle>
                <CardDescription>Manage your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Change Password</h3>
                  
                  {passwordError && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-md flex items-start">
                      <AlertCircle className="h-5 w-5 text-red-500 mr-2 mt-0.5" />
                      <p className="text-sm text-red-600">{passwordError}</p>
                    </div>
                  )}
                  
                  {passwordSuccess && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-md flex items-start">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mr-2 mt-0.5" />
                      <p className="text-sm text-green-600">Password changed successfully!</p>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input 
                      id="currentPassword" 
                      type="password" 
                      value={currentPassword}
                      onChange={(e) => setCurrentPassword(e.target.value)}
                      placeholder="Enter your current password"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input 
                      id="newPassword" 
                      type="password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter your new password"
                    />
                    <p className="text-xs text-gray-500">Password must be at least 8 characters long</p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input 
                      id="confirmPassword" 
                      type="password" 
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Confirm your new password"
                    />
                  </div>
                  <Button 
                    className="bg-teal-500 hover:bg-teal-600 text-white"
                    onClick={handlePasswordChange}
                    disabled={isPasswordChanging}
                  >
                    {isPasswordChanging ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Changing Password...
                      </>
                    ) : (
                      "Change Password"
                    )}
                  </Button>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-md p-4 my-6">
                  <h3 className="font-medium text-blue-800 mb-2">Data Privacy Rights (GDPR)</h3>
                  <p className="text-sm text-blue-600 mb-2">
                    Under the General Data Protection Regulation (GDPR), you have the right to access, modify, and delete your personal data.
                  </p>
                  <p className="text-sm text-blue-600 mb-2">
                    Any changes to your data are logged and time-stamped to maintain transparency.
                  </p>
                  <button 
                    onClick={() => setShowDataLog(!showDataLog)}
                    className="text-sm text-blue-700 underline hover:text-blue-900"
                  >
                    {showDataLog ? "Hide modification history" : "View data modification history"}
                  </button>

                  {/* Data Modification Log */}
                  {showDataLog && (
                    <div className="mt-3 bg-white border border-blue-100 rounded-md p-3">
                      <h4 className="text-sm font-medium text-blue-800 mb-2">Data Modification Log</h4>
                      <div className="max-h-60 overflow-y-auto">
                        <table className="w-full text-sm">
                          <thead className="text-xs text-gray-700 uppercase bg-gray-50">
                            <tr>
                              <th className="px-3 py-2 text-left">Date</th>
                              <th className="px-3 py-2 text-left">Action</th>
                              <th className="px-3 py-2 text-left">Details</th>
                            </tr>
                          </thead>
                          <tbody>
                            {dataModificationLog.map(log => (
                              <tr key={log.id} className="border-b">
                                <td className="px-3 py-2 whitespace-nowrap">{log.date}</td>
                                <td className="px-3 py-2">{log.action}</td>
                                <td className="px-3 py-2">{log.details}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">
                        This log tracks all changes made to your personal data in compliance with GDPR requirements.
                      </p>
                    </div>
                  )}
                </div>

                <div className="border-t pt-6 mt-6">
                  <h3 className="font-medium text-lg mb-4">Data Management</h3>
                  <div className="space-y-6">
                    <div className="flex items-center justify-between bg-gray-50 p-4 rounded-md">
                      <div>
                        <h4 className="font-medium">Export Your Data</h4>
                        <p className="text-sm text-gray-500">Download all your personal data and learning history</p>
                      </div>
                      <Button 
                        variant="outline" 
                        className="border border-gray-300 bg-white text-gray-800 hover:bg-gray-100"
                        onClick={handleDataExport}
                        disabled={dataRequestSent}
                      >
                        {dataRequestSent ? "Processing..." : "Export Data"}
                      </Button>
                    </div>
                    
                    <div className="flex items-center justify-between bg-gray-50 p-4 rounded-md">
                      <div>
                        <h4 className="font-medium">Data Retention</h4>
                        <p className="text-sm text-gray-500">Choose how long we keep your chat history</p>
                      </div>
                      {renderSelect("retention", "90days", () => {}, [
                        { value: "30days", label: "30 Days" },
                        { value: "90days", label: "90 Days" },
                        { value: "1year", label: "1 Year" },
                        { value: "forever", label: "Forever" }
                      ])}
                    </div>
                    
                    <div className="bg-red-50 border border-red-200 rounded-md p-4">
                      <h4 className="font-medium text-red-800">Danger Zone</h4>
                      <p className="text-sm text-red-600 mb-4">These actions are permanent and cannot be undone</p>
                      
                      <div className="flex justify-between items-center">
                        <div>
                          <h5 className="font-medium">Delete Account</h5>
                          <p className="text-sm text-gray-500">Permanently delete your account and all data</p>
                        </div>
                        <Button 
                          className="bg-red-500 hover:bg-red-600 text-white"
                          onClick={() => setShowDeleteModal(true)}
                        >
                          Delete Account
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold text-red-600 mb-4">Delete Account</h2>
            <p className="mb-4">
              This action cannot be undone. All your personal data, chat history, and learning progress will be permanently deleted.
            </p>
            <p className="mb-6 text-sm bg-gray-100 p-3 rounded">
              Under GDPR Article 17, you have the "right to be forgotten." We will delete all your data from our systems within 30 days.
            </p>
            
            {isDeleting && (
              <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md flex items-center">
                <Loader2 className="h-5 w-5 text-blue-500 mr-2 animate-spin" />
                <p className="text-blue-700">Processing your request. Please wait...</p>
              </div>
            )}
            
            <div className="mb-4">
              <Label htmlFor="deleteConfirm">Type DELETE to confirm:</Label>
              <Input 
                id="deleteConfirm" 
                value={deleteConfirmText}
                onChange={(e) => setDeleteConfirmText(e.target.value)}
                className="mt-1"
                disabled={isDeleting}
              />
            </div>
            <div className="flex justify-end space-x-3">
              <Button 
                variant="outline" 
                className="border border-gray-300"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText("");
                }}
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button 
                className="bg-red-500 hover:bg-red-600 text-white"
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== "DELETE" || isDeleting}
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Deleting Account...
                  </>
                ) : (
                  "Delete Forever"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Settings; 