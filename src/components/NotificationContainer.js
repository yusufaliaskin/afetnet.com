import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useNotification } from '../contexts/NotificationContext';
import NotificationBox from './NotificationBox';

const NotificationContainer = () => {
  const { notifications, removeNotification, markAsRead } = useNotification();

  // Sadece son 3 bildirimi göster (performans için)
  const visibleNotifications = notifications.slice(0, 3);

  const handleNotificationPress = (notification) => {
    // Bildirimi okundu olarak işaretle
    markAsRead(notification.id);
    
    // Bildirim türüne göre özel işlemler yapılabilir
    if (notification.onPress) {
      notification.onPress(notification);
    }
  };

  const handleNotificationClose = (notificationId) => {
    removeNotification(notificationId);
  };

  if (visibleNotifications.length === 0) {
    return null;
  }

  return (
    <View style={styles.container}>
      {visibleNotifications.map((notification, index) => (
        <View
          key={notification.id}
          style={[styles.notificationWrapper, { zIndex: 1000 - index }]}
        >
          <NotificationBox
            notification={notification}
            onPress={() => handleNotificationPress(notification)}
            onClose={() => handleNotificationClose(notification.id)}
          />
        </View>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    pointerEvents: 'box-none',
  },
  notificationWrapper: {
    position: 'relative',
    marginBottom: 8,
  },
});

export default NotificationContainer;