// src/components/UI/CompanyLogo.tsx
import React from 'react';
import { useBranding } from '../../contexts/BrandingContext';

const CompanyLogo: React.FC = () => {
  const { config } = useBranding();

  return (
    <div className="flex items-center">
      <div className="relative group">
        <img
          src={config.logo.url}
          alt={config.logo.alt}
          className="h-12 w-auto max-w-[140px] object-contain transition-all duration-300 group-hover:scale-105 drop-shadow-sm"
          onError={(e) => {
            // Fallback to a modern styled div with initials if image fails to load
            const target = e.target as HTMLImageElement;
            target.style.display = 'none';
            const fallback = target.nextElementSibling as HTMLElement;
            if (fallback) fallback.style.display = 'flex';
          }}
        />
        <div 
          className="h-12 w-auto min-w-[60px] px-4 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center text-white font-bold text-lg shadow-lg hover:shadow-xl transition-all duration-300 hidden"
          style={{ display: 'none' }}
        >
          <span className="bg-gradient-to-r from-white to-gray-100 bg-clip-text text-transparent">DBS</span>
        </div>
      </div>
    </div>
  );
};

export default CompanyLogo;
