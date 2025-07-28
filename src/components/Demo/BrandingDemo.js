// src/components/Demo/BrandingDemo.js
import React, { useState } from 'react';
import { useBranding } from '../../contexts/BrandingContext';
import CompanyLogo from '../UI/CompanyLogo';
import BrandingConfig from '../Admin/BrandingConfig';
import { Settings, Eye, X } from 'lucide-react';

const BrandingDemo = () => {
  const { config, getCompanyName, getColor } = useBranding();
  const [showConfig, setShowConfig] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Branding Demo</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Settings className="w-4 h-4" />
            <span>Configure Branding</span>
          </button>
        </div>
      </div>

      {/* Current Configuration Display */}
      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Current Configuration</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Company Information</h4>
            <div className="space-y-2 text-sm">
              <p><strong>Name:</strong> {config.company.name}</p>
              <p><strong>Short Name:</strong> {config.company.shortName}</p>
              <p><strong>Domain:</strong> {config.company.domain}</p>
              <p><strong>Full Name:</strong> {config.company.fullName}</p>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Logo</h4>
            <CompanyLogo size="large" />
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-700 mb-2">Color Palette</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(config.colors).map(([colorType, palette]) => (
              <div key={colorType} className="space-y-2">
                <h5 className="text-sm font-medium text-gray-600 capitalize">{colorType}</h5>
                <div className="flex space-x-1">
                  {Object.entries(palette).slice(0, 9).map(([shade, color]) => (
                    <div
                      key={shade}
                      className="w-8 h-8 rounded border border-gray-300 flex items-center justify-center text-xs font-medium text-white"
                      style={{ backgroundColor: color }}
                      title={`${colorType}-${shade}: ${color}`}
                    >
                      {shade}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Component Examples */}
      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Component Examples</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Buttons</h4>
            <div className="space-y-2">
              <button className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors">
                Primary Button
              </button>
              <button className="px-4 py-2 bg-secondary-600 text-white rounded-lg hover:bg-secondary-700 transition-colors">
                Secondary Button
              </button>
              <button className="px-4 py-2 bg-accent-600 text-white rounded-lg hover:bg-accent-700 transition-colors">
                Accent Button
              </button>
            </div>
          </div>
          
          <div>
            <h4 className="font-medium text-gray-700 mb-2">Cards</h4>
            <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
              <h5 className="font-medium text-primary-900">Primary Card</h5>
              <p className="text-primary-700 text-sm mt-1">
                This card uses the primary color scheme
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Environment Variables Example */}
      <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
        <h3 className="text-lg font-semibold text-gray-900">Environment Configuration</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-medium text-gray-700 mb-2">To configure for different companies:</h4>
          <div className="space-y-2 text-sm font-mono">
            <p># Set environment variable:</p>
            <p className="text-blue-600">REACT_APP_COMPANY_CONFIG=bank</p>
            <br />
            <p># Or use runtime configuration via localStorage:</p>
            <p className="text-green-600">localStorage.setItem('company_config', JSON.stringify(customConfig))</p>
          </div>
        </div>
      </div>

      {/* Configuration Modal */}
      {showConfig && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-6xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-4 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">Brand Configuration</h3>
              <button
                onClick={() => setShowConfig(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              <BrandingConfig />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandingDemo;