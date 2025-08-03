// src/config/branding.ts
import { BrandingConfig } from '../types';

// DBS Brand Theme Configuration - Single source of truth
export const DBS_THEME = {
  colors: {
    primary: '#ED1C24',
    primaryDark: '#D51B23', 
    primaryLight: '#FF4444',
    secondary: '#8B0000',
    accent: '#FF6B6B',
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
      muted: '#94a3b8'
    },
    background: {
      primary: '#ffffff',
      secondary: '#f8fafc',
      accent: '#fef2f2'
    },
    border: {
      light: '#e2e8f0',
      medium: '#cbd5e1',
      dark: '#94a3b8'
    }
  },
  gradients: {
    primary: 'linear-gradient(135deg, #ED1C24 0%, #D51B23 100%)',
    header: 'linear-gradient(90deg, #ED1C24 0%, #D51B23 50%, #B91C1C 100%)',
    text: 'linear-gradient(135deg, #ED1C24 0%, #D51B23 100%)',
    glow: 'linear-gradient(90deg, rgba(237, 28, 36, 0.2) 0%, rgba(237, 28, 36, 0.4) 50%, rgba(213, 27, 35, 0.2) 100%)'
  },
  company: {
    name: 'Knowkute',
    fullName: 'Knowkute - DBS Bank Enterprise Search',
    tagline: 'DBS Bank Knowledge Platform',
    description: "DBS Bank's AI-powered knowledge discovery platform"
  },
  logo: {
    url: '/dbs-logo.svg',
    alt: 'DBS Bank Logo'
  }
} as const;

// Tailwind class generators for consistency
export const getDBSClasses = () => ({
  // Button classes
  button: {
    primary: 'bg-red-600 hover:bg-red-700 active:bg-red-800 text-white transition-all duration-200',
    secondary: 'bg-red-800 hover:bg-red-900 text-white transition-all duration-200',
    outline: 'border-2 border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-all duration-200'
  },
  // Input classes
  input: {
    base: 'border-2 border-gray-200 focus:border-red-500 focus:ring-4 focus:ring-red-500/20 transition-all duration-200',
    search: 'w-full pl-12 pr-16 py-4 text-lg border-2 border-gray-200 rounded-2xl focus:ring-4 focus:ring-red-500/20 focus:border-red-500 bg-white/80 backdrop-blur-sm shadow-lg hover:shadow-xl transition-all duration-300 placeholder-gray-400'
  },
  // Text classes
  text: {
    primary: 'text-red-600',
    secondary: 'text-red-800',
    gradient: 'bg-gradient-to-r from-red-600 via-red-700 to-red-800 bg-clip-text text-transparent',
    muted: 'text-gray-600'
  },
  // Background classes
  background: {
    primary: 'bg-red-600',
    secondary: 'bg-red-800',
    gradient: 'bg-gradient-to-r from-red-600 to-red-700',
    glow: 'bg-gradient-to-r from-red-500/20 via-red-600/20 to-red-700/20'
  },
  // Interactive states
  hover: {
    text: 'hover:text-red-600',
    background: 'hover:bg-red-600',
    scale: 'hover:scale-105'
  },
  // Loading states
  loading: {
    spinner: 'text-red-500 animate-spin',
    pulse: 'animate-pulse text-red-500'
  },
  // Avatar colors (cycle through red variations)
  avatar: ['bg-red-600', 'bg-red-700', 'bg-red-800', 'bg-red-500', 'bg-red-900']
});

// Default branding configuration using DBS theme
const defaultConfig: BrandingConfig = {
  colors: {
    primary: DBS_THEME.colors.primary,
    secondary: DBS_THEME.colors.secondary,
    accent: DBS_THEME.colors.accent,
    background: DBS_THEME.colors.background.secondary,
    text: DBS_THEME.colors.text.primary,
  },
  companyName: {
    short: DBS_THEME.company.name,
    full: DBS_THEME.company.fullName,
  },
  logo: DBS_THEME.logo,
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
  applyDBSTheme();
};

// Apply DBS theme to CSS custom properties
export const applyDBSTheme = (): void => {
  if (typeof document !== 'undefined') {
    const root = document.documentElement;
    
    // Apply DBS colors
    root.style.setProperty('--dbs-primary', DBS_THEME.colors.primary);
    root.style.setProperty('--dbs-primary-dark', DBS_THEME.colors.primaryDark);
    root.style.setProperty('--dbs-primary-light', DBS_THEME.colors.primaryLight);
    root.style.setProperty('--dbs-secondary', DBS_THEME.colors.secondary);
    root.style.setProperty('--dbs-accent', DBS_THEME.colors.accent);
    
    // Apply semantic colors
    root.style.setProperty('--primary-color', DBS_THEME.colors.primary);
    root.style.setProperty('--secondary-color', DBS_THEME.colors.secondary);
    root.style.setProperty('--accent-color', DBS_THEME.colors.accent);
  }
};

// Apply color palette to CSS variables (legacy support)
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
