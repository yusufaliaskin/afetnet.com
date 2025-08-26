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
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import earthquakeService from '../services/earthquakeService';

// React Native Maps - sadece mobil platformlar için
let MapView, Marker, PROVIDER_GOOGLE;
if (Platform.OS === 'android' || Platform.OS === 'ios') {
  try {
    const maps = require('react-native-maps');
    MapView = maps.default;
    Marker = maps.Marker;
    PROVIDER_GOOGLE = maps.PROVIDER_GOOGLE;
    console.log('React Native Maps loaded successfully for mobile');
  } catch (error) {
    console.log('React Native Maps not available:', error);
  }
}

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Web için Leaflet import'ları - sadece web platformunda
let MapContainer, TileLayer, LeafletMarker, Popup, L;
if (Platform.OS === 'web') {
  try {
    const leaflet = require('react-leaflet');
    MapContainer = leaflet.MapContainer;
    TileLayer = leaflet.TileLayer;
    LeafletMarker = leaflet.Marker;
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
  } catch (error) {
    console.log('Leaflet not available:', error);
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
    if (Platform.OS === 'web') {
      if (MapContainer) {
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
              <LeafletMarker position={[earthquake.latitude, earthquake.longitude]}>
                <Popup>
                  <div>
                    <strong>{earthquake.magnitude} Büyüklüğünde Deprem</strong><br/>
                    {earthquake.location}<br/>
                    Derinlik: {earthquake.depth} km
                  </div>
                </Popup>
              </LeafletMarker>
            )}
          </MapContainer>
        );
      } else {
        return (
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map-outline" size={64} color={theme.colors.secondaryText} />
            <Text style={[styles.mapPlaceholderText, { color: theme.colors.secondaryText }]}>
              Harita yükleniyor...
            </Text>
          </View>
        );
      }
    } else {
      // Mobile için React Native Maps
      if (MapView && Marker && earthquake.latitude && earthquake.longitude) {
        console.log('Rendering React Native Maps for mobile');
        return (
          <MapView
            style={styles.map}
            provider={PROVIDER_GOOGLE}
            initialRegion={{
              latitude: earthquake.latitude,
              longitude: earthquake.longitude,
              latitudeDelta: 0.5,
              longitudeDelta: 0.5,
            }}
            showsUserLocation={false}
            showsMyLocationButton={false}
            zoomEnabled={true}
            scrollEnabled={true}
          >
            <Marker
              coordinate={{
                latitude: earthquake.latitude,
                longitude: earthquake.longitude,
              }}
              title={`${earthquake.magnitude} Büyüklüğünde Deprem`}
              description={`${earthquake.location} - Derinlik: ${earthquake.depth} km`}
              pinColor={getSeverityColor(earthquake.magnitude)}
            />
          </MapView>
        );
      } else {
        console.log('MapView not available for mobile platform');
        return (
          <View style={styles.mapPlaceholder}>
            <Ionicons name="map-outline" size={64} color={theme.colors.secondaryText} />
            <Text style={[styles.mapPlaceholderText, { color: theme.colors.secondaryText }]}>
              {Platform.OS === 'android' || Platform.OS === 'ios' ? 
                'Harita yükleniyor...' : 
                'Deprem konumu haritası'
              }
            </Text>
          </View>
        );
      }
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



        {/* Magnitude Badge */}
        <View style={styles.magnitudeBadgeContainer}>
          <View style={[styles.magnitudeBadge, { backgroundColor: getSeverityColor(earthquake.magnitude) }]}>
            <Text style={styles.magnitudeBadgeText}>{earthquake.magnitude}</Text>
            <Text style={styles.magnitudeBadgeLabel}>BÜYÜKLÜK</Text>
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
    height: screenHeight * 0.4, // Ekran yüksekliğinin %40'ı
    minHeight: 250,
    maxHeight: 400,
    position: 'relative',
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 6,
  },
  mapContainer: {
    flex: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  mapPlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 16,
  },
  mapPlaceholderText: {
    marginTop: 16,
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },

  detailsCard: {
    marginHorizontal: 16,
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 20,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
  },
  cardHeader: {
    marginBottom: 24,
    alignItems: 'center',
  },
  locationTitle: {
    fontSize: screenWidth > 400 ? 26 : 22,
    fontWeight: '800',
    marginBottom: 6,
    textAlign: 'center',
    lineHeight: screenWidth > 400 ? 32 : 28,
  },
  locationSubtitle: {
    fontSize: 16,
    fontWeight: '600',
    opacity: 0.7,
  },
  detailsGrid: {
    gap: 20,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 16,
  },
  detailItem: {
    flex: 1,
    alignItems: 'center',
    gap: 10,
    backgroundColor: 'rgba(0,0,0,0.02)',
    padding: 16,
    borderRadius: 12,
    minHeight: 80,
    justifyContent: 'center',
  },
  detailLabel: {
    fontSize: 11,
    fontWeight: '600',
    textAlign: 'center',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    opacity: 0.6,
  },
  detailValue: {
    fontSize: screenWidth > 400 ? 18 : 16,
    fontWeight: '800',
    textAlign: 'center',
  },
  magnitudeBadgeContainer: {
    alignItems: 'center',
    marginTop: -30,
    marginBottom: 10,
    zIndex: 10,
  },
  magnitudeBadge: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 10,
    borderWidth: 4,
    borderColor: '#fff',
  },
  magnitudeBadgeText: {
    fontSize: 20,
    fontWeight: '900',
    color: '#fff',
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
  magnitudeBadgeLabel: {
    fontSize: 8,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
    marginTop: 2,
    textShadowColor: 'rgba(0,0,0,0.3)',
    textShadowOffset: { width: 1, height: 1 },
    textShadowRadius: 2,
  },
});

export default EarthquakeDetailScreen;