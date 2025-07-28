// src/config/branding.js
export const defaultBranding = {
  company: {
    name: 'Test Bank',
    shortName: 'Test',
    domain: 'hcsdhiusdhfs.com',
    fullName: 'Test Bank Limited'
  },
  colors: {
    primary: {
      50: '#fef2f2',
      100: '#fee2e2',
      200: '#fecaca',
      300: '#fca5a5',
      400: '#f87171',
      500: '#ef4444',
      600: '#dc2626',
      700: '#b91c1c',
      800: '#991b1b',
      900: '#7f1d1d'
    },
    secondary: {
      50: '#f8fafc',
      100: '#f1f5f9',
      200: '#e2e8f0',
      300: '#cbd5e1',
      400: '#94a3b8',
      500: '#64748b',
      600: '#475569',
      700: '#334155',
      800: '#1e293b',
      900: '#0f172a'
    },
    accent: {
      50: '#fef7ff',
      100: '#fdf2ff',
      200: '#fce7ff',
      300: '#f8ccff',
      400: '#f0a3ff',
      500: '#e879f9',
      600: '#d946ef',
      700: '#c026d3',
      800: '#a21caf',
      900: '#86198f'
    }
  },
  logo: {
    // Can be a URL or base64 encoded image
    url: '/logo.svg',
    alt: 'Company Logo',
    width: 120,
    height: 40
  },
  favicon: {
    url: null,
    sizes: '32x32'
  },
  theme: {
    // CSS custom properties that will be injected
    '--color-primary': '#dc2626',
    '--color-primary-hover': '#b91c1c',
    '--color-primary-light': '#fee2e2',
    '--color-secondary': '#64748b',
    '--color-accent': '#d946ef',
    '--color-success': '#16a34a',
    '--color-warning': '#ca8a04',
    '--color-error': '#dc2626',
    '--color-info': '#0ea5e9',
    '--border-radius': '0.5rem',
    '--shadow': '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
  }
};

// Company-specific configurations
export const companyConfigs = {
  bank: {
    ...defaultBranding,
    company: {
      name: 'Bank',
      shortName: 'Bank',
      domain: 'dsdasfsdfsdfsd.com',
      fullName: 'Bank'
    },
    colors: {
      ...defaultBranding.colors,
      primary: {
        50: '#fef2f2',
        100: '#fee2e2',
        200: '#fecaca',
        300: '#fca5a5',
        400: '#f87171',
        500: '#ef4444',
        600: '#dc2626',
        700: '#b91c1c',
        800: '#991b1b',
        900: '#7f1d1d'
      }
    },
    theme: {
      ...defaultBranding.theme,
      '--color-primary': '#dc2626',
      '--color-primary-hover': '#b91c1c',
      '--color-primary-light': '#fee2e2'
    }
  }
};

// Get the current company configuration
export const getCurrentCompanyConfig = () => {
  // Check for environment variable first
  const companyKey = process.env.REACT_APP_COMPANY_CONFIG || 'test';
  
  // Check for localStorage override (for runtime configuration)
  const localStorageConfig = localStorage.getItem('company_config');
  if (localStorageConfig) {
    try {
      const parsed = JSON.parse(localStorageConfig);
      return { ...defaultBranding, ...parsed };
    } catch (e) {
      console.warn('Invalid company config in localStorage, falling back to default');
    }
  }
  
  // Return predefined config or default
  return companyConfigs[companyKey] || defaultBranding;
};

// Update company configuration at runtime
export const updateCompanyConfig = (newConfig) => {
  const currentConfig = getCurrentCompanyConfig();
  const updatedConfig = { ...currentConfig, ...newConfig };
  localStorage.setItem('company_config', JSON.stringify(updatedConfig));
  
  // Apply theme variables to document
  applyThemeVariables(updatedConfig.theme);
  
  return updatedConfig;
};

// Apply CSS custom properties to the document
export const applyThemeVariables = (theme) => {
  const root = document.documentElement;
  Object.entries(theme).forEach(([property, value]) => {
    root.style.setProperty(property, value);
  });
};

// Apply color palette to CSS custom properties
export const applyColorPalette = (colors) => {
  const root = document.documentElement;
  
  Object.entries(colors).forEach(([colorType, palette]) => {
    Object.entries(palette).forEach(([shade, color]) => {
      root.style.setProperty(`--color-${colorType}-${shade}`, color);
    });
  });
};

// Initialize theme on app start
export const initializeTheme = () => {
  const config = getCurrentCompanyConfig();
  applyThemeVariables(config.theme);
  applyColorPalette(config.colors);
  
  // Set favicon if provided
  if (config.favicon?.url) {
    const favicon = document.querySelector('link[rel="icon"]') || document.createElement('link');
    favicon.rel = 'icon';
    favicon.href = config.favicon.url;
    favicon.sizes = config.favicon.sizes;
    if (!document.querySelector('link[rel="icon"]')) {
      document.head.appendChild(favicon);
    }
  }
  
  // Set page title
  document.title = `${config.company.name} Enterprise Search`;
};