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
        return config.companyName.short;
      case 'full':
        return config.companyName.full;
      case 'domain':
        return 'enterprise-search.com'; // Default domain since it's not in the config
      default:
        return config.companyName.full;
    }
  };

  const getColor = (colorType: string, shade: number = 600): string => {
    const colorValue = config.colors[colorType as keyof typeof config.colors];
    return colorValue || config.colors.primary;
  };

  const getThemeValue = (property: string): string => {
    // Since we don't have a theme object anymore, map common properties to colors
    const themeMap: Record<string, string> = {
      'primary': config.colors.primary,
      'secondary': config.colors.secondary,
      'accent': config.colors.accent,
      'background': config.colors.background,
      'text': config.colors.text,
    };
    return themeMap[property] || config.colors.primary;
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
