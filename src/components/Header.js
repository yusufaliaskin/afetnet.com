import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useNotification } from '../contexts/NotificationContext';

const Header = ({ 
  title, 
  showNotification = true, 
  showBackButton = false, 
  onBackPress,
  onNotificationPress,
  customLeftComponent,
  customRightComponent,
  navigation 
}) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const { unreadCount } = useNotification();

  const handleNotificationPress = () => {
    if (onNotificationPress) {
      onNotificationPress();
    } else if (navigation) {
      // NotificationsScreen'e yönlendir
      navigation.navigate('Notifications');
    } else {
      // Varsayılan bildirim davranışı
      console.log('Bildirimler açıldı');
    }
  };

  const renderLeftComponent = () => {
    if (customLeftComponent) {
      return customLeftComponent;
    }
    
    if (showBackButton) {
      return (
        <TouchableOpacity 
          style={styles.backButton}
          onPress={onBackPress}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.icon} />
        </TouchableOpacity>
      );
    }
    
    return (
      <View style={styles.headerLeft}>
        <View style={styles.logoContainer}>
          <Ionicons 
            name="shield-checkmark"
            size={24}
            color={theme.colors.primary}
          />
        </View>
        <Text style={[styles.appTitle, { color: theme.colors.text }]}>
          {title || 'Afetnet.com'}
        </Text>
      </View>
    );
  };

  const renderRightComponent = () => {
    if (customRightComponent) {
      return customRightComponent;
    }
    
    if (showNotification) {
      return (
        <View style={styles.notificationContainer}>
          <TouchableOpacity 
            style={styles.notificationButton}
            onPress={handleNotificationPress}
          >
            <Ionicons 
              name={unreadCount > 0 ? "notifications" : "notifications-outline"} 
              size={28} 
              color={unreadCount > 0 ? "#FF6B35" : theme.colors.icon} 
            />
            {unreadCount > 0 && (
              <View style={styles.badgeContainer}>
                <Text style={styles.badgeText}>
                  {unreadCount > 99 ? '99+' : unreadCount}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      );
    }
    
    return null;
  };

  return (
    <View style={[
      styles.header, 
      { 
        backgroundColor: theme.colors.cardBackground, 
        borderBottomColor: theme.colors.border 
      }
    ]}>
      {renderLeftComponent()}
      {renderRightComponent()}
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },

  appTitle: {
    fontSize: 20,
    fontWeight: '700',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  notificationContainer: {
    position: 'relative',
  },
  notificationButton: {
    padding: 4,
  },
  badgeContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: '#FF3B30',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export default Header;