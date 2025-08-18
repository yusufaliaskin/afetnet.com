import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import Header from '../components/Header';

const PrivacyPolicyScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { t } = useLanguage();

  const privacySections = [
    {
      title: '1. Toplanan Bilgiler',
      content: 'Afet.net uygulaması, size daha iyi hizmet verebilmek için aşağıdaki bilgileri toplayabilir:\n\n• Konum bilgileri (acil durumlarda kullanım için)\n• Cihaz bilgileri (uygulama performansını optimize etmek için)\n• Kullanım istatistikleri (anonim)\n• Bildirim tercihleri'
    },
    {
      title: '2. Bilgilerin Kullanımı',
      content: 'Toplanan bilgiler yalnızca aşağıdaki amaçlarla kullanılır:\n\n• Deprem verilerini konumunuza göre kişiselleştirmek\n• Acil durumlarda size en yakın güvenli alanları göstermek\n• Uygulama performansını iyileştirmek\n• Size önemli güvenlik bildirimleri göndermek\n• Teknik destek sağlamak'
    },
    {
      title: '3. Bilgi Paylaşımı',
      content: 'Kişisel bilgileriniz kesinlikle üçüncü taraflarla paylaşılmaz. Sadece aşağıdaki durumlarda bilgi paylaşımı yapılabilir:\n\n• Yasal zorunluluklar\n• Acil durum müdahalesi (sadece konum bilgisi)\n• Güvenlik tehditleri\n• Kullanıcının açık rızası ile'
    },
    {
      title: '4. Veri Güvenliği',
      content: 'Verilerinizin güvenliği bizim için önceliklidir:\n\n• Tüm veriler şifrelenmiş olarak saklanır\n• Güvenli sunucularda barındırılır\n• Düzenli güvenlik denetimleri yapılır\n• Erişim kontrolleri uygulanır\n• Güncel güvenlik protokolleri kullanılır'
    },
    {
      title: '5. Konum Bilgileri',
      content: 'Konum bilgileriniz özel olarak korunur:\n\n• Sadece acil durumlarda kullanılır\n• Sürekli takip edilmez\n• İstediğiniz zaman kapatabilirsiniz\n• Hassas konum verileri şifrelenir\n• Geçmiş konum verileri saklanmaz'
    },
    {
      title: '6. Çerezler ve Takip',
      content: 'Uygulamamız minimal çerez kullanımı yapar:\n\n• Sadece teknik çerezler kullanılır\n• Reklam çerezleri kullanılmaz\n• Üçüncü taraf takip araçları yoktur\n• Anonim kullanım istatistikleri\n• Performans analizi için gerekli veriler'
    },
    {
      title: '7. Kullanıcı Hakları',
      content: 'Verileriniz üzerinde tam kontrole sahipsiniz:\n\n• Verilerinizi görme hakkı\n• Verileri düzeltme hakkı\n• Verileri silme hakkı\n• Veri taşınabilirliği hakkı\n• İşlemeyi durdurma hakkı\n• Şikayet etme hakkı'
    },
    {
      title: '8. Çocukların Gizliliği',
      content: '13 yaş altı çocukların gizliliği özel olarak korunur:\n\n• 13 yaş altından veri toplanmaz\n• Ebeveyn izni gereklidir\n• Özel koruma önlemleri uygulanır\n• Çocuk dostu arayüz tasarımı\n• Güvenli içerik filtreleme'
    },
    {
      title: '9. Değişiklikler',
      content: 'Bu gizlilik politikası güncellenebilir:\n\n• Önemli değişiklikler bildirilir\n• Uygulama içi bildirim gönderilir\n• E-posta ile bilgilendirme yapılır\n• Güncel tarih belirtilir\n• Eski sürümler arşivlenir'
    },
    {
      title: '10. İletişim',
      content: 'Gizlilik ile ilgili sorularınız için:\n\n• E-posta: gizlilik@afet.net\n• Telefon: +90 (212) 555-0123\n• Adres: İstanbul, Türkiye\n• Çevrimiçi destek formu\n• 7/24 teknik destek hattı'
    }
  ];

  const renderSection = (section, index) => (
    <View key={index} style={[styles.sectionCard, { backgroundColor: theme.colors.cardBackground }]}>
      <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{section.title}</Text>
      <Text style={[styles.sectionContent, { color: theme.colors.secondaryText }]}>{section.content}</Text>
    </View>
  );

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
      <Header 
        title="Gizlilik Politikası" 
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView style={[styles.scrollView, { backgroundColor: theme.colors.background }]} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <View style={styles.headerContent}>
            <Ionicons name="shield-checkmark" size={32} color={theme.colors.primary} />
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Gizlilik Politikası</Text>
            <Text style={[styles.headerSubtitle, { color: theme.colors.secondaryText }]}>Son güncelleme: 1 Ocak 2024</Text>
          </View>
          
          <View style={[styles.introCard, { backgroundColor: theme.colors.cardBackground }]}>
            <Text style={[styles.introText, { color: theme.colors.secondaryText }]}>
              Afet.net olarak, kişisel verilerinizin gizliliğini korumak bizim için son derece önemlidir. 
              Bu gizlilik politikası, uygulamayı kullanırken hangi bilgilerin toplandığını, 
              nasıl kullanıldığını ve korunduğunu açıklamaktadır.
            </Text>
          </View>
        </View>

        <View style={styles.sectionsContainer}>
          {privacySections.map(renderSection)}
        </View>

        <View style={styles.footerSection}>
          <View style={[styles.footerCard, { backgroundColor: theme.colors.cardBackground }]}>
            <View style={styles.footerHeader}>
              <Ionicons name="mail" size={20} color={theme.colors.primary} />
              <Text style={[styles.footerTitle, { color: theme.colors.text }]}>Sorularınız mı var?</Text>
            </View>
            <Text style={[styles.footerText, { color: theme.colors.secondaryText }]}>
              Gizlilik politikamız hakkında herhangi bir sorunuz varsa, 
              bizimle gizlilik@afet.net adresinden iletişime geçebilirsiniz.
            </Text>
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
  headerSection: {
    paddingHorizontal: 20,
    paddingTop: 24,
  },
  headerContent: {
    alignItems: 'center',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginTop: 12,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
  },
  introCard: {
    borderRadius: 16,
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
  introText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: 'center',
  },
  sectionsContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  sectionCard: {
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
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
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  sectionContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  footerSection: {
    paddingHorizontal: 20,
    marginTop: 24,
  },
  footerCard: {
    borderRadius: 16,
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
  footerHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  footerTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
  footerText: {
    fontSize: 14,
    lineHeight: 20,
  },
  bottomSpacing: {
    height: 50,
  },
});

export default PrivacyPolicyScreen;