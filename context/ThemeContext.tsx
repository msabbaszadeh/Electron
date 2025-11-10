import React, { createContext, useContext, useState, useMemo, useEffect } from 'react';

// Define the available themes
export const themes = {
  dark: {
    name: 'Dark',
    colors: {
      // Main backgrounds
      background: 'bg-slate-950',
      sidebarBackground: 'bg-slate-900',
      sessionManagerBackground: 'bg-slate-800/95',
      mainContentBg: 'bg-slate-900',
      
      // Component backgrounds
      componentBg: 'bg-slate-800/50',
      componentBgSolid: 'bg-slate-800',
      componentBgHover: 'bg-slate-700',
      componentBgActive: 'bg-slate-700',
      
      // Interactive elements
      primary: 'bg-teal-600',
      primaryHover: 'bg-teal-700',
      secondary: 'bg-slate-800',
      secondaryHover: 'bg-slate-700',
      accent: 'bg-pink-500',
      
      // UI States
      selected: 'bg-slate-700',
      hover: 'bg-slate-800/50',
      border: 'border-slate-700/50',
      borderStrong: 'border-slate-700',
      
      // Text colors
      text: 'text-slate-200',
      textSecondary: 'text-slate-400',
      textHover: 'text-white',
      textPrimary: 'text-teal-300',
      
      // Status colors
      success: 'bg-green-900/30',
      successText: 'text-green-300',
      successBorder: 'border-green-700/50',
      error: 'bg-red-900/30',
      errorText: 'text-red-300',
      
      // Input elements
      inputBg: 'bg-slate-800',
      inputBorder: 'border-slate-700',
      inputFocus: 'focus:ring-teal-500',
      
      // Modal/Overlay
      modalBg: 'bg-slate-800 bg-opacity-80',
      modalBorder: 'border-slate-700',
      overlay: 'bg-black bg-opacity-50',
    }
  },
  light: {
    name: 'Light',
    colors: {
      // Main backgrounds
      background: 'bg-white',
      sidebarBackground: 'bg-slate-100',
      sessionManagerBackground: 'bg-slate-200/95',
      mainContentBg: 'bg-slate-50',
      
      // Component backgrounds
      componentBg: 'bg-slate-100',
      componentBgSolid: 'bg-slate-200',
      componentBgHover: 'bg-slate-300',
      componentBgActive: 'bg-slate-300',
      
      // Interactive elements
      primary: 'bg-blue-600',
      primaryHover: 'bg-blue-700',
      secondary: 'bg-slate-200',
      secondaryHover: 'bg-slate-300',
      accent: 'bg-pink-500',
      
      // UI States
      selected: 'bg-slate-300',
      hover: 'bg-slate-200/50',
      border: 'border-slate-300',
      borderStrong: 'border-slate-400',
      
      // Text colors
      text: 'text-slate-800',
      textSecondary: 'text-slate-600',
      textHover: 'text-slate-900',
      textPrimary: 'text-blue-600',
      
      // Status colors
      success: 'bg-green-100',
      successText: 'text-green-700',
      successBorder: 'border-green-300',
      error: 'bg-red-100',
      errorText: 'text-red-700',
      
      // Input elements
      inputBg: 'bg-white',
      inputBorder: 'border-slate-300',
      inputFocus: 'focus:ring-blue-500',
      
      // Modal/Overlay
      modalBg: 'bg-white bg-opacity-90',
      modalBorder: 'border-slate-300',
      overlay: 'bg-black bg-opacity-50',
    }
  },
  ocean: {
    name: 'Ocean',
    colors: {
      // Main backgrounds
      background: 'bg-cyan-950',
      sidebarBackground: 'bg-cyan-900',
      sessionManagerBackground: 'bg-cyan-800/95',
      mainContentBg: 'bg-cyan-900',
      
      // Component backgrounds
      componentBg: 'bg-cyan-800/50',
      componentBgSolid: 'bg-cyan-800',
      componentBgHover: 'bg-cyan-700',
      componentBgActive: 'bg-cyan-700',
      
      // Interactive elements
      primary: 'bg-cyan-600',
      primaryHover: 'bg-cyan-700',
      secondary: 'bg-cyan-800',
      secondaryHover: 'bg-cyan-700',
      accent: 'bg-rose-400',
      
      // UI States
      selected: 'bg-cyan-700',
      hover: 'bg-cyan-800/50',
      border: 'border-cyan-700/50',
      borderStrong: 'border-cyan-600',
      
      // Text colors
      text: 'text-cyan-50',
      textSecondary: 'text-cyan-200',
      textHover: 'text-white',
      textPrimary: 'text-cyan-300',
      
      // Status colors
      success: 'bg-green-900/30',
      successText: 'text-green-300',
      successBorder: 'border-green-700/50',
      error: 'bg-red-900/30',
      errorText: 'text-red-300',
      
      // Input elements
      inputBg: 'bg-cyan-800',
      inputBorder: 'border-cyan-700',
      inputFocus: 'focus:ring-cyan-500',
      
      // Modal/Overlay
      modalBg: 'bg-cyan-800 bg-opacity-80',
      modalBorder: 'border-cyan-700',
      overlay: 'bg-black bg-opacity-50',
    }
  }
};

export type ThemeName = keyof typeof themes;

interface ThemeContextType {
  theme: ThemeName;
  setTheme: (theme: ThemeName) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setTheme] = useState<ThemeName>('dark');

  useEffect(() => {
    const storedTheme = localStorage.getItem('theme') as ThemeName;
    if (storedTheme && themes[storedTheme]) {
      setTheme(storedTheme);
    }
  }, []);

  const handleSetTheme = (newTheme: ThemeName) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.className = newTheme; // Add theme name to html tag
  };

  const value = useMemo(() => ({ theme, setTheme: handleSetTheme }), [theme]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return { ...context, themes };
};