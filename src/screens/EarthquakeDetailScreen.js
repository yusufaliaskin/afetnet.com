import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TouchableOpacity,
  ScrollView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import earthquakeService from '../services/earthquakeService';

// Web için Leaflet import'ları - sadece web platformunda
let MapContainer, TileLayer, Marker, Popup, L;
if (Platform.OS === 'web') {
  const leaflet = require('react-leaflet');
  MapContainer = leaflet.MapContainer;
  TileLayer = leaflet.TileLayer;
  Marker = leaflet.Marker;
  Popup = leaflet.Popup;
  L = require('leaflet');
  
  // CSS'i dinamik olarak yükle
  if (typeof document !== 'undefined') {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.7.1/dist/leaflet.css';
    document.head.appendChild(link);
  }
  
  // Leaflet marker icon'larını düzelt
  if (L && L.Icon && L.Icon.Default) {
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
    });
  }
}

const EarthquakeDetailScreen = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const navigation = useNavigation();
  const route = useRoute();
  const insets = useSafeAreaInsets();
  
  const { earthquake } = route.params;
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState([earthquake.latitude || 39.9334, earthquake.longitude || 32.8597]);

  useEffect(() => {
    if (earthquake.latitude && earthquake.longitude) {
      setMapCenter([earthquake.latitude, earthquake.longitude]);
    }
  }, [earthquake]);



  const renderMap = () => {
    if (Platform.OS === 'web' && MapContainer) {
      return (
        <MapContainer
          center={mapCenter}
          zoom={10}
          style={{ height: '100%', width: '100%' }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          />
          {earthquake.latitude && earthquake.longitude && (
            <Marker position={[earthquake.latitude, earthquake.longitude]}>
              <Popup>
                <div>
                  <strong>{earthquake.magnitude} Büyüklüğünde Deprem</strong><br/>
                  {earthquake.location}<br/>
                  Derinlik: {earthquake.depth} km
                </div>
              </Popup>
            </Marker>
          )}
        </MapContainer>
      );
    } else {
      // Mobile için placeholder
      return (
        <View style={styles.mapPlaceholder}>
          <Ionicons name="map-outline" size={64} color={theme.colors.secondaryText} />
          <Text style={[styles.mapPlaceholderText, { color: theme.colors.secondaryText }]}>
            Deprem konumu haritası
          </Text>
        </View>
      );
    }
  };

  const getSeverityColor = (magnitude) => {
    if (magnitude >= 7.0) return '#8B0000'; // Çok yüksek - koyu kırmızı
    if (magnitude >= 6.0) return '#FF0000'; // Yüksek - kırmızı
    if (magnitude >= 5.0) return '#FF4500'; // Orta-yüksek - turuncu kırmızı
    if (magnitude >= 4.0) return '#FF8C00'; // Orta - koyu turuncu
    if (magnitude >= 3.0) return '#FFA500'; // Düşük-orta - turuncu
    if (magnitude >= 2.0) return '#FFD700'; // Düşük - altın sarısı
    return '#90EE90'; // Çok düşük - açık yeşil
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.primary }]}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.onPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.onPrimary }]}>Rasathane</Text>
        <TouchableOpacity style={styles.shareButton}>
          <Ionicons name="share-outline" size={24} color={theme.colors.onPrimary} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Map Section */}
        <View style={styles.mapSection}>
          <View style={styles.mapContainer}>
            {renderMap()}
          </View>
          
  
        </View>



        {/* Earthquake Details Card */}
        <View style={[styles.detailsCard, { backgroundColor: theme.colors.cardBackground }]}>
          <View style={styles.cardHeader}>
            <Text style={[styles.locationTitle, { color: theme.colors.text }]}>
              {earthquake.location.replace('(BALIKESİR)', '').replace('(', '').replace(')', '').trim()}
            </Text>
            <Text style={[styles.locationSubtitle, { color: theme.colors.secondaryText }]}>
              (BALIKESİR)
            </Text>
          </View>

          <View style={styles.detailsGrid}>
            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Ionicons name="calendar-outline" size={16} color={theme.colors.secondaryText} />
                <Text style={[styles.detailLabel, { color: theme.colors.secondaryText }]}>Tarih</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>{earthquake.dateOnly || '18.08.2025'}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="time-outline" size={16} color={theme.colors.secondaryText} />
                <Text style={[styles.detailLabel, { color: theme.colors.secondaryText }]}>Saat</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>{earthquake.displayTime || '14:52:59'}</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Ionicons name="resize-outline" size={16} color={theme.colors.secondaryText} />
                <Text style={[styles.detailLabel, { color: theme.colors.secondaryText }]}>Derinlik (km)</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>{earthquake.depth || '8.3'}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="diamond-outline" size={16} color={theme.colors.secondaryText} />
                <Text style={[styles.detailLabel, { color: theme.colors.secondaryText }]}>Mesafe (km)</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>212.46</Text>
              </View>
            </View>

            <View style={styles.detailRow}>
              <View style={styles.detailItem}>
                <Ionicons name="globe-outline" size={16} color={theme.colors.secondaryText} />
                <Text style={[styles.detailLabel, { color: theme.colors.secondaryText }]}>Enlem</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>{earthquake.latitude?.toFixed(4) || '39.2533'}</Text>
              </View>
              <View style={styles.detailItem}>
                <Ionicons name="globe-outline" size={16} color={theme.colors.secondaryText} />
                <Text style={[styles.detailLabel, { color: theme.colors.secondaryText }]}>Boylam</Text>
                <Text style={[styles.detailValue, { color: theme.colors.text }]}>{earthquake.longitude?.toFixed(4) || '28.0837'}</Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  backButton: {
    padding: 8,
    borderRadius: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  shareButton: {
    padding: 8,
    borderRadius: 8,
  },
  content: {
    flex: 1,
  },
  mapSection: {
    height: 300,
    position: 'relative',
  },
  mapContainer: {
    flex: 1,
    borderRadius: 0,
    overflow: 'hidden',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  mapPlaceholderText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
  },

  detailsCard: {
    marginHorizontal: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  cardHeader: {
    marginBottom: 20,
  },
  locationTitle: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  locationSubtitle: {
    fontSize: 16,
    fontWeight: '500',
  },
  detailsGrid: {
    gap: 16,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '500',
    textAlign: 'center',
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '700',
    textAlign: 'center',
  },
});

export default EarthquakeDetailScreen;