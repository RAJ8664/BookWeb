import React from 'react';

const LoadingSpinner = () => {
  return (
    <div className="flex justify-center items-center py-20">
      <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-blue-500 border-solid"></div>
      <p className="ml-3 text-gray-600">Loading...</p>
    </div>
  );
};

export default LoadingSpinner; 