// src/components/UI/LoadingSpinner.tsx
import React from 'react';

interface LoadingSpinnerProps {
  message?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'dots' | 'pulse';
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({ 
  message = 'Loading...', 
  size = 'md',
  variant = 'default'
}) => {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12'
  };

  const renderSpinner = () => {
    switch (variant) {
      case 'dots':
        return (
          <div className="flex space-x-2">
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
            <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
          </div>
        );
      case 'pulse':
        return (
          <div className={`${sizeClasses[size]} bg-blue-500 rounded-full animate-pulse`}></div>
        );
      default:
        return (
          <div className={`animate-spin ${sizeClasses[size]} border-4 border-blue-500 border-t-transparent rounded-full`}></div>
        );
    }
  };

  return (
    <div className="flex items-center justify-center py-12">
      <div className="text-center">
        <div className="mx-auto mb-4">
          {renderSpinner()}
        </div>
        <p className="text-gray-600 animate-pulse">{message}</p>
        <div className="mt-2 text-xs text-gray-400">
          🚀 Powered by Enterprise Search
        </div>
      </div>
    </div>
  );
};

export default LoadingSpinner;
