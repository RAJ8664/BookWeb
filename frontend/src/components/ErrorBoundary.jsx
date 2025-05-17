import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null, 
      errorInfo: null,
      errorType: null
    };
  }

  static getDerivedStateFromError(error) {
    // Determine error type for custom UI
    let errorType = 'unknown';
    
    if (error.name === 'ChunkLoadError' || error.message.includes('Loading chunk')) {
      errorType = 'chunk';
    } else if (error.name === 'NetworkError' || error.message.includes('Network')) {
      errorType = 'network';
    } else if (error.name === 'SyntaxError') {
      errorType = 'syntax';
    } else if (error.name === 'TypeError') {
      errorType = 'type';
    } else if (error.message.includes('auth') || error.message.includes('permission')) {
      errorType = 'auth';
    }
    
    return { 
      hasError: true,
      errorType
    };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ error, errorInfo });
    
    // Here you could also log to an error monitoring service like Sentry
    // if (window.Sentry) {
    //   window.Sentry.captureException(error);
    // }
  }

  render() {
    const { fallback, children } = this.props;
    const { hasError, errorType, error } = this.state;

    // If there's a custom fallback, use it
    if (hasError && fallback) {
      return fallback(error, this.resetError);
    }

    // Default error UI based on error type
    if (hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
          <div className="max-w-md w-full p-8 bg-white shadow-lg rounded-lg text-center">
            <div className="mb-6">
              {errorType === 'network' ? (
                <div className="mx-auto h-20 w-20 text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                  </svg>
                </div>
              ) : errorType === 'auth' ? (
                <div className="mx-auto h-20 w-20 text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              ) : (
                <div className="mx-auto h-20 w-20 text-red-500">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
              )}
            </div>
            
            <h1 className="text-2xl font-bold text-gray-800 mb-3">
              {errorType === 'chunk' ? 'Failed to Load Content' : 
               errorType === 'network' ? 'Network Error' :
               errorType === 'auth' ? 'Authentication Error' :
               errorType === 'syntax' ? 'Application Error' :
               'Something Went Wrong'}
            </h1>
            
            <p className="text-gray-600 mb-6">
              {errorType === 'chunk' ? 'There was an error loading the required resources. This could be due to a poor network connection or a recent update.' : 
               errorType === 'network' ? 'Unable to connect to our servers. Please check your internet connection and try again.' :
               errorType === 'auth' ? 'You do not have permission to access this page or your session has expired.' :
               errorType === 'syntax' ? 'The application encountered an error. Our team has been notified.' :
               'We encountered an unexpected error. Please try again or contact support if the problem persists.'}
            </p>
            
            <div className="flex flex-col space-y-3">
              <Link 
                to="/"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Return to Home
              </Link>
              
              <button 
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300 transition-colors"
              >
                Refresh Page
              </button>
              
              {errorType === 'auth' && (
                <Link 
                  to="/login"
                  className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
                >
                  Log In Again
                </Link>
              )}
            </div>
          </div>
        </div>
      );
    }

    return children;
  }

  resetError = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  fallback: PropTypes.func,
};

export default ErrorBoundary; 