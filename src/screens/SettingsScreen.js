import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Modal,
  FlatList,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import StatusBar from '../components/StatusBar';

const SettingsScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme, toggleTheme, isDarkMode } = useTheme();
  const { t, currentLanguage, changeLanguage, availableLanguages } = useLanguage();
  
  const [settings, setSettings] = useState({
    emergencyNotifications: true,
    familyNotifications: true,
    communityNotifications: false,
    soundNotifications: true,
    locationSharing: true,
    profileVisibility: false,
    dataCollection: true,
  });
  
  const [languageModalVisible, setLanguageModalVisible] = useState(false);

  const toggleSetting = (key) => {
    if (key === 'darkMode') {
      console.log('Dark mode toggled:', !isDarkMode);
      toggleTheme();
    } else {
      const newValue = !settings[key];
      console.log(`Setting ${key} changed to:`, newValue);
      setSettings(prev => ({
        ...prev,
        [key]: newValue
      }));
    }
  };

  const renderSettingItem = (title, subtitle, settingKey, icon) => {
    const value = settingKey === 'darkMode' ? isDarkMode : settings[settingKey];
    
    return (
      <View key={settingKey} style={[styles.settingItem, { backgroundColor: theme.colors.cardBackground }]}>
        <View style={styles.settingContent}>
          <View style={styles.settingInfo}>
            <Text style={[styles.settingTitle, { color: theme.colors.text }]}>{title}</Text>
            <Text style={[styles.settingSubtitle, { color: theme.colors.secondaryText }]}>{subtitle}</Text>
          </View>
          <Switch
            value={value}
            onValueChange={() => toggleSetting(settingKey)}
            trackColor={{ false: theme.colors.switchTrackOff, true: theme.colors.switchTrackOn }}
            thumbColor={theme.colors.switchThumb}
            ios_backgroundColor={theme.colors.switchTrackOff}
          />
        </View>
      </View>
    );
  };

  const renderMenuItemWithArrow = (title, subtitle, icon, onPress) => (
    <TouchableOpacity key={title} style={[styles.settingItem, { backgroundColor: theme.colors.cardBackground }]} onPress={onPress}>
      <View style={styles.settingContent}>
        <View style={styles.settingInfo}>
          <Text style={[styles.settingTitle, { color: theme.colors.text }]}>{title}</Text>
          {subtitle && <Text style={[styles.settingSubtitle, { color: theme.colors.secondaryText }]}>{subtitle}</Text>}
        </View>
        <Ionicons name="chevron-forward" size={20} color={theme.colors.tertiaryText} />
      </View>
    </TouchableOpacity>
  );

  const handleLanguagePress = () => {
    setLanguageModalVisible(true);
  };

  const handleLanguageSelect = (languageCode) => {
    console.log('Language changed to:', languageCode);
    changeLanguage(languageCode);
    setLanguageModalVisible(false);
  };

  const handleHelpPress = () => {
    navigation.navigate('HelpCenter');
  };

  const handleAboutPress = () => {
    navigation.navigate('About');
  };

  const handlePrivacyPress = () => {
    navigation.navigate('PrivacyPolicy');
  };

  const handleTermsPress = () => {
    navigation.navigate('TermsOfUse');
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
      <StatusBar 
        title="afetnet.com"
        showSearch={false}
        showNotifications={true}
        onNotificationPress={() => navigation.navigate('Notifications')}
      />

      <ScrollView style={[styles.scrollView, { backgroundColor: theme.colors.background }]} showsVerticalScrollIndicator={false}>
        {/* General Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="settings-outline" size={20} color={theme.colors.icon} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('general')}</Text>
          </View>
          
          {renderSettingItem(
            t('darkMode'),
            t('darkModeDesc'),
            'darkMode'
          )}
          
          {renderMenuItemWithArrow(
            t('language'),
            availableLanguages.find(lang => lang.code === currentLanguage)?.nativeName,
            'language-outline',
            handleLanguagePress
          )}
        </View>

        {/* Notifications Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="notifications-outline" size={20} color={theme.colors.icon} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('notifications')}</Text>
          </View>
          
          {renderSettingItem(
            t('emergencyNotifications'),
            t('emergencyNotificationsDesc'),
            'emergencyNotifications'
          )}
          
          {renderSettingItem(
            t('familyNotifications'),
            t('familyNotificationsDesc'),
            'familyNotifications'
          )}
          
          {renderSettingItem(
            t('communityNotifications'),
            t('communityNotificationsDesc'),
            'communityNotifications'
          )}
          
          {renderSettingItem(
            t('soundNotifications'),
            t('soundNotificationsDesc'),
            'soundNotifications'
          )}
        </View>

        {/* Privacy & Security Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="shield-outline" size={20} color={theme.colors.icon} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('privacySecurity')}</Text>
          </View>
          
          {renderSettingItem(
            t('locationSharing'),
            t('locationSharingDesc'),
            'locationSharing'
          )}
          
          {renderSettingItem(
            t('profileVisibility'),
            t('profileVisibilityDesc'),
            'profileVisibility'
          )}
          
          {renderSettingItem(
            t('dataCollection'),
            t('dataCollectionDesc'),
            'dataCollection'
          )}
        </View>

        {/* Support Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="help-circle-outline" size={20} color={theme.colors.icon} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('support')}</Text>
          </View>
          
          {renderMenuItemWithArrow(
            t('helpCenter'),
            null,
            'help-circle-outline',
            handleHelpPress
          )}
          
          {renderMenuItemWithArrow(
            t('about'),
            null,
            'information-circle-outline',
            handleAboutPress
          )}
          
          {renderMenuItemWithArrow(
            t('privacyPolicy'),
            null,
            'document-text-outline',
            handlePrivacyPress
          )}
          
          {renderMenuItemWithArrow(
            t('termsOfUse'),
            null,
            'document-outline',
            handleTermsPress
          )}
        </View>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={[styles.versionText, { color: theme.colors.secondaryText }]}>{t('version')}</Text>
          <Text style={[styles.copyrightText, { color: theme.colors.tertiaryText }]}>{t('copyright')}</Text>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Language Selection Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={languageModalVisible}
        onRequestClose={() => setLanguageModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.colors.cardBackground }]}>
            <View style={[styles.modalHeader, { borderBottomColor: theme.colors.border }]}>
              <Text style={[styles.modalTitle, { color: theme.colors.text }]}>{t('selectLanguage')}</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setLanguageModalVisible(false)}
              >
                <Ionicons name="close" size={24} color={theme.colors.text} />
              </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.modalScrollView}>
              {availableLanguages.map((language) => (
                <TouchableOpacity
                  key={language.code}
                  style={[styles.languageOption, { backgroundColor: theme.colors.cardBackground }]}
                  onPress={() => handleLanguageSelect(language.code)}
                >
                  <Text style={[styles.languageText, { color: theme.colors.text }]}>
                    {language.nativeName}
                  </Text>
                  {currentLanguage === language.code && (
                    <Ionicons name="checkmark" size={20} color={theme.colors.primary} />
                  )}
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F2F2F7',
  },

  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#8E8E93',
    marginLeft: 8,
  },
  settingItem: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  settingContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  settingInfo: {
    flex: 1,
    marginRight: 16,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 4,
  },
  settingSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    lineHeight: 18,
  },
  bottomSpacing: {
    height: 50,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 20,
    paddingHorizontal: 16,
  },
  versionText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#8E8E93',
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 12,
    color: '#C7C7CC',
    textAlign: 'center',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    width: '80%',
    maxHeight: '60%',
    borderRadius: 12,
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalScrollView: {
    maxHeight: 300,
  },
  languageOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  languageText: {
    fontSize: 16,
    fontWeight: '500',
  },
});

export default SettingsScreen;