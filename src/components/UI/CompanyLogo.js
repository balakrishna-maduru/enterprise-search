// src/components/UI/CompanyLogo.js
import React from 'react';
import { useBranding } from '../../contexts/BrandingContext';

const CompanyLogo = ({ 
  className = '', 
  size = 'default',
  showText = true,
  textClassName = '',
  ...props 
}) => {
  const { config, getCompanyName } = useBranding();
  const logo = config.logo;
  const companyName = getCompanyName('short');

  // Size variations
  const sizeClasses = {
    small: 'h-8 w-auto',
    default: 'h-10 w-auto',
    large: 'h-12 w-auto',
    xl: 'h-16 w-auto'
  };

  const textSizeClasses = {
    small: 'text-lg',
    default: 'text-xl',
    large: 'text-2xl',
    xl: 'text-3xl'
  };

  if (logo?.url) {
    return (
      <div className={`flex items-center space-x-3 ${className}`} {...props}>
        <img
          src={logo.url}
          alt={logo.alt || `${companyName} Logo`}
          className={sizeClasses[size]}
          style={{
            width: size === 'small' ? 'auto' : logo.width ? `${logo.width}px` : 'auto',
            height: size === 'small' ? '2rem' : logo.height ? `${logo.height}px` : 'auto'
          }}
        />
        {showText && (
          <span className={`font-bold text-gray-900 ${textSizeClasses[size]} ${textClassName}`}>
            {companyName}
          </span>
        )}
      </div>
    );
  }

  // Fallback to text-based logo
  return (
    <div className={`flex items-center ${className}`} {...props}>
      <div className={`flex items-center justify-center rounded-lg bg-primary-600 text-white font-bold ${
        size === 'small' ? 'h-8 w-8 text-sm' :
        size === 'default' ? 'h-10 w-10 text-lg' :
        size === 'large' ? 'h-12 w-12 text-xl' :
        'h-16 w-16 text-2xl'
      }`}>
        {companyName.charAt(0)}
      </div>
      {showText && (
        <span className={`ml-3 font-bold text-gray-900 ${textSizeClasses[size]} ${textClassName}`}>
          {companyName}
        </span>
      )}
    </div>
  );
};

export default CompanyLogo;