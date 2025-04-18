const getBaseURL = () => {
    // Use environment variable if available, otherwise fallback to localhost
    const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
    console.log('Using API URL:', apiUrl);
    return apiUrl;
}

export default getBaseURL;
