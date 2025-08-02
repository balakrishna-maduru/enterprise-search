// src/components/Layout/Footer.tsx
import React from 'react';
import { useBranding } from '../../contexts/BrandingContext';

interface FooterProps {
  className?: string;
}

export const Footer: React.FC<FooterProps> = ({ className = "" }) => {
  const { config, getCompanyName } = useBranding();
  const currentYear = new Date().getFullYear();
  const companyName = getCompanyName('full');

  return (
    <footer className={`bg-gray-50 border-t border-gray-200 mt-auto ${className}`}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Company Info */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              {config?.logoUrl && (
                <img 
                  src={config.logoUrl} 
                  alt={companyName || 'Company Logo'} 
                  className="h-8 w-auto"
                />
              )}
              <h3 className="text-lg font-semibold text-gray-800">
                {companyName || 'Enterprise Search'}
              </h3>
            </div>
            <p className="text-sm text-gray-600 max-w-sm">
              Powerful enterprise search platform connecting you to the information that matters most.
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
              Quick Links
            </h4>
            <div className="space-y-2">
              <a href="/" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                Search
              </a>
              <a href="/employees" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                People Directory
              </a>
              <a href="/documents" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                Documents
              </a>
              <a href="/help" className="block text-sm text-gray-600 hover:text-blue-600 transition-colors">
                Help & Support
              </a>
            </div>
          </div>

          {/* System Info */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-gray-800 uppercase tracking-wide">
              System Status
            </h4>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Search Service Online</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Employee Directory</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-600">Document Repository</span>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-6">
              <p className="text-sm text-gray-500">
                © {currentYear} {companyName || 'Enterprise Search'}. All rights reserved.
              </p>
            </div>
            
            <div className="flex items-center gap-6">
              <span className="text-xs text-gray-400">
                v1.0.0
              </span>
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-pulse"></div>
                <span className="text-xs text-gray-500">Live</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
