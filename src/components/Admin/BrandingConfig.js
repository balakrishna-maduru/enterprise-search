// src/components/Admin/BrandingConfig.js
import React, { useState } from 'react';
import { useBranding } from '../../contexts/BrandingContext';
import { Palette, Upload, RotateCcw, Save, Eye, Settings } from 'lucide-react';

const BrandingConfig = () => {
  const { config, updateBranding, resetBranding } = useBranding();
  const [activeTab, setActiveTab] = useState('company');
  const [tempConfig, setTempConfig] = useState(config);
  const [showPreview, setShowPreview] = useState(false);

  const handleCompanyChange = (field, value) => {
    setTempConfig(prev => ({
      ...prev,
      company: {
        ...prev.company,
        [field]: value
      }
    }));
  };

  const handleColorChange = (colorType, shade, value) => {
    setTempConfig(prev => ({
      ...prev,
      colors: {
        ...prev.colors,
        [colorType]: {
          ...prev.colors[colorType],
          [shade]: value
        }
      }
    }));
  };

  const handleThemeChange = (property, value) => {
    setTempConfig(prev => ({
      ...prev,
      theme: {
        ...prev.theme,
        [property]: value
      }
    }));
  };

  const handleLogoChange = (field, value) => {
    setTempConfig(prev => ({
      ...prev,
      logo: {
        ...prev.logo,
        [field]: value
      }
    }));
  };

  const handleSave = () => {
    updateBranding(tempConfig);
    alert('Branding configuration saved successfully!');
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset to default branding?')) {
      const defaultConfig = resetBranding();
      setTempConfig(defaultConfig);
    }
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        handleLogoChange('url', e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const tabs = [
    { id: 'company', label: 'Company Info', icon: Settings },
    { id: 'logo', label: 'Logo & Assets', icon: Upload },
    { id: 'colors', label: 'Colors', icon: Palette },
    { id: 'theme', label: 'Theme', icon: Eye }
  ];

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Brand Configuration</h1>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowPreview(!showPreview)}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <Eye className="w-4 h-4" />
            <span>{showPreview ? 'Hide Preview' : 'Show Preview'}</span>
          </button>
          <button
            onClick={handleReset}
            className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset</span>
          </button>
          <button
            onClick={handleSave}
            className="flex items-center space-x-2 px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors"
          >
            <Save className="w-4 h-4" />
            <span>Save</span>
          </button>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="flex space-x-8">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => setActiveTab(id)}
              className={`flex items-center space-x-2 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === id
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{label}</span>
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="space-y-6">
        {activeTab === 'company' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Company Information</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
                <input
                  type="text"
                  value={tempConfig.company.name}
                  onChange={(e) => handleCompanyChange('name', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Short Name</label>
                <input
                  type="text"
                  value={tempConfig.company.shortName}
                  onChange={(e) => handleCompanyChange('shortName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Domain</label>
                <input
                  type="text"
                  value={tempConfig.company.domain}
                  onChange={(e) => handleCompanyChange('domain', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                <input
                  type="text"
                  value={tempConfig.company.fullName}
                  onChange={(e) => handleCompanyChange('fullName', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'logo' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Logo & Assets</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo Upload</label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg">
                  <div className="space-y-1 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="flex text-sm text-gray-600">
                      <label className="relative cursor-pointer bg-white rounded-md font-medium text-primary-600 hover:text-primary-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-primary-500">
                        <span>Upload a file</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoUpload}
                          className="sr-only"
                        />
                      </label>
                      <p className="pl-1">or drag and drop</p>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
                <div className="mt-4 space-y-2">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Logo URL</label>
                    <input
                      type="url"
                      value={tempConfig.logo.url || ''}
                      onChange={(e) => handleLogoChange('url', e.target.value)}
                      placeholder="https://example.com/logo.png"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Alt Text</label>
                    <input
                      type="text"
                      value={tempConfig.logo.alt}
                      onChange={(e) => handleLogoChange('alt', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Logo Preview</label>
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
                  {tempConfig.logo.url ? (
                    <img
                      src={tempConfig.logo.url}
                      alt={tempConfig.logo.alt}
                      className="max-h-16 w-auto"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-16 bg-gray-200 rounded text-gray-500">
                      No logo uploaded
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'colors' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Color Scheme</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Object.entries(tempConfig.colors).map(([colorType, palette]) => (
                <div key={colorType} className="space-y-2">
                  <h3 className="text-sm font-medium text-gray-700 capitalize">{colorType}</h3>
                  <div className="grid grid-cols-5 gap-1">
                    {Object.entries(palette).map(([shade, color]) => (
                      <div key={shade} className="space-y-1">
                        <div
                          className="w-8 h-8 rounded border border-gray-300 cursor-pointer"
                          style={{ backgroundColor: color }}
                          title={`${colorType}-${shade}: ${color}`}
                        />
                        <input
                          type="color"
                          value={color}
                          onChange={(e) => handleColorChange(colorType, shade, e.target.value)}
                          className="w-8 h-4 border-0 rounded cursor-pointer"
                        />
                        <div className="text-xs text-center text-gray-500">{shade}</div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'theme' && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-gray-900">Theme Variables</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(tempConfig.theme).map(([property, value]) => (
                <div key={property}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {property.replace('--', '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                  </label>
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => handleThemeChange(property, e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent font-mono text-sm"
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-y-auto p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Brand Preview</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                ×
              </button>
            </div>
            <div className="space-y-4">
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Company Information</h4>
                <p><strong>Name:</strong> {tempConfig.company.name}</p>
                <p><strong>Short Name:</strong> {tempConfig.company.shortName}</p>
                <p><strong>Domain:</strong> {tempConfig.company.domain}</p>
                <p><strong>Full Name:</strong> {tempConfig.company.fullName}</p>
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Logo Preview</h4>
                {tempConfig.logo.url ? (
                  <img
                    src={tempConfig.logo.url}
                    alt={tempConfig.logo.alt}
                    className="max-h-12 w-auto"
                  />
                ) : (
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-primary-600 text-white rounded-lg flex items-center justify-center font-bold">
                      {tempConfig.company.shortName.charAt(0)}
                    </div>
                    <span className="ml-3 font-bold text-gray-900">{tempConfig.company.shortName}</span>
                  </div>
                )}
              </div>
              <div className="p-4 border rounded-lg">
                <h4 className="font-medium text-gray-900 mb-2">Color Palette</h4>
                <div className="grid grid-cols-3 gap-4">
                  {Object.entries(tempConfig.colors).map(([colorType, palette]) => (
                    <div key={colorType}>
                      <h5 className="text-sm font-medium text-gray-700 capitalize mb-1">{colorType}</h5>
                      <div className="flex space-x-1">
                        {Object.entries(palette).slice(0, 5).map(([shade, color]) => (
                          <div
                            key={shade}
                            className="w-6 h-6 rounded border border-gray-300"
                            style={{ backgroundColor: color }}
                            title={`${colorType}-${shade}`}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BrandingConfig;