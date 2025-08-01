// src/hooks/useDBSTheme.ts
import { useMemo } from 'react';
import { DBS_THEME, getDBSClasses } from '../config/branding';

export const useDBSTheme = () => {
  const classes = useMemo(() => getDBSClasses(), []);
  
  return {
    // Theme configuration
    theme: DBS_THEME,
    
    // Pre-built class combinations
    classes,
    
    // Utility functions
    getButtonClass: (variant: 'primary' | 'secondary' | 'outline' = 'primary') => 
      classes.button[variant],
    
    getInputClass: (variant: 'base' | 'search' = 'base') => 
      classes.input[variant],
    
    getTextClass: (variant: 'primary' | 'secondary' | 'gradient' | 'muted' = 'primary') => 
      classes.text[variant],
    
    getBackgroundClass: (variant: 'primary' | 'secondary' | 'gradient' | 'glow' = 'primary') => 
      classes.background[variant],
    
    getAvatarClass: (index: number = 0) => 
      classes.avatar[index % classes.avatar.length],
    
    // Company information
    company: {
      name: DBS_THEME.company.name,
      fullName: DBS_THEME.company.fullName,
      tagline: DBS_THEME.company.tagline,
      description: DBS_THEME.company.description
    },
    
    // Logo information
    logo: DBS_THEME.logo,
    
    // Color values (for dynamic styles)
    colors: DBS_THEME.colors
  };
};

export default useDBSTheme;
