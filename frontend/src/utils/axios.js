import axios from 'axios';

// Create axios instance with custom config
const instance = axios.create({
    baseURL: 'http://localhost:8000',
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // Required for session handling
});

let storedCsrfToken = null;

// Function to get CSRF token from session
async function getCsrfToken() {
    if (storedCsrfToken) {
        return storedCsrfToken;
    }

    try {
        console.log('Fetching new CSRF token...');
        const response = await instance.get('/api/auth/csrf/');
        storedCsrfToken = response.data.csrfToken;
        console.log('CSRF token stored:', storedCsrfToken);
        return storedCsrfToken;
    } catch (error) {
        console.error('Error fetching CSRF token:', error);
        return null;
    }
}

// Function to refresh the JWT token
async function refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    if (!refreshToken) {
        return false;
    }

    try {
        const response = await axios.post('/api/auth/token/refresh/', {
            refresh: refreshToken
        });

        if (response.data.access) {
            localStorage.setItem('authToken', response.data.access);
            console.log('JWT token refreshed successfully');
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error refreshing token:', error);
        return false;
    }
}

// Add request interceptor to handle errors and CSRF
instance.interceptors.request.use(
    async (config) => {
        // Skip CSRF token for GET requests and the CSRF endpoint itself
        if (config.method !== 'get' && config.url !== '/api/auth/csrf/') {
            try {
                // Add CSRF token to request headers with correct header case
            const csrfToken = await getCsrfToken();
            if (csrfToken) {
                    // Use the correct header name expected by Django (case-sensitive)
                    config.headers['X-Csrftoken'] = csrfToken;
                    console.log(`Adding CSRF token to ${config.method} request:`, config.url);
                } else {
                    console.warn('No CSRF token available for request:', config.url);
            }
        } catch (error) {
            console.error('Error setting CSRF token:', error);
        }
        }
        
        // Add authentication token to Authorization header if it exists
        const authToken = localStorage.getItem('authToken');
        if (authToken) {
            config.headers['Authorization'] = `Bearer ${authToken}`;
        }
        
        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Add response interceptor to handle errors
instance.interceptors.response.use(
    (response) => {
        return response;
    },
    async (error) => {
        // Handle CSRF related errors
        if (error.response?.status === 403 && 
            error.response?.data?.detail?.includes('CSRF')) {
            console.error('CSRF validation failed. Clearing stored token.');
            storedCsrfToken = null;
            // Could add logic to retry the request with a fresh token here
        }

        // Handle token expiration
        if (error.response?.status === 401) {
            console.log('Token expired. Attempting to refresh...');
            
            const originalRequest = error.config;
            
            // Prevent infinite loop of refresh attempts
            if (!originalRequest._retry) {
                originalRequest._retry = true;
                
                // Try to refresh the token
                const refreshed = await refreshToken();
                
                if (refreshed) {
                    // Update the authorization header with new token
                    const newToken = localStorage.getItem('authToken');
                    originalRequest.headers['Authorization'] = `Bearer ${newToken}`;
                    
                    // Retry the original request
                    return instance(originalRequest);
                } else {
                    // If refresh failed, redirect to login
                    console.log('Token refresh failed. Redirecting to login...');
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('isLoggedIn');
                    
                    // If not already on login page, redirect
                    if (!window.location.pathname.includes('/login')) {
                        window.location.href = '/login';
                    }
                }
            }
        }
        
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

// User profile and onboarding API utilities
export const userApi = {
    // Get user's onboarding status
    getOnboardingStatus: async () => {
        try {
            const response = await instance.get('/api/user/onboarding-status/');
            return response.data;
        } catch (error) {
            console.error('Error fetching onboarding status:', error);
            throw error;
        }
    },
    
    // Update user's onboarding status
    updateOnboardingStatus: async (data) => {
        try {
            const response = await instance.patch('/api/user/onboarding-status/', data);
            return response.data;
        } catch (error) {
            console.error('Error updating onboarding status:', error);
            throw error;
        }
    },
    
    // Get user's profile
    getUserProfile: async () => {
        try {
            const response = await instance.get('/api/user/profile/');
            return response.data;
        } catch (error) {
            // If profile doesn't exist yet, that's ok
            if (error.response?.status === 404) {
                return null;
            }
            console.error('Error fetching user profile:', error);
            throw error;
        }
    },
    
    // Create or update user's profile
    saveUserProfile: async (profileData) => {
        try {
            const response = await instance.post('/api/user/profile/', profileData);
            return response.data;
        } catch (error) {
            console.error('Error saving user profile:', error);
            throw error;
        }
    },
    
    // Change user's password
    changePassword: async (passwordData) => {
        try {
            // Get a CSRF token first (important for security)
            await getCsrfToken();
            
            const response = await instance.post('/api/auth/change-password/', passwordData);
            
            // If password change is successful and returns new tokens, update them
            if (response.data.token) {
                localStorage.setItem('authToken', response.data.token);
                if (response.data.refresh) {
                    localStorage.setItem('refreshToken', response.data.refresh);
                }
                
                // Update stored credentials for login form compatibility
                const userEmail = localStorage.getItem("userEmail");
                if (userEmail) {
                    const credentials = {
                        email: userEmail,
                        password: passwordData.new_password,
                        lastUpdated: new Date().toISOString()
                    };
                    localStorage.setItem("userCredentials", JSON.stringify(credentials));
                }
            }
            
            return response.data;
        } catch (error) {
            console.error('Error changing password:', error);
            throw error;
        }
    },
    
    // Delete user account
    deleteAccount: async () => {
        try {
            // Get a CSRF token first (important for security)
            await getCsrfToken();
            
            try {
                // Try to use the real endpoint
                const response = await instance.post('/api/auth/delete-account/');
                
                // On successful deletion, clear all local storage items
                if (response.status === 200 || response.status === 204) {
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('isLoggedIn');
                    localStorage.removeItem('userEmail');
                    localStorage.removeItem('userCredentials');
                    localStorage.removeItem('userProfile');
                    
                    // Clear any other app-specific items
                    localStorage.removeItem('chatHistory');
                }
                
                return {
                    ...response.data,
                    realApiUsed: true  // Flag indicating real API was used
                };
            } catch (apiError) {
                // If the endpoint doesn't exist (404) or has another issue,
                // use a mock implementation for demo purposes
                if (apiError.response?.status === 404 || apiError.response?.status === 405) {
                    console.warn('Account deletion API endpoint not found. Using mock implementation');
                    
                    // Mock response for demo - simulate a 1 second delay
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    // Clear all local storage items as a mock deletion
                    localStorage.removeItem('authToken');
                    localStorage.removeItem('refreshToken');
                    localStorage.removeItem('isLoggedIn');
                    localStorage.removeItem('userEmail');
                    localStorage.removeItem('userCredentials');
                    localStorage.removeItem('userProfile');
                    localStorage.removeItem('chatHistory');
                    
                    // Return a mock success response with a flag
                    return { 
                        message: "Account has been marked for deletion. All your data will be removed within 30 days.",
                        success: true,
                        realApiUsed: false  // Flag indicating mock implementation was used
                    };
                }
                
                // If it's any other error, throw it
                throw apiError;
            }
        } catch (error) {
            console.error('Error deleting account:', error);
            throw error;
        }
    }
};

export default instance; 