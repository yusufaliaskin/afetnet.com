import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
// import { useLanguage } from '../contexts/LanguageContext';
import Header from '../components/Header';

const AboutScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  // const { t } = useLanguage();

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
      <Header 
        title="Hakkında" 
        showBackButton={true}
        onBackPress={() => navigation.goBack()}
      />

      <ScrollView style={[styles.scrollView, { backgroundColor: theme.colors.background }]} showsVerticalScrollIndicator={false}>
        <View style={styles.section}>
          <View style={styles.logoContainer}>
            <Image 
              source={require('../../assets/logo.png')} 
              style={styles.logo}
              resizeMode="contain"
            />
            <Text style={[styles.appName, { color: theme.colors.text }]}>Afet.net</Text>
            <Text style={[styles.version, { color: theme.colors.secondaryText }]}>Sürüm 1.0.0</Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={[styles.infoCard, { backgroundColor: theme.colors.cardBackground }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="information-circle" size={24} color={theme.colors.primary} />
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Uygulama Hakkında</Text>
            </View>
            <Text style={[styles.cardContent, { color: theme.colors.secondaryText }]}>
              Afet.net, Türkiye'deki deprem verilerini gerçek zamanlı olarak takip etmenizi sağlayan bir mobil uygulamadır. 
              Kandilli Rasathanesi ve AFAD verilerini kullanarak, güncel deprem bilgilerini harita üzerinde görüntüler 
              ve acil durumlarda size yardımcı olacak özellikler sunar.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={[styles.infoCard, { backgroundColor: theme.colors.cardBackground }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="target" size={24} color={theme.colors.primary} />
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Misyonumuz</Text>
            </View>
            <Text style={[styles.cardContent, { color: theme.colors.secondaryText }]}>
              Deprem gibi doğal afetlere karşı toplumun bilinçlenmesini sağlamak ve acil durumlarda 
              hızlı ve güvenilir bilgi erişimi sunarak can ve mal kaybını en aza indirmeye katkıda bulunmak.
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <View style={[styles.infoCard, { backgroundColor: theme.colors.cardBackground }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="star" size={24} color={theme.colors.primary} />
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Özellikler</Text>
            </View>
            <View style={styles.featuresList}>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                <Text style={[styles.featureText, { color: theme.colors.secondaryText }]}>Gerçek zamanlı deprem verileri</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                <Text style={[styles.featureText, { color: theme.colors.secondaryText }]}>İnteraktif harita görünümü</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                <Text style={[styles.featureText, { color: theme.colors.secondaryText }]}>Acil durum bildirimleri</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                <Text style={[styles.featureText, { color: theme.colors.secondaryText }]}>Güvenilir veri kaynakları</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                <Text style={[styles.featureText, { color: theme.colors.secondaryText }]}>Koyu/Açık tema desteği</Text>
              </View>
              <View style={styles.featureItem}>
                <Ionicons name="checkmark-circle" size={16} color={theme.colors.success} />
                <Text style={[styles.featureText, { color: theme.colors.secondaryText }]}>Çoklu dil desteği</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <View style={[styles.infoCard, { backgroundColor: theme.colors.cardBackground }]}>
            <View style={styles.cardHeader}>
              <Ionicons name="shield-checkmark" size={24} color={theme.colors.primary} />
              <Text style={[styles.cardTitle, { color: theme.colors.text }]}>Veri Kaynakları</Text>
            </View>
            <Text style={[styles.cardContent, { color: theme.colors.secondaryText }]}>
              • Kandilli Rasathanesi Deprem Araştırma Enstitüsü{"\n"}
              • Afet ve Acil Durum Yönetimi Başkanlığı (AFAD){"\n"}
              • Boğaziçi Üniversitesi Kandilli Rasathanesi
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={[styles.copyright, { color: theme.colors.tertiaryText }]}>
            © 2024 Afet.net. Tüm hakları saklıdır.
          </Text>
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
  logoContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 16,
  },
  appName: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  version: {
    fontSize: 16,
  },
  infoCard: {
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 8,
  },
  cardContent: {
    fontSize: 14,
    lineHeight: 20,
  },
  featuresList: {
    marginTop: 8,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureText: {
    fontSize: 14,
    marginLeft: 8,
  },
  copyright: {
    textAlign: 'center',
    fontSize: 12,
    fontStyle: 'italic',
  },
  bottomSpacing: {
    height: 50,
  },
});

export default AboutScreen;