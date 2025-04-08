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

// Add request interceptor to handle errors and CSRF
instance.interceptors.request.use(
    async (config) => {
        // Skip CSRF token for the CSRF endpoint itself
        if (config.url === '/api/auth/csrf/') {
            return config;
        }

        try {
            const csrfToken = await getCsrfToken();
            if (csrfToken) {
                config.headers['X-CSRFToken'] = csrfToken;
                console.log('Adding CSRF token to request:', config.url);
            }
        } catch (error) {
            console.error('Error setting CSRF token:', error);
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
    (error) => {
        // Clear stored token on 403 (Forbidden) errors
        if (error.response?.status === 403) {
            storedCsrfToken = null;
        }
        console.error('API Error:', error.response?.data || error.message);
        return Promise.reject(error);
    }
);

export default instance; 