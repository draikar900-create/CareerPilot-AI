import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // themeMode: 'light' | 'dark' | 'system'
  const [themeMode, setThemeMode] = useState(() => {
    const savedMode = localStorage.getItem('cp_theme_mode');
    if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
      return savedMode;
    }
    const legacySaved = localStorage.getItem('cp_theme');
    if (legacySaved && ['light', 'dark'].includes(legacySaved)) {
      return legacySaved;
    }
    return 'dark'; // Dark mode default for high-tech aesthetic
  });

  // Calculate resolved theme based on mode
  const getResolvedTheme = (mode) => {
    if (mode === 'system') {
      if (typeof window !== 'undefined' && window.matchMedia) {
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      }
      return 'dark';
    }
    return mode === 'light' ? 'light' : 'dark';
  };

  const [resolvedTheme, setResolvedTheme] = useState(() => getResolvedTheme(themeMode));

  useEffect(() => {
    const active = getResolvedTheme(themeMode);
    setResolvedTheme(active);

    const root = document.documentElement;
    if (active === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    localStorage.setItem('cp_theme', active);
    localStorage.setItem('cp_theme_mode', themeMode);

    // If system default, listen to OS theme changes
    if (themeMode === 'system' && typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
      const listener = (e) => {
        const sysTheme = e.matches ? 'dark' : 'light';
        setResolvedTheme(sysTheme);
        if (sysTheme === 'dark') {
          root.classList.add('dark');
        } else {
          root.classList.remove('dark');
        }
      };

      mediaQuery.addEventListener('change', listener);
      return () => mediaQuery.removeEventListener('change', listener);
    }
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode((prev) => {
      const current = prev === 'system' ? resolvedTheme : prev;
      return current === 'dark' ? 'light' : 'dark';
    });
  };

  const setTheme = (mode) => {
    setThemeMode(mode);
  };

  return (
    <ThemeContext.Provider
      value={{
        theme: resolvedTheme,
        themeMode,
        setTheme,
        setThemeMode,
        toggleTheme,
        isDark: resolvedTheme === 'dark'
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
}
