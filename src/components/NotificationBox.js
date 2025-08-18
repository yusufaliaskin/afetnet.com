import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  Dimensions,
  StyleSheet,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useNotification, NOTIFICATION_TYPES } from '../contexts/NotificationContext';

const { width: screenWidth } = Dimensions.get('window');

const NotificationBox = ({ notification, onPress, onClose }) => {
  const { theme } = useTheme();
  const slideAnim = useRef(new Animated.Value(-screenWidth)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // Giriş animasyonu
    Animated.parallel([
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      })
    ]).start();
  }, []);

  const handleClose = () => {
    // Çıkış animasyonu
    Animated.parallel([
      Animated.timing(slideAnim, {
        toValue: -screenWidth,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 0.8,
        duration: 250,
        useNativeDriver: true,
      })
    ]).start(() => {
      onClose && onClose();
    });
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return 'checkmark-circle';
      case NOTIFICATION_TYPES.ERROR:
        return 'close-circle';
      case NOTIFICATION_TYPES.WARNING:
        return 'warning';
      case NOTIFICATION_TYPES.EARTHQUAKE:
        return 'earth';
      case NOTIFICATION_TYPES.FIRE:
        return 'flame';
      case NOTIFICATION_TYPES.FLOOD:
        return 'water';
      case NOTIFICATION_TYPES.STORM:
        return 'thunderstorm';
      case NOTIFICATION_TYPES.LANDSLIDE:
        return 'triangle';
      case NOTIFICATION_TYPES.EMERGENCY:
        return 'alert-circle';
      default:
        return 'information-circle';
    }
  };

  const getNotificationColor = (type) => {
    switch (type) {
      case NOTIFICATION_TYPES.SUCCESS:
        return theme.colors.success;
      case NOTIFICATION_TYPES.ERROR:
        return theme.colors.danger;
      case NOTIFICATION_TYPES.WARNING:
        return theme.colors.warning;
      case NOTIFICATION_TYPES.EARTHQUAKE:
        return '#FF6B35';
      case NOTIFICATION_TYPES.FIRE:
        return '#FF4500';
      case NOTIFICATION_TYPES.FLOOD:
        return '#1E90FF';
      case NOTIFICATION_TYPES.STORM:
        return '#9370DB';
      case NOTIFICATION_TYPES.LANDSLIDE:
        return '#8B4513';
      case NOTIFICATION_TYPES.EMERGENCY:
        return '#DC143C';
      default:
        return theme.colors.primary;
    }
  };

  const formatTime = (timestamp) => {
    const now = new Date();
    const notificationTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - notificationTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Şimdi';
    if (diffInMinutes < 60) return `${diffInMinutes}dk önce`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}sa önce`;
    return notificationTime.toLocaleDateString('tr-TR');
  };

  const styles = StyleSheet.create({
    container: {
      position: 'absolute',
      top: Platform.OS === 'ios' ? 50 : 30,
      left: 16,
      right: 16,
      zIndex: 1000,
      elevation: 1000,
    },
    notificationBox: {
      backgroundColor: theme.colors.cardBackground,
      borderRadius: 12,
      padding: 16,
      marginBottom: 8,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 8,
      borderLeftWidth: 4,
      borderLeftColor: getNotificationColor(notification.type),
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    iconContainer: {
      width: 32,
      height: 32,
      borderRadius: 16,
      backgroundColor: getNotificationColor(notification.type) + '20',
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 12,
    },
    titleContainer: {
      flex: 1,
    },
    title: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 2,
    },
    timestamp: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    closeButton: {
      padding: 4,
      marginLeft: 8,
    },
    message: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      lineHeight: 20,
    },
    touchableArea: {
      borderRadius: 12,
    },
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          transform: [
            { translateX: slideAnim },
            { scale: scaleAnim }
          ],
          opacity: opacityAnim,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.touchableArea}
        onPress={onPress}
        activeOpacity={0.8}
      >
        <View style={styles.notificationBox}>
          <View style={styles.header}>
            <View style={styles.leftSection}>
              <View style={styles.iconContainer}>
                <Ionicons
                  name={getNotificationIcon(notification.type)}
                  size={18}
                  color={getNotificationColor(notification.type)}
                />
              </View>
              <View style={styles.titleContainer}>
                <Text style={styles.title} numberOfLines={1}>
                  {notification.title}
                </Text>
                <Text style={styles.timestamp}>
                  {formatTime(notification.timestamp)}
                </Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.closeButton}
              onPress={handleClose}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons
                name="close"
                size={18}
                color={theme.colors.textSecondary}
              />
            </TouchableOpacity>
          </View>
          {notification.message && (
            <Text style={styles.message} numberOfLines={2}>
              {notification.message}
            </Text>
          )}
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
};

export default NotificationBox;