import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import Header from '../components/Header';

const HelpCenterScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { t } = useLanguage();

  const helpTopics = [
    {
      id: '1',
      title: 'Deprem Bildirimlerini Nasıl Açarım?',
      content: 'Ayarlar > Bildirimler bölümünden deprem bildirimlerini açabilirsiniz. Acil durum bildirimleri, aile bildirimleri ve topluluk bildirimlerini ayrı ayrı yönetebilirsiniz.'
    },
    {
      id: '2',
      title: 'Haritada Deprem Verilerini Görme',
      content: 'Ana ekrandaki harita üzerinde son 24 saatteki depremleri görebilirsiniz. Deprem büyüklüğüne göre farklı renklerde işaretlenmiştir. Kırmızı: 5.0+, Turuncu: 4.0-4.9, Sarı: 3.0-3.9'
    },
    {
      id: '3',
      title: 'Konum Paylaşımı Nasıl Çalışır?',
      content: 'Konum paylaşımını açtığınızda, acil durumlarda konumunuz güvenlik ekiplerine iletilebilir. Bu özellik sadece acil durumlarda kullanılır ve gizliliğiniz korunur.'
    },
    {
      id: '4',
      title: 'Veri Kaynakları',
      content: 'Uygulamamız Kandilli Rasathanesi ve AFAD verilerini kullanmaktadır. Veriler gerçek zamanlı olarak güncellenir ve güvenilir kaynaklardan alınır.'
    },
    {
      id: '5',
      title: 'Acil Durum Protokolleri',
      content: 'Deprem anında: 1) Sakin kalın, 2) Çök-Kapan-Tutun, 3) Güvenli bir alana geçin, 4) Yakınlarınızla iletişime geçin, 5) Resmi kaynaklardan bilgi alın.'
    },
    {
      id: '6',
      title: 'Uygulama Sorunları',
      content: 'Uygulama ile ilgili teknik sorunlar yaşıyorsanız, önce uygulamayı yeniden başlatmayı deneyin. Sorun devam ederse, cihazınızı yeniden başlatın veya uygulamayı güncelleyin.'
    }
  ];

  const renderHelpItem = (item) => (
    <View key={item.id} style={[styles.helpItem, { backgroundColor: theme.colors.cardBackground }]}>
      <Text style={[styles.helpTitle, { color: theme.colors.text }]}>{item.title}</Text>
      <Text style={[styles.helpContent, { color: theme.colors.secondaryText }]}>{item.content}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
      <Header 
        title="Yardım Merkezi" 
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView style={[styles.scrollView, { backgroundColor: theme.colors.background }]} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="help-circle" size={24} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Sık Sorulan Sorular</Text>
          </View>
          
          {helpTopics.map(renderHelpItem)}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Ionicons name="mail" size={24} color={theme.colors.primary} />
            <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>İletişim</Text>
          </View>
          
          <View style={[styles.contactItem, { backgroundColor: theme.colors.cardBackground }]}>
            <Text style={[styles.contactTitle, { color: theme.colors.text }]}>E-posta Desteği</Text>
            <Text style={[styles.contactContent, { color: theme.colors.secondaryText }]}>destek@afet.net</Text>
          </View>
          
          <View style={[styles.contactItem, { backgroundColor: theme.colors.cardBackground }]}>
            <Text style={[styles.contactTitle, { color: theme.colors.text }]}>Acil Durum Hattı</Text>
            <Text style={[styles.contactContent, { color: theme.colors.secondaryText }]}>112</Text>
          </View>
        </View>

        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  section: {
    marginTop: 28,
    paddingHorizontal: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: 6,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 12,
  },
  helpItem: {
    borderRadius: 16,
    marginBottom: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  helpTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  helpContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  contactItem: {
    borderRadius: 16,
    marginBottom: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  contactTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  contactContent: {
    fontSize: 14,
  },
  bottomSpacing: {
    height: 50,
  },
});

export default HelpCenterScreen;