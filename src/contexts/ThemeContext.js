import React, { createContext, useContext, useState, useEffect } from 'react';
import { Appearance } from 'react-native';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Varsayılan tema beyaz (açık tema) olarak ayarlandı
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Sistem teması takibi kaldırıldı - kullanıcı manuel olarak değiştirebilir
  // useEffect(() => {
  //   const colorScheme = Appearance.getColorScheme();
  //   setIsDarkMode(colorScheme === 'dark');

  //   const subscription = Appearance.addChangeListener(({ colorScheme }) => {
  //     setIsDarkMode(colorScheme === 'dark');
  //   });

  //   return () => subscription?.remove();
  // }, []);

  const toggleTheme = () => {
    setIsDarkMode(!isDarkMode);
  };

  const theme = {
    isDarkMode,
    colors: {
      // Background colors
      background: isDarkMode ? '#000000' : '#FFFFFF',
      secondaryBackground: isDarkMode ? '#1C1C1E' : '#F2F2F7',
      cardBackground: isDarkMode ? '#2C2C2E' : '#FFFFFF',
      
      // Text colors
      text: isDarkMode ? '#FFFFFF' : '#000000',
      secondaryText: isDarkMode ? '#EBEBF5' : '#8E8E93',
      tertiaryText: isDarkMode ? '#EBEBF599' : '#C7C7CC',
      
      // UI colors
      primary: isDarkMode ? '#007AFF' : '#007AFF',
      onPrimary: '#FFFFFF',
      surface: isDarkMode ? '#1C1C1E' : '#F2F2F7',
      success: isDarkMode ? '#34C759' : '#34C759',
      warning: isDarkMode ? '#FF9500' : '#FF9500',
      danger: isDarkMode ? '#FF3B30' : '#FF3B30',
      
      // Border colors
      border: isDarkMode ? '#38383A' : '#E5E5EA',
      separator: isDarkMode ? '#38383A' : '#C6C6C8',
      
      // Switch colors
      switchTrackOn: isDarkMode ? '#000000' : '#000000', // Siyah renk
      switchTrackOff: isDarkMode ? '#39393D' : '#E5E5EA',
      switchThumb: '#FFFFFF',
      
      // Icon colors
      icon: isDarkMode ? '#EBEBF5' : '#8E8E93',
      activeIcon: isDarkMode ? '#007AFF' : '#007AFF',
    },
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme, isDarkMode }}>
      {children}
    </ThemeContext.Provider>
  );
};