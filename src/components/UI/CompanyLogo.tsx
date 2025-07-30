// src/components/UI/CompanyLogo.tsx
import React from 'react';
import { useBranding } from '../../contexts/BrandingContext';

const CompanyLogo: React.FC = () => {
  const { config } = useBranding();

  return (
    <div className="flex items-center">
      <img
        src={config.logo.url}
        alt={config.logo.alt}
        className="h-8 w-8"
        onError={(e) => {
          // Fallback to a simple div with initials if image fails to load
          const target = e.target as HTMLImageElement;
          target.style.display = 'none';
          const fallback = target.nextElementSibling as HTMLElement;
          if (fallback) fallback.style.display = 'flex';
        }}
      />
      <div 
        className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-sm hidden"
        style={{ display: 'none' }}
      >
        ES
      </div>
    </div>
  );
};

export default CompanyLogo;
