// src/contexts/BrandingContext.tsx
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { getCurrentCompanyConfig, updateCompanyConfig, initializeTheme, applyColorPalette } from '../config/branding';
import { BrandingConfig } from '../types';

interface BrandingContextType {
  config: any;
  updateBranding: (newConfig: Partial<any>) => any;
  resetBranding: () => any;
  getCompanyName: (format?: 'name' | 'short' | 'full' | 'domain') => string;
  getColor: (colorType: string, shade?: number) => string;
  getThemeValue: (property: string) => string;
}

interface BrandingProviderProps {
  children: ReactNode;
}

const BrandingContext = createContext<BrandingContextType | undefined>(undefined);

export const useBranding = (): BrandingContextType => {
  const context = useContext(BrandingContext);
  if (!context) {
    throw new Error('useBranding must be used within a BrandingProvider');
  }
  return context;
};

export const BrandingProvider: React.FC<BrandingProviderProps> = ({ children }) => {
  const [config, setConfig] = useState(getCurrentCompanyConfig());

  useEffect(() => {
    // Initialize theme on component mount
    initializeTheme();
  }, []);

  const updateBranding = (newConfig: Partial<any>): any => {
    const updatedConfig = updateCompanyConfig(newConfig);
    setConfig(updatedConfig);
    applyColorPalette(updatedConfig.colors);
    return updatedConfig;
  };

  const resetBranding = (): any => {
    localStorage.removeItem('company_config');
    const defaultConfig = getCurrentCompanyConfig();
    setConfig(defaultConfig);
    initializeTheme();
    return defaultConfig;
  };

  const getCompanyName = (format: 'name' | 'short' | 'full' | 'domain' = 'name'): string => {
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

  const getColor = (colorType: string, shade: number = 600): string => {
    const colorPalette = config.colors[colorType];
    if (!colorPalette) return config.colors.primary[600];
    return colorPalette[shade] || colorPalette[600];
  };

  const getThemeValue = (property: string): string => {
    return config.theme[property] || '';
  };

  const value: BrandingContextType = {
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
