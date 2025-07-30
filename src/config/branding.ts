// src/config/branding.ts
import { BrandingConfig } from '../types';

// Default branding configuration
const defaultConfig: BrandingConfig = {
  colors: {
    primary: '#2563eb',
    secondary: '#64748b',
    accent: '#3b82f6',
    background: '#f8fafc',
    text: '#1e293b',
  },
  companyName: {
    short: 'ES',
    full: 'Enterprise Search',
  },
  logo: {
    url: '/logo.svg',
    alt: 'Enterprise Search Logo',
  },
};

// Get current company configuration
export const getCurrentCompanyConfig = (): BrandingConfig => {
  try {
    const stored = localStorage.getItem('companyConfig');
    if (stored) {
      return { ...defaultConfig, ...JSON.parse(stored) };
    }
  } catch (error) {
    console.warn('Failed to load company config from localStorage:', error);
  }
  return defaultConfig;
};

// Update company configuration
export const updateCompanyConfig = (newConfig: Partial<BrandingConfig>): BrandingConfig => {
  const currentConfig = getCurrentCompanyConfig();
  const updatedConfig = { ...currentConfig, ...newConfig };
  
  try {
    localStorage.setItem('companyConfig', JSON.stringify(updatedConfig));
  } catch (error) {
    console.warn('Failed to save company config to localStorage:', error);
  }
  
  applyColorPalette(updatedConfig.colors);
  return updatedConfig;
};

// Initialize theme on app startup
export const initializeTheme = (): void => {
  const config = getCurrentCompanyConfig();
  applyColorPalette(config.colors);
};

// Apply color palette to CSS variables
export const applyColorPalette = (colors: BrandingConfig['colors']): void => {
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    root.style.setProperty('--primary-color', colors.primary);
    root.style.setProperty('--secondary-color', colors.secondary);
    root.style.setProperty('--accent-color', colors.accent);
    root.style.setProperty('--background-color', colors.background);
    root.style.setProperty('--text-color', colors.text);
  }
};
