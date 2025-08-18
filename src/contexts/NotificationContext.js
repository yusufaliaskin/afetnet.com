import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import disasterService, { DISASTER_TYPES, SEVERITY_LEVELS } from '../services/disasterService';

const NotificationContext = createContext();

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};

// Bildirim türleri
export const NOTIFICATION_TYPES = {
  SUCCESS: 'success',
  ERROR: 'error',
  WARNING: 'warning',
  INFO: 'info',
  EARTHQUAKE: 'earthquake',
  FIRE: 'fire',
  FLOOD: 'flood',
  STORM: 'storm',
  LANDSLIDE: 'landslide',
  EMERGENCY: 'emergency'
};

// Varsayılan bildirim süresi (ms)
const DEFAULT_DURATION = 5000;

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isDisasterServiceActive, setIsDisasterServiceActive] = useState(false);

  // Yeni bildirim ekleme
  const addNotification = useCallback((notification) => {
    const id = Date.now() + Math.random();
    const newNotification = {
      id,
      type: notification.type || NOTIFICATION_TYPES.INFO,
      title: notification.title,
      message: notification.message,
      duration: notification.duration || DEFAULT_DURATION,
      timestamp: new Date(),
      isRead: false,
      ...notification
    };

    setNotifications(prev => [newNotification, ...prev]);
    setUnreadCount(prev => prev + 1);

    // Otomatik silme (eğer duration belirtilmişse)
    if (newNotification.duration > 0) {
      setTimeout(() => {
        removeNotification(id);
      }, newNotification.duration);
    }

    return id;
  }, []);

  // Bildirim silme
  const removeNotification = useCallback((id) => {
    setNotifications(prev => prev.filter(notification => notification.id !== id));
  }, []);

  // Bildirimi okundu olarak işaretle
  const markAsRead = useCallback((id) => {
    setNotifications(prev => 
      prev.map(notification => 
        notification.id === id 
          ? { ...notification, isRead: true }
          : notification
      )
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
  }, []);

  // Tüm bildirimleri okundu olarak işaretle
  const markAllAsRead = useCallback(() => {
    setNotifications(prev => 
      prev.map(notification => ({ ...notification, isRead: true }))
    );
    setUnreadCount(0);
  }, []);

  // Tüm bildirimleri temizle
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Hızlı bildirim fonksiyonları
  const showSuccess = useCallback((title, message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.SUCCESS,
      title,
      message,
      ...options
    });
  }, [addNotification]);

  const showError = useCallback((title, message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.ERROR,
      title,
      message,
      duration: 0, // Hata bildirimleri manuel kapatılsın
      ...options
    });
  }, [addNotification]);

  const showWarning = useCallback((title, message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.WARNING,
      title,
      message,
      ...options
    });
  }, [addNotification]);

  const showInfo = useCallback((title, message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.INFO,
      title,
      message,
      ...options
    });
  }, [addNotification]);

  const showEarthquake = useCallback((earthquakeData, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.EARTHQUAKE,
      title: 'Deprem Bildirimi',
      message: `${earthquakeData.magnitude} büyüklüğünde deprem - ${earthquakeData.location}`,
      duration: 0, // Deprem bildirimleri manuel kapatılsın
      data: earthquakeData,
      ...options
    });
  }, [addNotification]);

  const showEmergency = useCallback((title, message, options = {}) => {
    return addNotification({
      type: NOTIFICATION_TYPES.EMERGENCY,
      title,
      message,
      duration: 0, // Acil durum bildirimleri manuel kapatılsın
      ...options
    });
  }, [addNotification]);

  // Afet bildirimi oluştur
  const showDisasterNotification = useCallback((disaster) => {
    let notificationType = NOTIFICATION_TYPES.INFO;
    let title = '';
    let message = '';

    switch (disaster.type) {
      case DISASTER_TYPES.EARTHQUAKE:
        notificationType = NOTIFICATION_TYPES.EARTHQUAKE;
        title = `${disaster.magnitude} Büyüklüğünde Deprem`;
        message = `${disaster.location} - ${disaster.description}`;
        break;
      case DISASTER_TYPES.FIRE:
        notificationType = NOTIFICATION_TYPES.FIRE;
        title = disaster.title;
        message = `${disaster.location} - Etkilenen alan: ${disaster.area}`;
        break;
      case DISASTER_TYPES.FLOOD:
        notificationType = NOTIFICATION_TYPES.FLOOD;
        title = 'Sel Felaketi';
        message = `${disaster.location} - Su seviyesi: ${disaster.waterLevel}`;
        break;
      case DISASTER_TYPES.STORM:
        notificationType = NOTIFICATION_TYPES.STORM;
        title = 'Şiddetli Fırtına';
        message = `${disaster.location} - Rüzgar hızı: ${disaster.windSpeed}`;
        break;
      case DISASTER_TYPES.LANDSLIDE:
        notificationType = NOTIFICATION_TYPES.LANDSLIDE;
        title = 'Heyelan';
        message = `${disaster.location} - Hacim: ${disaster.volume}`;
        break;
      default:
        title = 'Afet Bildirimi';
        message = disaster.description;
    }

    return addNotification({
      type: notificationType,
      title,
      message,
      duration: 0, // Afet bildirimleri manuel kapatılsın
      severity: disaster.severity,
      disasterData: disaster,
      timestamp: disaster.timestamp
    });
  }, [addNotification]);

  // Afet servisi dinleyicisi
  const handleDisasterUpdate = useCallback((disaster) => {
    showDisasterNotification(disaster);
  }, [showDisasterNotification]);

  // Afet servisi başlat/durdur
  const startDisasterService = useCallback(() => {
    if (!isDisasterServiceActive) {
      disasterService.addListener(handleDisasterUpdate);
      disasterService.startSimulation();
      setIsDisasterServiceActive(true);
    }
  }, [isDisasterServiceActive, handleDisasterUpdate]);

  const stopDisasterService = useCallback(() => {
    if (isDisasterServiceActive) {
      disasterService.removeListener(handleDisasterUpdate);
      disasterService.stopSimulation();
      setIsDisasterServiceActive(false);
    }
  }, [isDisasterServiceActive, handleDisasterUpdate]);

  // Component mount olduğunda afet servisini başlat
  useEffect(() => {
    startDisasterService();
    
    // Cleanup function
    return () => {
      stopDisasterService();
    };
  }, []);

  // Aktif afetleri getir
  const getActiveDisasters = useCallback(() => {
    return disasterService.getActiveDisasters();
  }, []);

  // Kritik afetleri getir
  const getCriticalDisasters = useCallback(() => {
    return disasterService.getCriticalDisasters();
  }, []);

  const value = {
    notifications,
    unreadCount,
    addNotification,
    removeNotification,
    markAsRead,
    markAllAsRead,
    clearAllNotifications,
    showSuccess,
    showError,
    showWarning,
    showInfo,
    showEarthquake,
    showEmergency,
    showDisasterNotification,
    startDisasterService,
    stopDisasterService,
    isDisasterServiceActive,
    getActiveDisasters,
    getCriticalDisasters
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;