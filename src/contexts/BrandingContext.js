// src/contexts/BrandingContext.js
import React, { createContext, useContext, useState, useEffect } from 'react';
import { getCurrentCompanyConfig, updateCompanyConfig, initializeTheme, applyColorPalette } from '../config/branding';

const BrandingContext = createContext();

export const useBranding = () => {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
};

export const BrandingProvider = ({ children }) => {
  const [config, setConfig] = useState(getCurrentCompanyConfig());

  useEffect(() => {
    // Initialize theme on component mount
    initializeTheme();
  }, []);

  const updateBranding = (newConfig) => {
    const updatedConfig = updateCompanyConfig(newConfig);
    setConfig(updatedConfig);
    applyColorPalette(updatedConfig.colors);
    return updatedConfig;
  };

  const resetBranding = () => {
    localStorage.removeItem('company_config');
    const defaultConfig = getCurrentCompanyConfig();
    setConfig(defaultConfig);
    initializeTheme();
    return defaultConfig;
  };

  const getCompanyName = (format = 'name') => {
    switch (format) {
      case 'short':
        return config.company.shortName;
      case 'full':
        return config.company.fullName;
      case 'domain':
        return config.company.domain;
      default:
        return config.company.name;
    }
  };

  const getColor = (colorType, shade = 600) => {
    const colorPalette = config.colors[colorType];
    if (!colorPalette) return config.colors.primary[600];
    return colorPalette[shade] || colorPalette[600];
  };

  const getThemeValue = (property) => {
    return config.theme[property] || '';
  };

  const value = {
    config,
    updateBranding,
    resetBranding,
    getCompanyName,
    getColor,
    getThemeValue
  };

  return (
    <BrandingContext.Provider value={value}>
      {children}
    </BrandingContext.Provider>
  );
};