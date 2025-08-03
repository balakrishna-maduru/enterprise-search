// src/components/UI/ErrorMessage.tsx
import React, { useState, useEffect } from 'react';

interface ErrorMessageProps {
  title?: string;
  message: string;
  variant?: 'error' | 'warning' | 'info';
  dismissible?: boolean;
  onDismiss?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ 
  title = 'Error', 
  message, 
  variant = 'error',
  dismissible = false,
  onDismiss
}) => {
  const [isVisible, setIsVisible] = useState(true);
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const variantConfig = {
    error: {
      container: 'bg-red-50 border-red-200',
      text: 'text-red-800',
      description: 'text-red-700',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
      ),
      emoji: '❌'
    },
    warning: {
      container: 'bg-yellow-50 border-yellow-200',
      text: 'text-yellow-800',
      description: 'text-yellow-700',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M12 2l10 17H2L12 2z" />
        </svg>
      ),
      emoji: '⚠️'
    },
    info: {
      container: 'bg-blue-50 border-blue-200',
      text: 'text-blue-800',
      description: 'text-blue-700',
      icon: (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      emoji: 'ℹ️'
    }
  };

  const config = variantConfig[variant];

  const handleDismiss = () => {
    setIsVisible(false);
    setTimeout(() => {
      onDismiss?.();
    }, 300);
  };

  if (!isVisible) return null;

  return (
    <div className={`${config.container} border rounded-lg p-4 mb-4 transition-all duration-300 ${
      isAnimating ? 'animate-bounce' : ''
    } transform hover:scale-102 shadow-sm hover:shadow-md`}>
      <div className={`flex items-start gap-3 ${config.text}`}>
        <div className="flex-shrink-0 flex items-center gap-2">
          <span className="text-lg">{config.emoji}</span>
          {config.icon}
        </div>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <span className="font-semibold">{title}</span>
            {dismissible && (
              <button
                onClick={handleDismiss}
                className={`${config.text} hover:opacity-70 transition-opacity`}
                title="Dismiss"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
          <p className={`${config.description} mt-1 leading-relaxed`}>{message}</p>
          <div className="mt-2 text-xs opacity-70">
            🕒 {new Date().toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorMessage;
