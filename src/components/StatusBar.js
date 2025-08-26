import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar as RNStatusBar,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';

const StatusBar = ({ 
  title = 'afetnet.com', 
  showSearch = true, 
  showNotifications = true, 
  showFilter = false,
  onSearchPress, 
  onNotificationPress,
  onFilterPress,
  backgroundColor,
  textColor,
  iconColor
}) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  
  // Tema renklerini kullan
  const finalBackgroundColor = backgroundColor || theme.colors.background;
  const finalTextColor = textColor || theme.colors.text;
  const finalIconColor = iconColor || theme.colors.text;

  const styles = StyleSheet.create({
    statusBarContainer: {
      backgroundColor: finalBackgroundColor,
      paddingTop: Platform.OS === 'ios' ? 0 : RNStatusBar.currentHeight || 0,
    },
    container: {
      backgroundColor: finalBackgroundColor,
      paddingTop: insets.top,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 20,
      paddingVertical: 16,
      backgroundColor: finalBackgroundColor,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      shadowColor: theme.colors.shadow,
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.1,
      shadowRadius: 3.84,
      elevation: 5,
    },
    headerTitle: {
      fontSize: 24,
      fontWeight: '700',
      color: finalTextColor,
      letterSpacing: 0.5,
    },
    headerButtons: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerButton: {
      marginLeft: 16,
      padding: 8,
      borderRadius: 20,
      backgroundColor: theme.colors.surface,
    },
    headerButtonActive: {
      backgroundColor: theme.colors.primary,
    },
  });

  return (
    <>
      <RNStatusBar 
        barStyle={theme.isDark ? 'light-content' : 'dark-content'}
        backgroundColor={finalBackgroundColor}
        translucent={false}
      />
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{title}</Text>
          <View style={styles.headerButtons}>
            {showSearch && (
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={onSearchPress}
                activeOpacity={0.7}
              >
                <Ionicons name="search-outline" size={24} color={finalIconColor} />
              </TouchableOpacity>
            )}
            {showFilter && (
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={onFilterPress}
                activeOpacity={0.7}
              >
                <Ionicons name="filter-outline" size={24} color={finalIconColor} />
              </TouchableOpacity>
            )}
            {showNotifications && (
              <TouchableOpacity 
                style={styles.headerButton}
                onPress={onNotificationPress}
                activeOpacity={0.7}
              >
                <Ionicons name="notifications-outline" size={24} color={finalIconColor} />
              </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </>
  );
};

export default StatusBar;