import React, { useState, useCallback, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  FlatList,
  Alert,
  Share,
  Linking,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const SettingsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme, toggleTheme, isDarkMode } = useTheme();
  const { t, currentLanguage, changeLanguage, availableLanguages } = useLanguage();
  
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [languageModalVisible, setLanguageModalVisible] = useState(false);
  
  const handleLanguageSelect = useCallback((languageCode) => {
    changeLanguage(languageCode);
    setLanguageModalVisible(false);
  }, [changeLanguage]);
  
  const handleThemeToggle = useCallback(() => {
    toggleTheme();
  }, [toggleTheme]);
  
  const handleShareApp = useCallback(async () => {
    try {
      await Share.share({
        message: 'AfetNet - Afet ve Acil Durum Bilgi Sistemi\n\nAfetlere karşı hazırlıklı olun, güvenliğinizi sağlayın!\n\nUygulamayı indirin: https://play.google.com/store/apps/details?id=com.afetnet',
        title: 'AfetNet Uygulaması'
      });
    } catch (error) {
      Alert.alert('Hata', 'Paylaşım sırasında bir hata oluştu.');
    }
  }, []);
  
  const handleRateApp = useCallback(() => {
    const playStoreUrl = 'https://play.google.com/store/apps/details?id=com.afetnet';
    const appStoreUrl = 'https://apps.apple.com/app/afetnet/id123456789';
    
    Alert.alert(
      'Uygulamayı Değerlendir',
      'AfetNet uygulamasını beğendiniz mi? Lütfen değerlendirin!',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Play Store', 
          onPress: () => Linking.openURL(playStoreUrl).catch(() => 
            Alert.alert('Hata', 'Play Store açılamadı.')
          )
        },
        { 
          text: 'App Store', 
          onPress: () => Linking.openURL(appStoreUrl).catch(() => 
            Alert.alert('Hata', 'App Store açılamadı.')
          )
        }
      ]
    );
  }, []);
  
  const handleContact = useCallback(() => {
    Alert.alert(
      'İletişim',
      'Bizimle iletişime geçmek için:',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'E-posta Gönder', 
          onPress: () => Linking.openURL('mailto:info@afetnet.gov.tr?subject=AfetNet Uygulaması Hakkında').catch(() => 
            Alert.alert('Hata', 'E-posta uygulaması açılamadı.')
          )
        },
        { 
          text: 'Telefon Et', 
          onPress: () => Linking.openURL('tel:+902123456789').catch(() => 
            Alert.alert('Hata', 'Telefon uygulaması açılamadı.')
          )
        }
      ]
    );
  }, []);
  
  const handleFeedback = useCallback(() => {
    Alert.alert(
      'Geri Bildirim',
      'Görüşlerinizi bizimle paylaşın:',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'E-posta Gönder', 
          onPress: () => Linking.openURL('mailto:feedback@afetnet.gov.tr?subject=AfetNet Geri Bildirim').catch(() => 
            Alert.alert('Hata', 'E-posta uygulaması açılamadı.')
          )
        }
      ]
    );
  }, []);
  
  const handleLogout = useCallback(() => {
    Alert.alert(
      'Çıkış Yap',
      'Hesabınızdan çıkmak istediğinizden emin misiniz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Çıkış Yap', style: 'destructive', onPress: () => {
          // TODO: Implement logout logic
          Alert.alert('Başarılı', 'Hesabınızdan çıkış yapıldı.');
        }}
      ]
    );
  }, []);
  
  const handleDeleteAccount = useCallback(() => {
    Alert.alert(
      'Hesabı Sil',
      'Hesabınızı kalıcı olarak silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Hesabı Sil', 
          style: 'destructive', 
          onPress: () => {
            Alert.alert(
              'Son Uyarı',
              'Hesabınız ve tüm verileriniz kalıcı olarak silinecek. Devam etmek istediğinizden emin misiniz?',
              [
                { text: 'İptal', style: 'cancel' },
                { 
                  text: 'Evet, Sil', 
                  style: 'destructive', 
                  onPress: () => {
                    // TODO: Implement account deletion logic
                    Alert.alert('Başarılı', 'Hesabınız başarıyla silindi.');
                  }
                }
              ]
            );
          }
        }
      ]
    );
  }, []);
  
  const handlePrivacyPolicy = useCallback(() => {
    const privacyUrl = 'https://afetnet.gov.tr/gizlilik-politikasi';
    Linking.openURL(privacyUrl).catch(() => {
      Alert.alert(
        'Gizlilik Politikası',
        'AfetNet Gizlilik Politikası\n\nKişisel verilerinizin korunması bizim için önemlidir. Uygulamamız, kişisel verilerinizi KVKK kapsamında işler ve korur.\n\nDetaylı bilgi için: info@afetnet.gov.tr',
        [{ text: 'Tamam' }]
      );
    });
  }, []);
  
  const handleTermsConditions = useCallback(() => {
    const termsUrl = 'https://afetnet.gov.tr/kullanim-kosullari';
    Linking.openURL(termsUrl).catch(() => {
      Alert.alert(
        'Kullanım Koşulları',
        'AfetNet Kullanım Koşulları\n\nBu uygulamayı kullanarak aşağıdaki koşulları kabul etmiş sayılırsınız:\n\n1. Uygulamayı yasal amaçlarla kullanacaksınız\n2. Doğru bilgiler sağlayacaksınız\n3. Diğer kullanıcılara saygı göstereceksiniz\n\nDetaylı bilgi için: info@afetnet.gov.tr',
        [{ text: 'Tamam' }]
      );
    });
  }, []);
  
  const handleCookiesPolicy = useCallback(() => {
    const cookiesUrl = 'https://afetnet.gov.tr/cerez-politikasi';
    Linking.openURL(cookiesUrl).catch(() => {
      Alert.alert(
        'Çerez Politikası',
        'AfetNet Çerez Politikası\n\nUygulamamız, deneyiminizi iyileştirmek için çerezler kullanır. Bu çerezler:\n\n• Oturum bilgilerini saklar\n• Tercihlerinizi hatırlar\n• Uygulama performansını ölçer\n\nÇerezleri ayarlardan yönetebilirsiniz.',
        [{ text: 'Tamam' }]
      );
    });
  }, []);
  
  const handleHelpCenter = useCallback(() => {
    Alert.alert(
      'Yardım Merkezi',
      'AfetNet Yardım Merkezi\n\nSık sorulan sorular ve yardım konuları:\n\n• Nasıl kayıt olurum?\n• Bildirimler nasıl çalışır?\n• Acil durumlarda ne yapmalıyım?\n• Uygulama nasıl kullanılır?\n\nDaha fazla yardım için: help@afetnet.gov.tr',
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'E-posta Gönder', 
          onPress: () => Linking.openURL('mailto:help@afetnet.gov.tr?subject=AfetNet Yardım Talebi').catch(() => 
            Alert.alert('Hata', 'E-posta uygulaması açılamadı.')
          )
        }
      ]
    );
  }, []);

  const menuSections = useMemo(() => [
    {
      title: 'Genel Ayarlar',
      items: [
        {
          id: 'notifications',
          title: 'Bildirimler',
          icon: 'notifications-outline',
          type: 'switch',
          value: notificationsEnabled,
          onPress: () => setNotificationsEnabled(!notificationsEnabled)
        },
        {
          id: 'darkMode',
          title: 'Karanlık Mod',
          icon: 'moon-outline',
          type: 'switch',
          value: isDarkMode,
          onPress: handleThemeToggle
        },
        {
          id: 'language',
          title: 'Dil',
          subtitle: currentLanguage === 'tr' ? 'Türkçe' : 'English',
          icon: 'language-outline',
          type: 'arrow',
          onPress: () => setLanguageModalVisible(true)
        }
      ]
    },
    {
      title: 'Uygulama',
      items: [
        {
          id: 'rate',
          title: 'Uygulamayı Oyla',
          icon: 'star-outline',
          type: 'arrow',
          onPress: handleRateApp
        },
        {
          id: 'share',
          title: 'Uygulamayı Paylaş',
          icon: 'share-outline',
          type: 'arrow',
          onPress: handleShareApp
        }
      ]
    },
    {
      title: 'Yasal',
      items: [
        {
          id: 'privacy',
          title: 'Gizlilik Politikası',
          icon: 'shield-outline',
          type: 'arrow',
          onPress: handlePrivacyPolicy
        },
        {
          id: 'terms',
          title: 'Hüküm ve Koşullar',
          icon: 'document-text-outline',
          type: 'arrow',
          onPress: handleTermsConditions
        },
        {
          id: 'cookies',
          title: 'Çerez Politikası',
          icon: 'information-circle-outline',
          type: 'arrow',
          onPress: handleCookiesPolicy
        }
      ]
    },
    {
      title: 'Destek',
      items: [
        {
          id: 'help',
          title: 'Yardım Merkezi',
          icon: 'help-circle-outline',
          type: 'arrow',
          onPress: handleHelpCenter
        },
        {
          id: 'contact',
          title: 'İletişim',
          icon: 'mail-outline',
          type: 'arrow',
          onPress: handleContact
        },
        {
          id: 'feedback',
          title: 'Geri Bildirim',
          icon: 'chatbubble-outline',
          type: 'arrow',
          onPress: handleFeedback
        }
      ]
    },
    {
      title: 'Hesap',
      items: [
        {
          id: 'logout',
          title: 'Çıkış Yap',
          icon: 'log-out-outline',
          type: 'arrow',
          destructive: true,
          onPress: handleLogout
        },
        {
          id: 'deleteAccount',
          title: 'Hesabı Sil',
          icon: 'trash-outline',
          type: 'arrow',
          destructive: true,
          onPress: handleDeleteAccount
        }
      ]
    }
  ], [notificationsEnabled, isDarkMode, currentLanguage, handleThemeToggle, handleRateApp, handleShareApp, handlePrivacyPolicy, handleTermsConditions, handleCookiesPolicy, handleHelpCenter, handleContact, handleFeedback, handleLogout, handleDeleteAccount]);

  const renderMenuItem = (item) => {
    const iconColor = item.destructive ? '#FF3B30' : (isDarkMode ? theme.colors.text : '#000');
    const textColor = item.destructive ? '#FF3B30' : (isDarkMode ? theme.colors.text : '#000');
    
    return (
      <TouchableOpacity 
        key={item.id} 
        style={[styles.menuItem, { backgroundColor: isDarkMode ? theme.colors.card : '#FFFFFF' }]} 
        onPress={item.onPress}
        disabled={item.type === 'switch'}
        activeOpacity={0.7}
      >
        <View style={styles.menuItemContent}>
          <View style={[styles.iconContainer, { backgroundColor: isDarkMode ? theme.colors.background : '#F2F2F7' }]}>
            <Ionicons 
              name={item.icon} 
              size={20} 
              color={iconColor}
            />
          </View>
          <View style={styles.textContainer}>
            <Text style={[styles.menuTitle, { color: textColor }]}>{item.title}</Text>
            {item.subtitle && (
              <Text style={[styles.menuSubtitle, { color: isDarkMode ? theme.colors.textSecondary : '#8E8E93' }]}>
                {item.subtitle}
              </Text>
            )}
          </View>
          {item.type === 'switch' ? (
            <Switch
              value={item.value}
              onValueChange={item.onPress}
              trackColor={{ false: isDarkMode ? '#39393D' : '#E5E5EA', true: '#34C759' }}
              thumbColor="#FFFFFF"
              ios_backgroundColor={isDarkMode ? '#39393D' : '#E5E5EA'}
            />
          ) : (
            <Ionicons 
              name="chevron-forward" 
              size={16} 
              color={isDarkMode ? theme.colors.textSecondary : '#C7C7CC'} 
            />
          )}
        </View>
      </TouchableOpacity>
    );
  };
  
  const renderSection = (section, index) => {
    return (
      <View key={index} style={styles.section}>
        <Text style={[styles.sectionTitle, { color: isDarkMode ? theme.colors.textSecondary : '#8E8E93' }]}>
          {section.title}
        </Text>
        <View style={[styles.sectionContent, { backgroundColor: isDarkMode ? theme.colors.card : '#FFFFFF' }]}>
          {section.items.map((item, itemIndex) => (
            <View key={item.id}>
              {renderMenuItem(item)}
              {itemIndex < section.items.length - 1 && (
                <View style={[styles.separator, { backgroundColor: isDarkMode ? theme.colors.border : '#E5E5EA' }]} />
              )}
            </View>
          ))}
        </View>
      </View>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? theme.colors.background : '#F2F2F7' }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: isDarkMode ? theme.colors.card : '#FFFFFF', borderBottomColor: isDarkMode ? theme.colors.border : '#E5E5EA' }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color={isDarkMode ? theme.colors.text : '#000'} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDarkMode ? theme.colors.text : '#000' }]}>Ayarlar</Text>
        <View style={styles.headerRight} />
      </View>

      {/* Menu Sections */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.menuContainer}>
          {menuSections.map(renderSection)}
        </View>
      </ScrollView>
      
      {/* Language Selection Modal */}
      <Modal
        visible={languageModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: isDarkMode ? theme.colors.card : '#FFFFFF' }]}>
            <View style={styles.modalHeader}>
              <Text style={[styles.modalTitle, { color: isDarkMode ? theme.colors.text : '#000' }]}>Dil Seçin</Text>
              <TouchableOpacity 
                onPress={() => setLanguageModalVisible(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color={isDarkMode ? theme.colors.text : '#000'} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={availableLanguages}
              keyExtractor={(item) => item.code}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.languageItem, { backgroundColor: isDarkMode ? theme.colors.card : '#FFFFFF' }]}
                  onPress={() => handleLanguageSelect(item.code)}
                >
                  <Text style={[styles.languageName, { color: isDarkMode ? theme.colors.text : '#000' }]}>
                    {item.name}
                  </Text>
                  {currentLanguage === item.code && (
                    <Ionicons name="checkmark" size={20} color="#34C759" />
                  )}
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: insets.top + 80, // StatusBar yüksekliği için padding
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  headerRight: {
    width: 40,
  },
  scrollView: {
    flex: 1,
  },
  menuContainer: {
    paddingVertical: 20,
  },
  section: {
    marginBottom: 32,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
    marginHorizontal: 20,
  },
  sectionContent: {
    marginHorizontal: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  menuItem: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  menuItemContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  iconContainer: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  textContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: '500',
    lineHeight: 20,
  },
  menuSubtitle: {
    fontSize: 14,
    marginTop: 2,
    lineHeight: 18,
  },
  separator: {
    height: 0.5,
    marginLeft: 60,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34,
    maxHeight: '50%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalCloseButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 16,
  },
  languageItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#E5E5EA',
  },
  languageName: {
    fontSize: 16,
    fontWeight: '400',
  },
});

export default SettingsScreen;