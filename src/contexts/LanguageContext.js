import React, { createContext, useContext, useState } from 'react';

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

const translations = {
  tr: {
    // Header
    appName: 'AfetLink',
    
    // Home Screen
    emergencySituations: 'Acil Durumlar',
    shareInformation: 'Bilgi Paylaş',
    shareInformationDesc: 'Acil durum bilgisi paylaş',
    communityUpdates: 'Topluluk Güncellemeleri',
    earthquake: 'Deprem',
    fire: 'Yangın',
    forestFire: 'Orman Yangını Uyarısı',
    minutesAgo: 'dakika önce',
    hoursAgo: 'saat önce',
    
    // Profile Screen
    profile: 'Profil',
    totalShares: 'Toplam Paylaşım',
    familyMembers: 'Aile Üyeleri',
    safe: 'Güvenli',
    unknown: 'Bilinmiyor',
    wife: 'Eş',
    son: 'Oğul',
    mother: 'Anne',
    safetyStatus: 'Güvenlik Durumu',
    lastUpdate: 'Son Güncelleme',
    emergencyAlert: 'Acil Durum Bildirimi',
    sendAlert: 'Bildirim Gönder',
      viewAll: 'Tümünü Gör',
      addMember: 'Ekle',
      
      // Map Screen
      map: 'Harita',
      comingSoon: 'Bu özellik yakında kullanıma sunulacak',
      
      // Rasathane Screen
      rasathane: 'Rasathane',
      searchLocation: 'Konum ara...',
      magnitude: 'Büyüklük',
      earthquake: 'Deprem',
      location: 'Konum',
      distance: 'Uzaklık',
      time: 'Zaman',
      source: 'Kaynak',
      severity: 'Şiddet',
      low: 'Düşük',
      medium: 'Orta',
      high: 'Büyük',
      all: 'Tümü',
      ok: 'Tamam',
      details: 'Detaylar',
      earthquakeDetails: 'Deprem Detayları',
      dataSource: 'Veri Kaynağı',
      severityLevel: 'Şiddet Seviyesi',
      moreInfo: 'Bu deprem hakkında daha fazla bilgi için yerel otoritelere başvurun.',
    call: 'Ara',
    message: 'Mesaj',
    addFamilyMember: 'Aile Üyesi Ekle',
    
    // Settings Screen
    settings: 'Ayarlar',
    general: 'Genel',
    notifications: 'Bildirimler',
    privacySecurity: 'Gizlilik ve Güvenlik',
    support: 'Destek',
    
    // General Settings
    darkMode: 'Karanlık Mod',
    darkModeDesc: 'Koyu tema kullan',
    language: 'Dil',
    
    // Notification Settings
    emergencyNotifications: 'Acil Durum Bildirimleri',
    emergencyNotificationsDesc: 'Afet ve acil durum uyarıları',
    familyNotifications: 'Aile Bildirimleri',
    familyNotificationsDesc: 'Aile üyelerinden gelen bildirimler',
    communityNotifications: 'Topluluk Bildirimleri',
    communityNotificationsDesc: 'Paylaşım ve yorumlar',
    soundNotifications: 'Ses Bildirimleri',
    soundNotificationsDesc: 'Bildirim sesleri',
    
    // Privacy & Security Settings
    locationSharing: 'Konum Paylaşımı',
    locationSharingDesc: 'Aile üyeleriyle konum paylaş',
    profileVisibility: 'Profil Görünürlüğü',
    profileVisibilityDesc: 'Profilini diğer kullanıcılara göster',
    dataCollection: 'Veri Toplama',
    dataCollectionDesc: 'Hizmet iyileştirme için veri kullanımı',
    
    // Support Settings
    helpCenter: 'Yardım Merkezi',
    about: 'Hakkında',
    privacyPolicy: 'Gizlilik Politikası',
    termsOfUse: 'Kullanım Şartları',
    
    // Language Selection
    selectLanguage: 'Dil Seçin',
    turkish: 'Türkçe',
    english: 'English',
    
    // Version Info
    version: 'AfetLink v1.0.0',
    copyright: '© 2024 AfetLink. Tüm hakları saklıdır.',
  },
  en: {
    // Header
    appName: 'AfetLink',
    
    // Home Screen
    emergencySituations: 'Emergency Situations',
    shareInformation: 'Share Information',
    shareInformationDesc: 'Share emergency information',
    communityUpdates: 'Community Updates',
    earthquake: 'Earthquake',
    fire: 'Fire',
    forestFire: 'Forest Fire Alert',
    minutesAgo: 'minutes ago',
    hoursAgo: 'hours ago',
    
    // Profile Screen
    profile: 'Profile',
    totalShares: 'Total Shares',
    familyMembers: 'Family Members',
    safe: 'Safe',
    unknown: 'Unknown',
    wife: 'Wife',
    son: 'Son',
    mother: 'Mother',
    safetyStatus: 'Safety Status',
    lastUpdate: 'Last Update',
    emergencyAlert: 'Emergency Alert',
    sendAlert: 'Send Alert',
    viewAll: 'View All',
    addMember: 'Add',
    
    // Map Screen
      map: 'Map',
      comingSoon: 'This feature will be available soon',
      
      // Rasathane Screen
      rasathane: 'Observatory',
      searchLocation: 'Search location...',
      magnitude: 'Magnitude',
      earthquake: 'Earthquake',
      location: 'Location',
      distance: 'Distance',
      time: 'Time',
      source: 'Source',
      severity: 'Severity',
      low: 'Low',
      medium: 'Medium',
      high: 'High',
      all: 'All',
      ok: 'OK',
      details: 'Details',
      earthquakeDetails: 'Earthquake Details',
      dataSource: 'Data Source',
      severityLevel: 'Severity Level',
      moreInfo: 'For more information about this earthquake, contact local authorities.',
    call: 'Call',
    message: 'Message',
    addFamilyMember: 'Add Family Member',
    
    // Settings Screen
    settings: 'Settings',
    general: 'General',
    notifications: 'Notifications',
    privacySecurity: 'Privacy & Security',
    support: 'Support',
    
    // General Settings
    darkMode: 'Dark Mode',
    darkModeDesc: 'Use dark theme',
    language: 'Language',
    
    // Notification Settings
    emergencyNotifications: 'Emergency Notifications',
    emergencyNotificationsDesc: 'Disaster and emergency alerts',
    familyNotifications: 'Family Notifications',
    familyNotificationsDesc: 'Notifications from family members',
    communityNotifications: 'Community Notifications',
    communityNotificationsDesc: 'Posts and comments',
    soundNotifications: 'Sound Notifications',
    soundNotificationsDesc: 'Notification sounds',
    
    // Privacy & Security Settings
    locationSharing: 'Location Sharing',
    locationSharingDesc: 'Share location with family members',
    profileVisibility: 'Profile Visibility',
    profileVisibilityDesc: 'Show your profile to other users',
    dataCollection: 'Data Collection',
    dataCollectionDesc: 'Data usage for service improvement',
    
    // Support Settings
    helpCenter: 'Help Center',
    about: 'About',
    privacyPolicy: 'Privacy Policy',
    termsOfUse: 'Terms of Use',
    
    // Language Selection
    selectLanguage: 'Select Language',
    turkish: 'Türkçe',
    english: 'English',
    
    // Version Info
    version: 'AfetLink v1.0.0',
    copyright: '© 2024 AfetLink. All rights reserved.',
  },
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState('tr');

  const changeLanguage = (languageCode) => {
    setCurrentLanguage(languageCode);
  };

  const t = (key) => {
    return translations[currentLanguage][key] || key;
  };

  const availableLanguages = [
    { code: 'tr', name: 'Türkçe', nativeName: 'Türkçe' },
    { code: 'en', name: 'English', nativeName: 'English' },
  ];

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        language: currentLanguage,
        changeLanguage,
        t,
        availableLanguages,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};