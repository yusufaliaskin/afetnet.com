import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Alert,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Location from 'expo-location';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import earthquakeService from '../services/earthquakeService';
import Header from '../components/Header';

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

const MapScreen = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const insets = useSafeAreaInsets();

  const [userLocation, setUserLocation] = useState(null);
  const [earthquakes, setEarthquakes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [mapCenter, setMapCenter] = useState([39.9334, 32.8597]); // Ankara koordinatları
  const [lastUpdateTime, setLastUpdateTime] = useState(null);

  // Konum izni isteme
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Konum İzni',
          'Harita özelliklerini kullanabilmek için konum iznine ihtiyacımız var.'
        );
        return false;
      }
      return true;
    } catch (error) {
      console.error('Konum izni hatası:', error);
      return false;
    }
  };

  // Kullanıcının konumunu al
  const getUserLocation = async () => {
    try {
      const hasPermission = await requestLocationPermission();
      if (!hasPermission) return;

      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const userCoords = {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      };

      setUserLocation(userCoords);
      setMapCenter([userCoords.latitude, userCoords.longitude]);
    } catch (error) {
      console.error('Konum alma hatası:', error);
      Alert.alert('Hata', 'Konum alınamadı. Lütfen tekrar deneyin.');
    }
  };

  // Deprem verilerini çek
  const fetchEarthquakes = async () => {
    try {
      setLoading(true);
      const data = await earthquakeService.getLatestEarthquakes();
      setEarthquakes(data);
      setLastUpdateTime(new Date());
      console.log(`Deprem verileri güncellendi: ${data.length} deprem bulundu`);
    } catch (error) {
      console.error('Deprem verileri alınamadı:', error);
      // Fallback mock data
      const mockData = [
        {
          id: '1',
          magnitude: 4.2,
          location: 'İstanbul',
          latitude: 41.0082,
          longitude: 28.9784,
          depth: 10,
          time: new Date().toISOString(),
          color: '#FFCC00'
        },
        {
          id: '2',
          magnitude: 3.1,
          location: 'Ankara',
          latitude: 39.9334,
          longitude: 32.8597,
          depth: 15,
          time: new Date().toISOString(),
          color: '#34C759'
        }
      ];
      setEarthquakes(mockData);
      setLastUpdateTime(new Date());
      Alert.alert('Bilgi', 'Deprem verileri yüklenemedi, örnek veriler gösteriliyor.');
    } finally {
      setLoading(false);
    }
  };

  // Deprem detaylarını göster
  const showEarthquakeDetails = (earthquake) => {
    const formatTime = (time) => {
      return new Date(time).toLocaleString('tr-TR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      });
    };

    let detailMessage = `Konum: ${earthquake.location || earthquake.region || 'Bilinmiyor'}\n`;
    detailMessage += `Büyüklük: ${earthquake.magnitude}\n`;
    detailMessage += `Derinlik: ${earthquake.depth} km\n`;
    detailMessage += `Zaman: ${formatTime(earthquake.time)}\n`;
    
    // Kandilli API'sinden gelen ek bilgiler
    if (earthquake.source) {
      detailMessage += `Kaynak: ${earthquake.source}\n`;
    }
    if (earthquake.type) {
      detailMessage += `Tip: ${earthquake.type}\n`;
    }
    if (earthquake.quality) {
      detailMessage += `Kalite: ${earthquake.quality}\n`;
    }
    if (earthquake.severity) {
      detailMessage += `Şiddet: ${earthquake.severity}\n`;
    }
    
    // Koordinat bilgileri
    detailMessage += `Koordinatlar: ${earthquake.latitude?.toFixed(4)}, ${earthquake.longitude?.toFixed(4)}`;

    Alert.alert(
      `Deprem Detayları - M${earthquake.magnitude}`,
      detailMessage,
      [
        { text: 'Tamam', style: 'default' },
        {
          text: 'Konuma Git',
          onPress: () => setMapCenter([earthquake.latitude, earthquake.longitude])
        }
      ]
    );
  };

  // Kullanıcı konumuna git
  const centerOnUser = () => {
    if (userLocation) {
      setMapCenter([userLocation.latitude, userLocation.longitude]);
    } else {
      getUserLocation();
    }
  };

  // Component mount edildiğinde
  useEffect(() => {
    getUserLocation();
    fetchEarthquakes();

    // Kandilli API için daha sık güncelleme (30 saniye)
    // Kandilli Rasathanesi verileri daha güncel olduğu için
    const interval = setInterval(() => {
      console.log('Otomatik veri güncelleme başlatılıyor...');
      fetchEarthquakes();
    }, 30000); // 30 saniye

    return () => {
      console.log('Otomatik güncelleme temizleniyor...');
      clearInterval(interval);
    };
  }, []);

  // Deprem büyüklüğüne göre marker boyutu
  const getMarkerSize = (magnitude) => {
    if (magnitude < 3) return 20;
    if (magnitude < 4) return 25;
    if (magnitude < 5) return 30;
    if (magnitude < 6) return 35;
    return 40;
  };

  // Deprem büyüklüğüne göre renk
  const getMarkerColor = (magnitude) => {
    if (magnitude < 3) return '#34C759'; // Yeşil
    if (magnitude < 4) return '#FFCC00'; // Sarı
    if (magnitude < 5) return '#FF9500'; // Turuncu
    if (magnitude < 6) return '#FF3B30'; // Kırmızı
    return '#8E4EC6'; // Mor
  };

  // Mobil görünüm için deprem rengi (getMarkerColor ile aynı)
  const getEarthquakeColor = (magnitude) => {
    return getMarkerColor(magnitude);
  };

  // Özel deprem marker'ı oluştur
  const createEarthquakeIcon = (earthquake) => {
    const size = getMarkerSize(earthquake.magnitude);
    const color = earthquake.color || getMarkerColor(earthquake.magnitude);
    
    return L.divIcon({
      html: `<div style="
        width: ${size}px;
        height: ${size}px;
        background-color: ${color};
        border: 2px solid white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: ${size * 0.4}px;
        font-weight: bold;
        color: white;
        box-shadow: 0 2px 4px rgba(0,0,0,0.3);
      ">${earthquake.magnitude}</div>`,
      className: 'earthquake-marker',
      iconSize: [size, size],
      iconAnchor: [size / 2, size / 2]
    });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.background, paddingTop: insets.top }]}>
      {/* Header */}
      <Header 
        title="Deprem Haritası"
        customRightComponent={
          <View style={styles.headerRight}>
            {lastUpdateTime && (
              <Text style={[styles.updateTimeText, { color: theme.colors.secondaryText }]}>
                {lastUpdateTime.toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' })}
              </Text>
            )}
            <TouchableOpacity onPress={fetchEarthquakes} style={styles.refreshButton}>
              <Ionicons name="refresh" size={24} color={theme.colors.icon} />
            </TouchableOpacity>
          </View>
        }
      />

      {/* Map Container */}
      <View style={styles.mapContainer}>
        {Platform.OS === 'web' ? (
          <MapContainer
            center={mapCenter}
            zoom={7}
            style={{ height: '100%', width: '100%' }}
            key={`${mapCenter[0]}-${mapCenter[1]}`}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            />
            
            {/* Kullanıcı konumu */}
            {userLocation && (
              <Marker
                position={[userLocation.latitude, userLocation.longitude]}
                icon={L.icon({
                  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
                  iconSize: [25, 41],
                  iconAnchor: [12, 41]
                })}
              >
                <Popup>Konumunuz</Popup>
              </Marker>
            )}
            
            {/* Deprem marker'ları */}
            {earthquakes.map((earthquake) => (
              <Marker
                key={earthquake.id}
                position={[earthquake.latitude, earthquake.longitude]}
                icon={createEarthquakeIcon(earthquake)}
                eventHandlers={{
                  click: () => showEarthquakeDetails(earthquake)
                }}
              >
                <Popup>
                  <div style={{ minWidth: '250px', fontSize: '14px' }}>
                    <div style={{ fontWeight: 'bold', fontSize: '16px', marginBottom: '8px', color: '#d32f2f' }}>
                      M{earthquake.magnitude} Deprem
                    </div>
                    <div style={{ marginBottom: '4px' }}>
                      <strong>Konum:</strong> {earthquake.location || earthquake.region || 'Bilinmiyor'}
                    </div>
                    <div style={{ marginBottom: '4px' }}>
                      <strong>Derinlik:</strong> {earthquake.depth} km
                    </div>
                    <div style={{ marginBottom: '4px' }}>
                      <strong>Zaman:</strong> {new Date(earthquake.time).toLocaleString('tr-TR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit'
                      })}
                    </div>
                    {earthquake.source && (
                      <div style={{ marginBottom: '4px' }}>
                        <strong>Kaynak:</strong> {earthquake.source}
                      </div>
                    )}
                    {earthquake.type && (
                      <div style={{ marginBottom: '4px' }}>
                        <strong>Tip:</strong> {earthquake.type}
                      </div>
                    )}
                    {earthquake.quality && (
                      <div style={{ marginBottom: '4px' }}>
                        <strong>Kalite:</strong> {earthquake.quality}
                      </div>
                    )}
                    {earthquake.severity && (
                      <div style={{ marginBottom: '4px' }}>
                        <strong>Şiddet:</strong> {earthquake.severity}
                      </div>
                    )}
                    <div style={{ marginTop: '8px', fontSize: '12px', color: '#666' }}>
                      <strong>Koordinatlar:</strong> {earthquake.latitude?.toFixed(4)}, {earthquake.longitude?.toFixed(4)}
                    </div>
                  </div>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        ) : (
          <View style={styles.mobileMapContainer}>
            <View style={[styles.mobileHeader, { backgroundColor: theme.colors.surface }]}>
              <Text style={[styles.mobileHeaderText, { color: theme.colors.text }]}>
                Yakın Depremler ({earthquakes.length})
              </Text>
              <Text style={[styles.mobileSubText, { color: theme.colors.text }]}>
                Deprem konumları listesi
              </Text>
            </View>
            <View style={styles.earthquakeList}>
              {earthquakes.slice(0, 10).map((earthquake) => (
                <TouchableOpacity
                  key={earthquake.id}
                  style={[styles.earthquakeItem, { backgroundColor: theme.colors.background }]}
                  onPress={() => showEarthquakeDetails(earthquake)}
                >
                  <View style={[
                    styles.magnitudeIndicator,
                    { backgroundColor: getEarthquakeColor(earthquake.magnitude) }
                  ]}>
                    <Text style={styles.magnitudeText}>{earthquake.magnitude}</Text>
                  </View>
                  <View style={styles.earthquakeInfo}>
                    <Text style={[styles.earthquakeLocation, { color: theme.colors.text }]} numberOfLines={1}>
                      {earthquake.location || earthquake.region || 'Bilinmiyor'}
                    </Text>
                    <Text style={[styles.earthquakeTime, { color: theme.colors.text }]}>
                      {new Date(earthquake.time).toLocaleString('tr-TR', {
                        year: 'numeric',
                        month: '2-digit',
                        day: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </Text>
                    <Text style={[styles.earthquakeDepth, { color: theme.colors.text }]}>
                      Derinlik: {earthquake.depth} km {earthquake.source ? `• ${earthquake.source}` : ''}
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.text} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      </View>

      {/* Controls */}
      <View style={styles.controls}>
        <TouchableOpacity
          style={[styles.controlButton, { backgroundColor: theme.colors.primary }]}
          onPress={centerOnUser}
        >
          <Ionicons name="locate" size={24} color={theme.colors.onPrimary} />
        </TouchableOpacity>
      </View>

      {/* Legend */}
      <View style={[styles.legend, { backgroundColor: theme.colors.surface }]}>
        <Text style={[styles.legendTitle, { color: theme.colors.text }]}>Deprem Büyüklüğü</Text>
        <View style={styles.legendItems}>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#34C759' }]} />
            <Text style={[styles.legendText, { color: theme.colors.text }]}>{'< 3.0'}</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#FFCC00' }]} />
            <Text style={[styles.legendText, { color: theme.colors.text }]}>3.0-4.0</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#FF9500' }]} />
            <Text style={[styles.legendText, { color: theme.colors.text }]}>4.0-5.0</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#FF3B30' }]} />
            <Text style={[styles.legendText, { color: theme.colors.text }]}>5.0-6.0</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendColor, { backgroundColor: '#8E4EC6' }]} />
            <Text style={[styles.legendText, { color: theme.colors.text }]}>6.0+</Text>
          </View>
        </View>
      </View>

      {/* Loading Overlay */}
      {loading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
          <Text style={[styles.loadingText, { color: theme.colors.text }]}>
            Deprem verileri yükleniyor...
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  updateTimeText: {
    fontSize: 12,
    fontWeight: '500',
  },
  refreshButton: {
    padding: 8,
  },
  mapContainer: {
    flex: 1,
  },
  mobileMapContainer: {
    flex: 1,
  },
  mobileHeader: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  mobileHeaderText: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  mobileSubText: {
    fontSize: 14,
    opacity: 0.7,
  },
  earthquakeList: {
    flex: 1,
    padding: 10,
  },
  earthquakeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    marginVertical: 5,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.22,
    shadowRadius: 2.22,
  },
  magnitudeIndicator: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  magnitudeText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  earthquakeInfo: {
    flex: 1,
  },
  earthquakeLocation: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 3,
  },
  earthquakeTime: {
    fontSize: 14,
    opacity: 0.7,
    marginBottom: 2,
  },
  earthquakeDepth: {
    fontSize: 13,
    opacity: 0.6,
  },
  controls: {
    position: 'absolute',
    right: 20,
    bottom: 120,
  },
  controlButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  legend: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    padding: 15,
    borderRadius: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  legendTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  legendItems: {
    flexDirection: 'column',
  },
  legendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
  },
  legendColor: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: 8,
  },
  legendText: {
    fontSize: 12,
  },
  loadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
  },
});

export default MapScreen;