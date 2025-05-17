const getBaseURL = () => {
    // In development, use relative URL to leverage Vite's proxy
    if (import.meta.env.DEV) {
        return '';  // Empty string means use relative URLs which will go through the proxy
    }
    
    // In production, use the environment variable or fallback
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    console.log('Using API URL:', apiUrl);
    return apiUrl;
}

export default getBaseURL;
