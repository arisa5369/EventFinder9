import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

const STORAGE_KEY = '@spoton:darkMode';

export function ThemeProvider({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadTheme();
  }, []);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(STORAGE_KEY);
      if (savedTheme !== null) {
        setIsDarkMode(JSON.parse(savedTheme));
      }
    } catch (error) {
      console.error('Error loading theme:', error);
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = async (value) => {
    setIsDarkMode(value);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const theme = {
    isDarkMode,
    toggleTheme,
    colors: isDarkMode
      ? {
          background: '#151718',
          surface: '#1f1f1f',
          text: '#ECEDEE',
          textSecondary: '#9BA1A6',
          border: '#2a2a2a',
          primary: '#0a7ea4',
          card: '#1f1f1f',
        }
      : {
          background: '#f2f4f8',
          surface: '#fff',
          text: '#222',
          textSecondary: '#666',
          border: '#e0e0e0',
          primary: '#0a7ea4',
          card: '#fff',
        },
  };

  return (
    <ThemeContext.Provider value={theme}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
