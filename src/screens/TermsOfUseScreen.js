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

const TermsOfUseScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { t } = useLanguage();

  const termsSections = [
    {
      title: '1. Kabul ve Onay',
      content: 'Afet.net uygulamasını kullanarak, bu kullanım şartlarını kabul etmiş sayılırsınız. Bu şartları kabul etmiyorsanız, uygulamayı kullanmamalısınız. Bu şartlar, uygulamanın tüm özelliklerini ve hizmetlerini kapsar.'
    },
    {
      title: '2. Hizmet Tanımı',
      content: 'Afet.net, deprem verilerini gerçek zamanlı olarak sunan bir bilgilendirme uygulamasıdır. Uygulama:\n\n• Kandilli Rasathanesi ve AFAD verilerini görüntüler\n• Harita üzerinde deprem lokasyonlarını gösterir\n• Acil durum bildirimlerini iletir\n• Güvenlik önerilerini paylaşır\n• Eğitici içerikler sunar'
    },
    {
      title: '3. Kullanıcı Sorumlulukları',
      content: 'Uygulamayı kullanırken aşağıdaki kurallara uymalısınız:\n\n• Uygulamayı yasal amaçlarla kullanmak\n• Doğru ve güncel bilgiler sağlamak\n• Başkalarının haklarına saygı göstermek\n• Sistemi kötüye kullanmamak\n• Güvenlik önlemlerini ihlal etmemek\n• Spam veya zararlı içerik paylaşmamak'
    },
    {
      title: '4. Veri Doğruluğu ve Sorumluluk',
      content: 'Deprem verileri güvenilir kaynaklardan alınsa da:\n\n• Verilerin %100 doğruluğu garanti edilmez\n• Teknik aksaklıklar yaşanabilir\n• Gecikme veya eksik veri olabilir\n• Acil durumlarda resmi kaynaklara başvurun\n• Uygulama sadece bilgilendirme amaçlıdır\n• Hayati kararlar için uzman görüşü alın'
    },
    {
      title: '5. Fikri Mülkiyet Hakları',
      content: 'Uygulamadaki tüm içerikler telif hakkı ile korunmaktadır:\n\n• Uygulama tasarımı ve kodu\n• Logo ve görsel öğeler\n• Metin içerikleri\n• Kullanıcı arayüzü\n• Algoritma ve yazılım\n• Marka ve ticari markalar'
    },
    {
      title: '6. Gizlilik ve Veri Koruma',
      content: 'Kişisel verileriniz gizlilik politikamıza göre işlenir:\n\n• Minimal veri toplama prensibi\n• Şeffaf veri kullanımı\n• Güvenli veri saklama\n• Kullanıcı kontrolü\n• Yasal uyumluluk\n• Düzenli güvenlik denetimleri'
    },
    {
      title: '7. Hizmet Kesintileri',
      content: 'Aşağıdaki durumlarda hizmet kesintisi yaşanabilir:\n\n• Planlı bakım çalışmaları\n• Teknik arızalar\n• Güvenlik güncellemeleri\n• Sunucu bakımları\n• Üçüncü taraf hizmet kesintileri\n• Doğal afetler ve force majeure'
    },
    {
      title: '8. Yasaklanan Kullanımlar',
      content: 'Aşağıdaki faaliyetler kesinlikle yasaktır:\n\n• Sistemi hacklemek veya zarar vermek\n• Sahte bilgi yaymak\n• Başkalarının hesaplarını ele geçirmek\n• Ticari amaçlarla kötüye kullanmak\n• Telif hakkı ihlali yapmak\n• Zararlı yazılım yaymak\n• Spam göndermek'
    },
    {
      title: '9. Hesap Askıya Alma ve İptal',
      content: 'Aşağıdaki durumlarda hesabınız askıya alınabilir:\n\n• Kullanım şartlarının ihlali\n• Sahte bilgi paylaşımı\n• Diğer kullanıcılara zarar verme\n• Teknik sistemleri kötüye kullanma\n• Yasal gerekliliklere uymama\n• Güvenlik tehdidi oluşturma'
    },
    {
      title: '10. Sorumluluk Reddi',
      content: 'Afet.net aşağıdaki konularda sorumluluk kabul etmez:\n\n• Veri doğruluğu garantisi\n• Hizmet kesintilerinden kaynaklanan zararlar\n• Üçüncü taraf hizmetlerindeki sorunlar\n• Kullanıcı hatalarından kaynaklanan sorunlar\n• Force majeure durumları\n• İnternet bağlantı sorunları'
    },
    {
      title: '11. Değişiklikler',
      content: 'Bu kullanım şartları güncellenebilir:\n\n• Önemli değişiklikler bildirilir\n• Uygulama içi bildirim gönderilir\n• E-posta ile bilgilendirme\n• Web sitesinde yayınlanır\n• Yürürlük tarihi belirtilir\n• Eski sürümler arşivlenir'
    },
    {
      title: '12. Uygulanacak Hukuk',
      content: 'Bu şartlar Türkiye Cumhuriyeti yasalarına tabidir:\n\n• Türk hukuku uygulanır\n• İstanbul mahkemeleri yetkilidir\n• Uyuşmazlıklar önce dostane çözülmeye çalışılır\n• Arabuluculuk tercih edilir\n• Uluslararası anlaşmalar geçerlidir'
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
        title="Kullanım Şartları" 
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView style={[styles.scrollView, { backgroundColor: theme.colors.background }]} showsVerticalScrollIndicator={false}>
        <View style={styles.headerSection}>
          <View style={styles.headerContent}>
            <Ionicons name="document-text" size={32} color={theme.colors.primary} />
            <Text style={[styles.headerTitle, { color: theme.colors.text }]}>Kullanım Şartları</Text>
            <Text style={[styles.headerSubtitle, { color: theme.colors.secondaryText }]}>Son güncelleme: 1 Ocak 2024</Text>
          </View>
          
          <View style={[styles.introCard, { backgroundColor: theme.colors.cardBackground }]}>
            <Text style={[styles.introText, { color: theme.colors.secondaryText }]}>
              Bu kullanım şartları, Afet.net uygulamasını kullanırken uymanız gereken kuralları 
              ve koşulları belirler. Uygulamayı kullanmaya başlamadan önce lütfen bu şartları 
              dikkatlice okuyun.
            </Text>
          </View>
        </View>

        <View style={styles.sectionsContainer}>
          {termsSections.map(renderSection)}
        </View>

        <View style={styles.footerSection}>
          <View style={[styles.footerCard, { backgroundColor: theme.colors.cardBackground }]}>
            <View style={styles.footerHeader}>
              <Ionicons name="checkmark-circle" size={20} color={theme.colors.success} />
              <Text style={[styles.footerTitle, { color: theme.colors.text }]}>Şartları Kabul Ettiniz</Text>
            </View>
            <Text style={[styles.footerText, { color: theme.colors.secondaryText }]}>
              Uygulamayı kullanarak bu kullanım şartlarını kabul etmiş sayılırsınız. 
              Sorularınız için hukuki@afet.net adresinden bizimle iletişime geçebilirsiniz.
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

export default TermsOfUseScreen;