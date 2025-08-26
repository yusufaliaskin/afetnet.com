import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import StatusBar from '../components/StatusBar';

const NotificationsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = Dimensions.get('window');
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  
  const [activeTab, setActiveTab] = useState('all');
  
  // Notification data
  const [notificationsData] = useState([
    {
      id: 1,
      type: 'earthquake',
      title: 'AFAD',
      subtitle: language === 'tr' ? 'Deprem uyarısı güncellendi' : 'Earthquake alert updated',
      description: language === 'tr' ? 'En son haberleri gör' : 'see latest news',
      time: language === 'tr' ? '15 dakika önce' : '15 mins ago',
      image: 'https://via.placeholder.com/50x50/FF6B35/FFFFFF?text=AFAD',
      category: 'Today'
    },
    {
      id: 2,
      type: 'flood',
      title: 'Meteoroloji',
      subtitle: language === 'tr' ? 'Sel uyarısı güncellendi' : 'Flood alert updated',
      description: language === 'tr' ? 'En son haberleri gör' : 'see latest news',
      time: language === 'tr' ? '1 saat önce' : '1 hour ago',
      image: 'https://via.placeholder.com/50x50/4A90E2/FFFFFF?text=MET',
      category: 'Today'
    },
    {
      id: 3,
      type: 'fire',
      title: 'Orman Bakanlığı',
      subtitle: language === 'tr' ? 'Yangın uyarısı güncellendi' : 'Fire alert updated',
      description: language === 'tr' ? 'En son haberleri gör' : 'see latest news',
      time: language === 'tr' ? '26 Nisan' : '26 April',
      image: 'https://via.placeholder.com/50x50/FF3B30/FFFFFF?text=OGM',
      category: 'Yesterday'
    },
    {
      id: 4,
      type: 'user',
      title: 'Ahmet Yılmaz',
      subtitle: language === 'tr' ? 'Sizi bir gönderide etiketledi' : 'Just tagged you on a post',
      description: language === 'tr' ? 'görmek için' : 'see it',
      time: language === 'tr' ? '26 Nisan' : '26 April',
      image: 'https://via.placeholder.com/50x50/34C759/FFFFFF?text=AY',
      category: 'Yesterday'
    },
    {
      id: 5,
      type: 'landslide',
      title: 'Jeoloji Mühendisleri',
      subtitle: language === 'tr' ? 'Heyelan uyarısı güncellendi' : 'Landslide alert updated',
      description: language === 'tr' ? 'En son haberleri gör' : 'see latest news',
      time: language === 'tr' ? '26 Nisan' : '26 April',
      image: 'https://via.placeholder.com/50x50/8B4513/FFFFFF?text=JMO',
      category: 'Yesterday'
    },
    {
      id: 6,
      type: 'user',
      title: 'Ayşe Demir',
      subtitle: language === 'tr' ? 'Sizi bir gönderide etiketledi' : 'Just tagged you on a post',
      description: language === 'tr' ? 'görmek için' : 'see it',
      time: language === 'tr' ? '22 Nisan' : '22 April',
      image: 'https://via.placeholder.com/50x50/9B59B6/FFFFFF?text=AD',
      category: 'A few days ago'
    }
  ]);
  
  const tabs = [
    { id: 'all', title: language === 'tr' ? 'Tümü' : 'All' },
    { id: 'news', title: language === 'tr' ? 'Haberler' : 'News' },
    { id: 'tags', title: language === 'tr' ? 'Etiketler' : 'Tags' },
    { id: 'replies', title: language === 'tr' ? 'Yanıtlar' : 'Replies' }
  ];
  
  const getFilteredNotifications = () => {
    switch (activeTab) {
      case 'news':
        return notificationsData.filter(n => ['earthquake', 'flood', 'fire', 'landslide'].includes(n.type));
      case 'tags':
        return notificationsData.filter(n => n.type === 'user');
      case 'replies':
        return [];
      default:
        return notificationsData;
    }
  };
  
  const groupNotificationsByCategory = (notifications) => {
    const grouped = {};
    notifications.forEach(notification => {
      const category = notification.category;
      if (!grouped[category]) {
        grouped[category] = [];
      }
      grouped[category].push(notification);
    });
    return grouped;
  };
  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },

    tabContainer: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.colors.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    tabButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      marginRight: 8,
      borderRadius: 20,
      backgroundColor: 'transparent',
    },
    activeTabButton: {
      backgroundColor: theme.colors.primary,
    },
    tabText: {
      fontSize: 14,
      fontWeight: '500',
      color: theme.colors.secondaryText,
    },
    activeTabText: {
      color: '#FFFFFF',
    },
    activeTabIndicator: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.colors.primary,
      alignSelf: 'center',
      marginTop: 4,
    },
    scrollView: {
      flex: 1,
    },
    categorySection: {
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    categoryTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.secondaryText,
      marginBottom: 12,
      textAlign: 'center',
    },
    notificationItem: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 12,
      paddingHorizontal: 16,
      backgroundColor: theme.colors.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    notificationImage: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: 12,
      backgroundColor: '#E0E0E0',
    },
    notificationContent: {
      flex: 1,
    },
    notificationTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      marginBottom: 2,
    },
    notificationSubtitle: {
      fontSize: 14,
      color: theme.colors.text,
      marginBottom: 2,
    },
    notificationDescription: {
      fontSize: 14,
      color: theme.colors.primary,
    },
    notificationTime: {
      fontSize: 12,
      color: theme.colors.secondaryText,
      marginTop: 4,
    },
    notificationActions: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingLeft: 8,
    },
    moreButton: {
      padding: 8,
    },
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <StatusBar 
        title={language === 'tr' ? 'Bildirimler' : 'Notification'}
        showSearch={false}
        showNotifications={false}
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />

      {/* Tab Menu */}
      <View style={styles.tabContainer}>
        {tabs.map((tab) => (
          <View key={tab.id} style={{ alignItems: 'center' }}>
            <TouchableOpacity
              style={[
                styles.tabButton,
                activeTab === tab.id && styles.activeTabButton
              ]}
              onPress={() => setActiveTab(tab.id)}
            >
              <Text style={[
                styles.tabText,
                activeTab === tab.id && styles.activeTabText
              ]}>
                {tab.title}
              </Text>
            </TouchableOpacity>
            {activeTab === tab.id && <View style={styles.activeTabIndicator} />}
          </View>
        ))}
      </View>

      {/* Notifications List */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {Object.entries(groupNotificationsByCategory(getFilteredNotifications())).map(([category, notifications]) => (
          <View key={category} style={styles.categorySection}>
            <Text style={styles.categoryTitle}>{category}</Text>
            
            {notifications.map((notification) => (
              <TouchableOpacity key={notification.id} style={styles.notificationItem}>
                <View style={styles.notificationImage}>
                  <Image 
                    source={{ uri: notification.image }}
                    style={styles.notificationImage}
                    resizeMode="cover"
                  />
                </View>
                
                <View style={styles.notificationContent}>
                  <Text style={styles.notificationTitle}>{notification.title}</Text>
                  <Text style={styles.notificationSubtitle}>
                    {notification.subtitle}, <Text style={styles.notificationDescription}>{notification.description}</Text>
                  </Text>
                  <Text style={styles.notificationTime}>{notification.time}</Text>
                </View>
                
                <View style={styles.notificationActions}>
                  <TouchableOpacity style={styles.moreButton}>
                    <Ionicons name="ellipsis-horizontal" size={20} color={theme.colors.secondaryText} />
                  </TouchableOpacity>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        ))}
        
        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

export default NotificationsScreen;