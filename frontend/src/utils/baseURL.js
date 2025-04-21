// Get the base URL for API calls
const getBaseURL = () => {
    // Use environment variable from Vite
    const apiUrl = import.meta.env.VITE_API_URL || 'https://book-web-backend-xi.vercel.app';
    
    // Check if we're forcing local development from localStorage
    const forceLocal = localStorage.getItem('useLocalBackend') === 'true';
    const forceProduction = localStorage.getItem('useLocalBackend') === 'false';
    
    // Override based on user preference in localStorage
    if (forceLocal) {
        return 'http://localhost:5000';
    } else if (forceProduction) {
        return 'https://book-web-backend-xi.vercel.app';
    }
    
    // Log which API URL we're using
    console.log('Using API URL:', apiUrl);
    return apiUrl;
}

export default getBaseURL;

// Helper to toggle between local and production backends
export const toggleBackendEnvironment = (useLocal) => {
    localStorage.setItem('useLocalBackend', useLocal ? 'true' : 'false');
    // Force page reload to apply the new backend URL
    window.location.reload();
}
