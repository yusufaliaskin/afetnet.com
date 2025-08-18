import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  Animated,
  Dimensions,
  StyleSheet,
  TouchableOpacity,
  ScrollView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useNotification } from '../contexts/NotificationContext';
import { DISASTER_TYPES, SEVERITY_LEVELS } from '../services/disasterService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

const DisasterVisualization = () => {
  const { theme } = useTheme();
  const { getActiveDisasters, getCriticalDisasters } = useNotification();
  const [disasters, setDisasters] = useState([]);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;

  // Animasyonları başlat
  useEffect(() => {
    // Giriş animasyonu
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      })
    ]).start();

    // Sürekli pulse animasyonu
    const pulseAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        })
      ])
    );
    pulseAnimation.start();

    return () => pulseAnimation.stop();
  }, []);

  // Afet verilerini güncelle
  useEffect(() => {
    const updateDisasters = () => {
      const activeDisasters = getActiveDisasters();
      setDisasters(activeDisasters);
    };

    updateDisasters();
    const interval = setInterval(updateDisasters, 5000); // 5 saniyede bir güncelle

    return () => clearInterval(interval);
  }, [getActiveDisasters]);

  // Afet türüne göre ikon getir
  const getDisasterIcon = (type) => {
    switch (type) {
      case DISASTER_TYPES.EARTHQUAKE:
        return 'earth';
      case DISASTER_TYPES.FIRE:
        return 'flame';
      case DISASTER_TYPES.FLOOD:
        return 'water';
      case DISASTER_TYPES.STORM:
        return 'thunderstorm';
      case DISASTER_TYPES.LANDSLIDE:
        return 'triangle';
      default:
        return 'alert-circle';
    }
  };

  // Afet türüne göre renk getir
  const getDisasterColor = (type) => {
    switch (type) {
      case DISASTER_TYPES.EARTHQUAKE:
        return '#FF6B35';
      case DISASTER_TYPES.FIRE:
        return '#FF4500';
      case DISASTER_TYPES.FLOOD:
        return '#1E90FF';
      case DISASTER_TYPES.STORM:
        return '#9370DB';
      case DISASTER_TYPES.LANDSLIDE:
        return '#8B4513';
      default:
        return theme.colors.primary;
    }
  };

  // Şiddet seviyesine göre renk getir
  const getSeverityColor = (severity) => {
    switch (severity) {
      case SEVERITY_LEVELS.CRITICAL:
        return '#DC143C';
      case SEVERITY_LEVELS.HIGH:
        return '#FF6347';
      case SEVERITY_LEVELS.MEDIUM:
        return '#FFA500';
      case SEVERITY_LEVELS.LOW:
        return '#32CD32';
      default:
        return theme.colors.textSecondary;
    }
  };

  // Şiddet seviyesi metni
  const getSeverityText = (severity) => {
    switch (severity) {
      case SEVERITY_LEVELS.CRITICAL:
        return 'Kritik';
      case SEVERITY_LEVELS.HIGH:
        return 'Yüksek';
      case SEVERITY_LEVELS.MEDIUM:
        return 'Orta';
      case SEVERITY_LEVELS.LOW:
        return 'Düşük';
      default:
        return 'Bilinmiyor';
    }
  };

  // Zaman formatı
  const formatTime = (timestamp) => {
    const now = new Date();
    const disasterTime = new Date(timestamp);
    const diffInMinutes = Math.floor((now - disasterTime) / (1000 * 60));
    
    if (diffInMinutes < 1) return 'Şimdi';
    if (diffInMinutes < 60) return `${diffInMinutes}dk önce`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}sa önce`;
    return disasterTime.toLocaleDateString('tr-TR');
  };

  // Filtrelenmiş afetler
  const filteredDisasters = disasters.filter(disaster => {
    if (selectedFilter === 'all') return true;
    if (selectedFilter === 'critical') return disaster.severity === SEVERITY_LEVELS.CRITICAL;
    return disaster.type === selectedFilter;
  });

  // Filtre butonları
  const filterButtons = [
    { key: 'all', label: 'Tümü', icon: 'list' },
    { key: 'critical', label: 'Kritik', icon: 'warning' },
    { key: DISASTER_TYPES.EARTHQUAKE, label: 'Deprem', icon: 'earth' },
    { key: DISASTER_TYPES.FIRE, label: 'Yangın', icon: 'flame' },
    { key: DISASTER_TYPES.FLOOD, label: 'Sel', icon: 'water' },
    { key: DISASTER_TYPES.STORM, label: 'Fırtına', icon: 'thunderstorm' },
  ];

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      padding: 20,
      paddingTop: 10,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 8,
    },
    subtitle: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      marginBottom: 20,
    },
    filterContainer: {
      paddingHorizontal: 20,
      marginBottom: 20,
    },
    filterScrollView: {
      flexDirection: 'row',
    },
    filterButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 8,
      marginRight: 12,
      borderRadius: 20,
      backgroundColor: theme.colors.cardBackground,
      borderWidth: 1,
      borderColor: theme.colors.border,
    },
    filterButtonActive: {
      backgroundColor: theme.colors.primary,
      borderColor: theme.colors.primary,
    },
    filterIcon: {
      marginRight: 6,
    },
    filterText: {
      fontSize: 14,
      color: theme.colors.text,
      fontWeight: '500',
    },
    filterTextActive: {
      color: '#FFFFFF',
    },
    disasterList: {
      flex: 1,
      paddingHorizontal: 20,
    },
    disasterCard: {
      backgroundColor: theme.colors.cardBackground,
      borderRadius: 16,
      padding: 16,
      marginBottom: 16,
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 4,
      },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
      borderLeftWidth: 4,
    },
    disasterHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 12,
    },
    disasterIconContainer: {
      width: 48,
      height: 48,
      borderRadius: 24,
      alignItems: 'center',
      justifyContent: 'center',
      marginRight: 16,
    },
    disasterInfo: {
      flex: 1,
    },
    disasterTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.colors.text,
      marginBottom: 4,
    },
    disasterLocation: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      marginBottom: 2,
    },
    disasterTime: {
      fontSize: 12,
      color: theme.colors.textSecondary,
    },
    severityBadge: {
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 12,
      alignSelf: 'flex-start',
    },
    severityText: {
      fontSize: 12,
      fontWeight: 'bold',
      color: '#FFFFFF',
    },
    disasterDetails: {
      marginTop: 12,
      paddingTop: 12,
      borderTopWidth: 1,
      borderTopColor: theme.colors.border,
    },
    detailRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginBottom: 8,
    },
    detailLabel: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      fontWeight: '500',
    },
    detailValue: {
      fontSize: 14,
      color: theme.colors.text,
      fontWeight: 'bold',
    },
    emptyContainer: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
      paddingVertical: 60,
    },
    emptyIcon: {
      marginBottom: 16,
      opacity: 0.5,
    },
    emptyText: {
      fontSize: 18,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginBottom: 8,
    },
    emptySubtext: {
      fontSize: 14,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      opacity: 0.7,
    },
  });

  return (
    <Animated.View 
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY: slideAnim }]
        }
      ]}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Aktif Afetler</Text>
        <Text style={styles.subtitle}>
          {disasters.length} aktif afet • {getCriticalDisasters().length} kritik durum
        </Text>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView 
          horizontal 
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.filterScrollView}
        >
          {filterButtons.map((filter) => (
            <TouchableOpacity
              key={filter.key}
              style={[
                styles.filterButton,
                selectedFilter === filter.key && styles.filterButtonActive
              ]}
              onPress={() => setSelectedFilter(filter.key)}
            >
              <Ionicons
                name={filter.icon}
                size={16}
                color={selectedFilter === filter.key ? '#FFFFFF' : theme.colors.text}
                style={styles.filterIcon}
              />
              <Text style={[
                styles.filterText,
                selectedFilter === filter.key && styles.filterTextActive
              ]}>
                {filter.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView style={styles.disasterList} showsVerticalScrollIndicator={false}>
        {filteredDisasters.length > 0 ? (
          filteredDisasters.map((disaster, index) => (
            <Animated.View
              key={disaster.id}
              style={[
                styles.disasterCard,
                {
                  borderLeftColor: getDisasterColor(disaster.type),
                  transform: disaster.severity === SEVERITY_LEVELS.CRITICAL ? 
                    [{ scale: pulseAnim }] : [{ scale: 1 }]
                }
              ]}
            >
              <View style={styles.disasterHeader}>
                <View style={[
                  styles.disasterIconContainer,
                  { backgroundColor: getDisasterColor(disaster.type) + '20' }
                ]}>
                  <Ionicons
                    name={getDisasterIcon(disaster.type)}
                    size={24}
                    color={getDisasterColor(disaster.type)}
                  />
                </View>
                <View style={styles.disasterInfo}>
                  <Text style={styles.disasterTitle}>{disaster.title}</Text>
                  <Text style={styles.disasterLocation}>{disaster.location}</Text>
                  <Text style={styles.disasterTime}>{formatTime(disaster.timestamp)}</Text>
                </View>
                <View style={[
                  styles.severityBadge,
                  { backgroundColor: getSeverityColor(disaster.severity) }
                ]}>
                  <Text style={styles.severityText}>
                    {getSeverityText(disaster.severity)}
                  </Text>
                </View>
              </View>

              <View style={styles.disasterDetails}>
                {disaster.type === DISASTER_TYPES.EARTHQUAKE && (
                  <>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Büyüklük:</Text>
                      <Text style={styles.detailValue}>{disaster.magnitude}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Derinlik:</Text>
                      <Text style={styles.detailValue}>{disaster.depth}</Text>
                    </View>
                  </>
                )}
                {disaster.type === DISASTER_TYPES.FIRE && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Etkilenen Alan:</Text>
                    <Text style={styles.detailValue}>{disaster.area}</Text>
                  </View>
                )}
                {disaster.type === DISASTER_TYPES.FLOOD && (
                  <>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Su Seviyesi:</Text>
                      <Text style={styles.detailValue}>{disaster.waterLevel}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <Text style={styles.detailLabel}>Yağış:</Text>
                      <Text style={styles.detailValue}>{disaster.rainfall}</Text>
                    </View>
                  </>
                )}
                {disaster.type === DISASTER_TYPES.STORM && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Rüzgar Hızı:</Text>
                    <Text style={styles.detailValue}>{disaster.windSpeed}</Text>
                  </View>
                )}
                {disaster.type === DISASTER_TYPES.LANDSLIDE && (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Hacim:</Text>
                    <Text style={styles.detailValue}>{disaster.volume}</Text>
                  </View>
                )}
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Etkilenen Nüfus:</Text>
                  <Text style={styles.detailValue}>
                    {disaster.affectedPopulation?.toLocaleString('tr-TR')} kişi
                  </Text>
                </View>
              </View>
            </Animated.View>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons
              name="shield-checkmark"
              size={64}
              color={theme.colors.textSecondary}
              style={styles.emptyIcon}
            />
            <Text style={styles.emptyText}>Aktif afet bulunmuyor</Text>
            <Text style={styles.emptySubtext}>
              {selectedFilter === 'all' 
                ? 'Şu anda herhangi bir afet bildirimi yok'
                : 'Bu kategoride aktif afet bulunmuyor'
              }
            </Text>
          </View>
        )}
      </ScrollView>
    </Animated.View>
  );
};

export default DisasterVisualization;