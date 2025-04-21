import React, { useState, useEffect } from 'react';
import { toggleBackendEnvironment } from '../utils/baseURL';

const ApiEnvToggle = () => {
  const [isLocal, setIsLocal] = useState(localStorage.getItem('useLocalBackend') === 'true');
  const [showTooltip, setShowTooltip] = useState(false);
  
  useEffect(() => {
    // Check if we have explicitly set a preference
    const hasPreference = localStorage.getItem('useLocalBackend') !== null;
    
    // If not, set default based on the environment
    if (!hasPreference) {
      const isDevEnv = import.meta.env.MODE === 'development';
      setIsLocal(isDevEnv);
      toggleBackendEnvironment(isDevEnv);
    }
  }, []);

  const handleToggle = () => {
    const newValue = !isLocal;
    setIsLocal(newValue);
    toggleBackendEnvironment(newValue);
  };
  
  // Define styles
  const containerStyle = {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    zIndex: 1000,
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-end',
  };
  
  const toggleStyle = {
    backgroundColor: isLocal ? '#4CAF50' : '#3f51b5',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 16px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    fontWeight: 'bold',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
  };
  
  const tooltipStyle = {
    position: 'absolute',
    bottom: '50px',
    right: '0',
    width: '200px',
    backgroundColor: '#333',
    color: 'white',
    padding: '10px',
    borderRadius: '4px',
    fontSize: '12px',
    boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
    display: showTooltip ? 'block' : 'none',
  };

  return (
    <div style={containerStyle}>
      <div style={tooltipStyle}>
        {isLocal 
          ? 'Using localhost:5000 backend' 
          : 'Using production Vercel backend'}
        <div>Click to toggle</div>
      </div>
      <button 
        style={toggleStyle}
        onClick={handleToggle}
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {isLocal ? '🏠 Local API' : '🌐 Production API'}
      </button>
    </div>
  );
};

export default ApiEnvToggle; 