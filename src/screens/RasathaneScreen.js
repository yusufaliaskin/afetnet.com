import React, { useState, useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  Dimensions,
  ActivityIndicator,
  RefreshControl,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import earthquakeService from '../services/earthquakeService';

const RasathaneScreen = () => {
  const { t } = useLanguage();
  const { theme } = useTheme();
  const styles = createStyles(theme);
  const navigation = useNavigation();
  const [searchText, setSearchText] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [isFilterPanelOpen, setIsFilterPanelOpen] = useState(false);
  const [earthquakeData, setEarthquakeData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastUpdateTime, setLastUpdateTime] = useState(null);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [selectedDate, setSelectedDate] = useState(null);
  const [isDatePickerOpen, setIsDatePickerOpen] = useState(false);
  const [isSearchPanelOpen, setIsSearchPanelOpen] = useState(false);
  const [searchInputRef, setSearchInputRef] = useState(null);
  
  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(20);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [allEarthquakeData, setAllEarthquakeData] = useState([]);
  
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = Dimensions.get('window');
  
  // Animation values
  const fadeAnim = useState(new Animated.Value(0))[0];
  const slideAnim = useState(new Animated.Value(50))[0];
  const scaleAnim = useState(new Animated.Value(0.95))[0];
  const searchPanelAnim = useState(new Animated.Value(0))[0];

  // Canlı deprem verilerini yükle - pagination desteği ile
  const loadEarthquakeData = async (showAlert = true, reset = false) => {
    try {
      if (reset) {
        setIsLoading(true);
        setCurrentPage(1);
        setHasMore(true);
      }
      setError(null);
      
      // İlk yükleme için daha fazla veri çek (100 yerine 200)
      const data = await earthquakeService.getLatestEarthquakes(200, 0);
      
      if (!data || data.length === 0) {
        throw new Error('Veri bulunamadı');
      }
      
      // Veriyi formatla - artçı deprem bilgilerini de dahil et
      const formattedData = data.map(earthquake => ({
        ...earthquake,
        displayTime: earthquake.time.toLocaleTimeString('tr-TR', { 
          hour: '2-digit', 
          minute: '2-digit' 
        }),
        fullDateTime: earthquake.formattedTime,
        dateOnly: earthquake.formattedDate
      }));
      
      // Tüm veriyi sakla
      setAllEarthquakeData(formattedData);
      
      // İlk 20 veriyi göster
      const initialData = formattedData.slice(0, itemsPerPage);
      setEarthquakeData(initialData);
      
      // Daha fazla veri var mı kontrol et
      setHasMore(formattedData.length > itemsPerPage);
      
      setLastUpdateTime(new Date());
      setRetryCount(0);
      
      console.log(`✅ Deprem verileri başarıyla yüklendi: ${formattedData.length} toplam, ${initialData.length} gösteriliyor`);
    } catch (error) {
      console.error('Deprem verileri yüklenirken hata:', error);
      
      const errorMessage = error.message || 'Bilinmeyen hata';
      let userMessage = 'Veriler çekilemiyor.';
      
      if (errorMessage.includes('Network')) {
        userMessage = 'İnternet bağlantınızı kontrol edin.';
      } else if (errorMessage.includes('timeout')) {
        userMessage = 'Sunucu yanıt vermiyor. Lütfen tekrar deneyin.';
      } else if (errorMessage.includes('Veri bulunamadı')) {
        userMessage = 'Şu anda deprem verisi bulunmuyor.';
      }
      
      setError({
        message: userMessage,
        technical: errorMessage,
        timestamp: new Date()
      });
      
      if (retryCount < 3) {
        setRetryCount(prev => prev + 1);
        console.log(`🔄 Otomatik yeniden deneme: ${retryCount + 1}/3`);
        setTimeout(() => loadEarthquakeData(false, reset), 2000 * (retryCount + 1));
      } else if (showAlert) {
        Alert.alert('Hata', `${userMessage} Lütfen tekrar deneyin.`);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // "Daha Fazla Yükle" fonksiyonu
  const loadMoreData = async () => {
    if (isLoadingMore || !hasMore) return;
    
    try {
      setIsLoadingMore(true);
      
      const nextPage = currentPage + 1;
      const startIndex = (nextPage - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;
      
      // Mevcut verilerden sonraki 20 veriyi al
      const newData = allEarthquakeData.slice(startIndex, endIndex);
      
      if (newData.length > 0) {
        setEarthquakeData(prev => [...prev, ...newData]);
        setCurrentPage(nextPage);
        
        // Daha fazla veri var mı kontrol et
        setHasMore(endIndex < allEarthquakeData.length);
        
        console.log(`📄 Sayfa ${nextPage} yüklendi: ${newData.length} yeni veri`);
      } else {
        setHasMore(false);
        console.log('📄 Tüm veriler yüklendi');
      }
    } catch (error) {
      console.error('Daha fazla veri yüklenirken hata:', error);
    } finally {
      setIsLoadingMore(false);
    }
  };

  // Verileri yenile
  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      setRetryCount(0);
      console.log('🔄 Manuel yenileme başlatıldı');
      await loadEarthquakeData(true, true);
    } catch (error) {
      console.error('Veri yenileme hatası:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Hata durumunda yeniden deneme
  const handleRetry = async () => {
    setRetryCount(0);
    await loadEarthquakeData(true);
  };

  // getSeverityColor artık earthquakeService'den geliyor

  // Animasyon fonksiyonları
  const startEntranceAnimations = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Component mount edildiğinde veri yükle ve animasyonları başlat
  useEffect(() => {
    loadEarthquakeData(true, true); // İlk yükleme - reset ile
    startEntranceAnimations();
  }, []);

  // Sayfa odaklandığında veri yenile
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', () => {
      console.log('Sayfa odaklandı, veri güncelleniyor...');
      loadEarthquakeData(false, true);
    });

    return unsubscribe;
  }, [navigation]);

  // Arama paneli animasyonu
  useEffect(() => {
    if (isSearchPanelOpen) {
      Animated.timing(searchPanelAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(searchPanelAnim, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [isSearchPanelOpen]);

  // Optimize filtering with useMemo to prevent unnecessary re-calculations
  const filteredData = useMemo(() => {
    return earthquakeData.filter(item => {
      const matchesSearch = item.location.toLowerCase().includes(searchText.toLowerCase());
      
      // Tarih filtresi
      let matchesDate = true;
      if (selectedDate) {
        const itemDate = new Date(item.time).toDateString();
        const filterDate = selectedDate.toDateString();
        matchesDate = itemDate === filterDate;
      }
      
      // Büyüklük filtresi
      let matchesMagnitude = true;
      if (selectedFilter === 'high') matchesMagnitude = item.magnitude >= 5.0;
      else if (selectedFilter === 'medium') matchesMagnitude = item.magnitude >= 3.0 && item.magnitude < 5.0;
      else if (selectedFilter === 'low') matchesMagnitude = item.magnitude < 3.0;
      
      return matchesSearch && matchesDate && matchesMagnitude;
    });
  }, [earthquakeData, searchText, selectedDate, selectedFilter]);

  const [pressedCard, setPressedCard] = useState(null);
  const cardScaleAnims = useRef({}).current;

  const getCardScaleAnim = (earthquakeId) => {
    if (!cardScaleAnims[earthquakeId]) {
      cardScaleAnims[earthquakeId] = new Animated.Value(1);
    }
    return cardScaleAnims[earthquakeId];
  };

  const handleEarthquakePress = (earthquake) => {
    const scaleAnim = getCardScaleAnim(earthquake.id);
    
    // Kart basma animasyonu
    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 0.96,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 150,
        useNativeDriver: true,
      })
    ]).start();
    
    // Navigate to EarthquakeDetailScreen
    navigation.navigate('EarthquakeDetail', { earthquake });
  };

  const handleCardPressIn = (earthquakeId) => {
    setPressedCard(earthquakeId);
    const scaleAnim = getCardScaleAnim(earthquakeId);
    Animated.timing(scaleAnim, {
      toValue: 0.98,
      duration: 100,
      useNativeDriver: true,
    }).start();
  };

  const handleCardPressOut = (earthquakeId) => {
    setPressedCard(null);
    const scaleAnim = getCardScaleAnim(earthquakeId);
    Animated.timing(scaleAnim, {
      toValue: 1,
      duration: 150,
      useNativeDriver: true,
    }).start();
  };

  const showDetails = (earthquake) => {
    const detailText = `Büyüklük: ${earthquake.magnitude}\nKonum: ${earthquake.location}\nTarih: ${earthquake.dateOnly}\nSaat: ${earthquake.displayTime}\nDerinlik: ${earthquake.depth} km\nEnlem: ${earthquake.latitude?.toFixed(4)}\nBoylam: ${earthquake.longitude?.toFixed(4)}\nVeri Kaynağı: ${earthquake.source}\nŞiddet Seviyesi: ${earthquake.severity}\nDeprem Türü: ${earthquake.type}\n\nBu veriler AFAD API'sinden anlık olarak çekilmektedir.`;
    
    Alert.alert(
      'Detaylı Deprem Bilgileri',
      detailText,
      [{ text: 'Tamam' }]
    );
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <Animated.View 
        style={[
          styles.header, 
          { 
            backgroundColor: theme.colors.primary,
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }]
          }
        ]}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.navigate('Anasayfa')}
        >
          <Ionicons name="chevron-back" size={24} color={theme.colors.onPrimary} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: theme.colors.onPrimary }]}>Rasathane</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity 
            style={styles.calendarButton}
            onPress={() => setIsDatePickerOpen(!isDatePickerOpen)}
          >
            <Ionicons name="calendar" size={24} color={theme.colors.onPrimary} />
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.filterButton, isFilterPanelOpen && styles.filterButtonActive]}
            onPress={() => setIsFilterPanelOpen(!isFilterPanelOpen)}
          >
            <Ionicons name="options" size={24} color={theme.colors.onPrimary} />
            {(selectedFilter !== 'all' || selectedDate) && (
              <View style={styles.filterIndicator} />
            )}
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.searchButton}
            onPress={() => setIsSearchPanelOpen(!isSearchPanelOpen)}
          >
            <Ionicons name="search" size={24} color={theme.colors.onPrimary} />
          </TouchableOpacity>
        </View>
      </Animated.View>

      {/* Search Bar - Conditionally Rendered */}
      {isSearchPanelOpen && (
        <Animated.View 
          style={[
            styles.searchContainer, 
            { 
              backgroundColor: theme.colors.cardBackground,
              opacity: searchPanelAnim,
              transform: [
                { 
                  translateY: searchPanelAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [-20, 0]
                  })
                },
                { 
                  scale: searchPanelAnim.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.95, 1]
                  })
                }
              ]
            }
          ]}
        >
          <Ionicons name="search" size={20} color={theme.colors.secondaryText} style={styles.searchIcon} />
          <TextInput
            ref={setSearchInputRef}
            style={[styles.searchInput, { color: theme.colors.text }]}
            placeholder="Konum Ara"
            value={searchText}
            onChangeText={setSearchText}
            placeholderTextColor={theme.colors.secondaryText}
            autoFocus={true}
          />
        </Animated.View>
      )}

      {/* Date Picker Panel */}
      {isDatePickerOpen && (
        <View style={[styles.datePickerPanel, { backgroundColor: theme.colors.cardBackground, borderBottomColor: theme.colors.border }]}>
          <View style={styles.datePickerHeader}>
            <Text style={[styles.datePickerTitle, { color: theme.colors.text }]}>Tarih Filtresi</Text>
            <TouchableOpacity 
              onPress={() => setIsDatePickerOpen(false)}
              style={styles.datePickerCloseButton}
            >
              <Ionicons name="close" size={18} color={theme.colors.secondaryText} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.datePickerContent}>
            <TouchableOpacity 
              style={[styles.dateOption, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }, !selectedDate && { backgroundColor: theme.colors.primary }]}
              onPress={() => {
                setSelectedDate(null);
                setIsDatePickerOpen(false);
              }}
            >
              <Text style={[styles.dateOptionText, { color: theme.colors.text }, !selectedDate && { color: theme.colors.onPrimary }]}>Tüm Tarihler</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.dateOption, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }, selectedDate && selectedDate.toDateString() === new Date().toDateString() && { backgroundColor: theme.colors.primary }]}
              onPress={() => {
                setSelectedDate(new Date());
                setIsDatePickerOpen(false);
              }}
            >
              <Text style={[styles.dateOptionText, { color: theme.colors.text }, selectedDate && selectedDate.toDateString() === new Date().toDateString() && { color: theme.colors.onPrimary }]}>Bugün</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.dateOption, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              onPress={() => {
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                setSelectedDate(yesterday);
                setIsDatePickerOpen(false);
              }}
            >
              <Text style={[styles.dateOptionText, { color: theme.colors.text }]}>Dün</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.dateOption, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}
              onPress={() => {
                const lastWeek = new Date();
                lastWeek.setDate(lastWeek.getDate() - 7);
                setSelectedDate(lastWeek);
                setIsDatePickerOpen(false);
              }}
            >
              <Text style={[styles.dateOptionText, { color: theme.colors.text }]}>Son 7 Gün</Text>
            </TouchableOpacity>
          </View>
          
          {selectedDate && (
            <View style={styles.selectedDateInfo}>
              <Text style={[styles.selectedDateText, { color: theme.colors.secondaryText }]}>
                Seçili Tarih: {selectedDate.toLocaleDateString('tr-TR')}
              </Text>
            </View>
          )}
        </View>
      )}

      {/* Enhanced Filter Panel */}
      {isFilterPanelOpen && (
        <Animated.View 
          style={[
            styles.compactFilterPanel, 
            { 
              backgroundColor: theme.colors.cardBackground, 
              borderBottomColor: theme.colors.border,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.compactFilterHeader}>
            <Text style={[styles.compactFilterTitle, { color: theme.colors.text }]}>Filtreler</Text>
            <TouchableOpacity 
              onPress={() => setIsFilterPanelOpen(false)}
              style={styles.compactCloseButton}
            >
              <Ionicons name="close" size={18} color={theme.colors.secondaryText} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.compactFilterSection}>
            <Text style={[styles.compactSectionTitle, { color: theme.colors.text }]}>Büyüklük</Text>
            <View style={styles.compactChipContainer}>
              <TouchableOpacity 
                style={[styles.compactFilterChip, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }, selectedFilter === 'all' && { backgroundColor: theme.colors.primary }]}
                onPress={() => setSelectedFilter('all')}
              >
                <Text style={[styles.compactFilterText, { color: theme.colors.text }, selectedFilter === 'all' && { color: theme.colors.onPrimary }]}>Tümü</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.compactFilterChip, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }, selectedFilter === 'high' && { backgroundColor: theme.colors.primary }]}
                onPress={() => setSelectedFilter('high')}
              >
                <Text style={[styles.compactFilterText, { color: theme.colors.text }, selectedFilter === 'high' && { color: theme.colors.onPrimary }]}>5.0+</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.compactFilterChip, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }, selectedFilter === 'medium' && { backgroundColor: theme.colors.primary }]}
                onPress={() => setSelectedFilter('medium')}
              >
                <Text style={[styles.compactFilterText, { color: theme.colors.text }, selectedFilter === 'medium' && { color: theme.colors.onPrimary }]}>3.0-4.9</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.compactFilterChip, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }, selectedFilter === 'low' && { backgroundColor: theme.colors.primary }]}
                onPress={() => setSelectedFilter('low')}
              >
                <Text style={[styles.compactFilterText, { color: theme.colors.text }, selectedFilter === 'low' && { color: theme.colors.onPrimary }]}>&lt;3.0</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Animated.View>
      )}

      {/* Earthquake List */}
      <ScrollView 
        style={styles.listContainer} 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={['#007AFF']}
            tintColor="#007AFF"
          />
        }
      >
        {/* Loading Indicator */}
        {isLoading && earthquakeData.length === 0 && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={theme.colors.primary} />
            <Text style={[styles.loadingText, { color: theme.colors.text }]}>Deprem verileri yükleniyor...</Text>
          </View>
        )}
        
        {/* Last Update Time and Data Info */}
        {lastUpdateTime && (
          <View style={[styles.updateTimeContainer, { backgroundColor: theme.colors.cardBackground }]}>
            <Text style={[styles.updateTimeText, { color: theme.colors.secondaryText }]}>
              Son Güncelleme: {lastUpdateTime.toLocaleDateString('tr-TR')} {lastUpdateTime.toLocaleTimeString('tr-TR')} (Kandilli Rasathanesi - Canlı Veri)
            </Text>
            {filteredData.length > 0 && (
              <Text style={[styles.dataCountText, { color: theme.colors.secondaryText }]}>
                Gösterilen: {filteredData.length} / Toplam: {allEarthquakeData.length} deprem
              </Text>
            )}
          </View>
        )}
        
        {/* Error State */}
        {!isLoading && error && (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color="#FF3B30" />
            <Text style={styles.errorTitle}>Bağlantı Hatası</Text>
            <Text style={styles.errorMessage}>{error.message}</Text>
            {retryCount > 0 && (
              <Text style={styles.retryInfo}>Otomatik yeniden deneme: {retryCount}/3</Text>
            )}
            <TouchableOpacity style={styles.retryButton} onPress={handleRetry}>
              <Text style={styles.retryButtonText}>Yeniden Dene</Text>
            </TouchableOpacity>
          </View>
        )}
        
        {/* No Data Message */}
        {!isLoading && !error && earthquakeData.length === 0 && (
          <View style={styles.noDataContainer}>
            <Ionicons name="information-circle-outline" size={48} color="#8E8E93" />
            <Text style={[styles.noDataText, { color: theme.colors.text }]}>Henüz deprem verisi bulunmuyor</Text>
            <TouchableOpacity style={[styles.retryButton, { backgroundColor: theme.colors.primary }]} onPress={handleRetry}>
              <Text style={[styles.retryButtonText, { color: theme.colors.onPrimary }]}>Yenile</Text>
            </TouchableOpacity>
          </View>
        )}
        {filteredData.map((earthquake, index) => (
          <Animated.View
            key={earthquake.id}
            style={{
              opacity: fadeAnim,
              transform: [
                {
                  translateY: Animated.add(
                    slideAnim,
                    new Animated.Value(index * 5)
                  )
                }
              ]
            }}
          >
            <TouchableOpacity 
              style={[
                styles.earthquakeCard,
                { backgroundColor: theme.colors.cardBackground, borderColor: theme.colors.border },
                earthquake.isAftershock && styles.aftershockCard,
                {
                  transform: [{ scale: getCardScaleAnim(earthquake.id) }]
                }
              ]}
              onPress={() => handleEarthquakePress(earthquake)}
              onPressIn={() => handleCardPressIn(earthquake.id)}
              onPressOut={() => handleCardPressOut(earthquake.id)}
              activeOpacity={1}
            >
              <View style={styles.cardContent}>
                <View style={styles.cardLeft}>
                  <View style={[styles.magnitudeCircle, { backgroundColor: earthquakeService.getSeverityColor(earthquake.magnitude) }]}>
                    <Text style={styles.magnitudeText}>{earthquake.magnitude}</Text>
                  </View>
                  <View style={styles.cardInfo}>
                    <Text style={[styles.locationText, { color: theme.colors.text }]} numberOfLines={2}>
                      {earthquake.location.replace('(BALIKESİR)', '').replace('(', '').replace(')', '').trim()}
                    </Text>
                    <Text style={[styles.locationSubtext, { color: theme.colors.secondaryText }]}>
                      (BALIKESİR)
                    </Text>
                    <View style={styles.cardDetails}>
                      <View style={styles.detailItem}>
                        <Ionicons name="time-outline" size={12} color={theme.colors.secondaryText} />
                        <Text style={[styles.detailText, { color: theme.colors.secondaryText }]}>{earthquake.displayTime}</Text>
                      </View>
                      <View style={styles.detailItem}>
                        <Ionicons name="location-outline" size={12} color={theme.colors.secondaryText} />
                        <Text style={[styles.detailText, { color: theme.colors.secondaryText }]}>Kandilli</Text>
                      </View>
                      {earthquake.isAftershock && (
                        <View style={styles.detailItem}>
                          <Ionicons name="warning-outline" size={12} color="#FF9500" />
                          <Text style={[styles.aftershockLabel]}>artçı</Text>
                        </View>
                      )}
                    </View>
                  </View>
                </View>
                <View style={styles.cardRight}>
                  <Ionicons name="chevron-forward" size={20} color={theme.colors.tertiaryText} />
                </View>
              </View>
            </TouchableOpacity>
          </Animated.View>
        ))}
        
        {/* Load More Button */}
        {!isLoading && !error && filteredData.length > 0 && hasMore && (
          <View style={styles.loadMoreContainer}>
            <TouchableOpacity 
              style={[
                styles.loadMoreButton, 
                { backgroundColor: theme.colors.primary },
                isLoadingMore && { opacity: 0.7 }
              ]}
              onPress={loadMoreData}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? (
                <View style={styles.loadMoreLoadingContainer}>
                  <ActivityIndicator size="small" color={theme.colors.onPrimary} />
                  <Text style={[styles.loadMoreText, { color: theme.colors.onPrimary, marginLeft: 8 }]}>Yükleniyor...</Text>
                </View>
              ) : (
                <Text style={[styles.loadMoreText, { color: theme.colors.onPrimary }]}>Daha Fazla Yükle ({itemsPerPage} veri)</Text>
              )}
            </TouchableOpacity>
            {!isLoadingMore && (
              <Text style={[styles.loadMoreHint, { color: theme.colors.secondaryText }]}>
                Kalan: {allEarthquakeData.length - earthquakeData.length} deprem
              </Text>
            )}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    backgroundColor: '#007AFF',
    borderBottomWidth: 0,
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
    marginRight: 8,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  filterButton: {
    padding: 8,
    marginRight: 8,
  },
  searchButton: {
    padding: 8,
    borderRadius: 8,
    marginLeft: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEFEFE',
    marginHorizontal: 16,
    marginVertical: 16,
    paddingHorizontal: 18,
    paddingVertical: 14,
    borderRadius: 28,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 5,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: theme.colors.text,
  },
  filterContainer: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  filterChip: {
    backgroundColor: '#FEFEFE',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  filterChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  filterText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },
  listContainer: {
    flex: 1,
    paddingHorizontal: 16,
  },
  earthquakeCard: {
    backgroundColor: '#FEFEFE',
    borderRadius: 16,
    padding: 0,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
  },
  cardRight: {
    paddingLeft: 16,
  },
  cardLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  magnitudeCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 5,
  },
  magnitudeText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  cardInfo: {
    flex: 1,
  },
  locationText: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: 4,
    lineHeight: 22,
    letterSpacing: 0.2,
  },
  locationSubtext: {
    fontSize: 15,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    marginBottom: 12,
    letterSpacing: 0.1,
  },
  cardDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  detailText: {
    fontSize: 13,
    fontWeight: '500',
    color: theme.colors.textSecondary,
  },
  distanceText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  timeText: {
    fontSize: 13,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  sourceText: {
    fontSize: 13,
    color: '#007AFF',
    fontWeight: '600',
  },
  compactFilterPanel: {
    backgroundColor: '#FEFEFE',
    marginHorizontal: 16,
    marginBottom: 12,
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  compactFilterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  compactFilterTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  compactCloseButton: {
    padding: 2,
  },
  compactFilterSection: {
    marginBottom: 0,
  },
  compactSectionTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: theme.colors.textSecondary,
    marginBottom: 6,
  },
  compactChipContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  compactFilterChip: {
    backgroundColor: '#F8F9FA',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  compactFilterChipActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  compactFilterText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  compactFilterTextActive: {
    color: '#FFFFFF',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    backgroundColor: 'rgba(0, 122, 255, 0.02)',
    borderRadius: 20,
    marginHorizontal: 16,
    marginVertical: 20,
  },
  loadingText: {
    marginTop: 20,
    fontSize: 17,
    color: '#007AFF',
    fontWeight: '600',
    letterSpacing: 0.2,
    textAlign: 'center',
  },
  updateTimeContainer: {
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
    paddingVertical: 14,
    paddingHorizontal: 18,
    borderRadius: 16,
    marginBottom: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0, 122, 255, 0.1)',
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  updateTimeText: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    fontWeight: '500',
  },
  dataCountText: {
    fontSize: 11,
    color: theme.colors.textSecondary,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(255, 59, 48, 0.02)',
    borderRadius: 20,
    marginHorizontal: 16,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 59, 48, 0.1)',
  },
  errorTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FF3B30',
    marginTop: 16,
    marginBottom: 8,
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginBottom: 12,
    textAlign: 'center',
    lineHeight: 22,
  },
  retryInfo: {
    fontSize: 14,
    color: '#FF9500',
    marginBottom: 20,
    textAlign: 'center',
    fontWeight: '600',
  },
  noDataContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 24,
    backgroundColor: 'rgba(142, 142, 147, 0.02)',
    borderRadius: 20,
    marginHorizontal: 16,
    marginVertical: 20,
    borderWidth: 1,
    borderColor: 'rgba(142, 142, 147, 0.1)',
  },
  noDataText: {
    fontSize: 16,
    color: theme.colors.textSecondary,
    marginTop: 12,
    marginBottom: 20,
    textAlign: 'center',
  },
  retryButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    marginTop: 20,
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    transform: [{ scale: 1 }],
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.3,
  },
  aftershockCard: {
    borderLeftWidth: 5,
    borderLeftColor: '#FF9500',
    backgroundColor: 'rgba(255, 149, 0, 0.04)',
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#FF9500',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.12,
    shadowRadius: 12,
    elevation: 5,
  },
  aftershockLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '700',
    marginTop: 8,
    backgroundColor: '#FF9500',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    overflow: 'hidden',
    alignSelf: 'flex-start',
    shadowColor: '#FF9500',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  dateText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginRight: 8,
  },
  filterButton: {
    marginRight: 12,
    padding: 8,
    borderRadius: 8,
    position: 'relative',
  },
  filterButtonActive: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  filterIndicator: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF9500',
  },
  calendarButton: {
    marginRight: 12,
    padding: 8,
    borderRadius: 8,
  },
  datePickerPanel: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    backgroundColor: '#FEFEFE',
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 8,
  },
  datePickerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  datePickerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: theme.colors.text,
  },
  datePickerCloseButton: {
    padding: 4,
  },
  datePickerContent: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  dateOption: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    backgroundColor: '#FEFEFE',
    marginRight: 8,
    marginBottom: 8,
  },
  dateOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: theme.colors.text,
  },
  selectedDateInfo: {
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  selectedDateText: {
    fontSize: 14,
    fontWeight: '500',
    textAlign: 'center',
    color: theme.colors.text,
  },
  loadMoreContainer: {
    paddingVertical: 20,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  loadMoreButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 12,
    shadowColor: '#007AFF',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
    minWidth: 160,
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadMoreText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.3,
  },
  loadMoreLoadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadMoreHint: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 8,
    textAlign: 'center',
    color: theme.colors.textSecondary,
  },
  aftershockLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#FF9500',
    marginLeft: 4,
  },
});

export default RasathaneScreen;