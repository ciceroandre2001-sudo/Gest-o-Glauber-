import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();
export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(() => localStorage.getItem('theme') !== 'light');
  const [accentColor, setAccentColor] = useState(() => localStorage.getItem('accent') || '#dc2626');

  useEffect(() => {
    localStorage.setItem('theme', isDark ? 'dark' : 'light');
    const root = document.documentElement;
    if (isDark) {
      root.style.setProperty('--color-bg-deep', '#070b14');
      root.style.setProperty('--color-bg-charcoal', '#151e2b');
      root.style.setProperty('--color-text-main', '#f8fafc');
      root.style.setProperty('--color-text-muted', '#94a3b8');
      root.style.setProperty('--glass-bg', 'rgba(21, 30, 43, 0.65)');
      root.style.setProperty('--glass-border', 'rgba(255, 255, 255, 0.08)');
    } else {
      root.style.setProperty('--color-bg-deep', '#f8fafc');
      root.style.setProperty('--color-bg-charcoal', '#ffffff');
      root.style.setProperty('--color-text-main', '#0f172a');
      root.style.setProperty('--color-text-muted', '#475569');
      root.style.setProperty('--glass-bg', 'rgba(255, 255, 255, 0.85)');
      root.style.setProperty('--glass-border', 'rgba(0, 0, 0, 0.1)');
    }
  }, [isDark]);

  useEffect(() => {
    localStorage.setItem('accent', accentColor);
    document.documentElement.style.setProperty('--color-accent-blue', accentColor);
  }, [accentColor]);

  return (
    <ThemeContext.Provider value={{ isDark, setIsDark, accentColor, setAccentColor }}>
      {children}
    </ThemeContext.Provider>
  );
};
