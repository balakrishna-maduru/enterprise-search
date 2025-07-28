// src/components/Common/LoadingSpinner.js
import React from 'react';

const LoadingSpinner = ({ size = 'md', color = 'red' }) => {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8', 
    lg: 'h-12 w-12'
  };

  const colorClasses = {
    red: 'border-red-600',
    blue: 'border-blue-600',
    green: 'border-green-600',
    purple: 'border-purple-600',
    gray: 'border-gray-600'
  };

  return (
    <div className={`animate-spin rounded-full ${sizeClasses[size]} border-b-2 ${colorClasses[color]}`}></div>
  );
};

export default LoadingSpinner;