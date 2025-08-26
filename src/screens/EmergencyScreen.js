import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  Dimensions,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import * as Location from 'expo-location';
import StatusBar from '../components/StatusBar';

const EmergencyScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = Dimensions.get('window');
  const { theme } = useTheme();
  const { t } = useLanguage();
  
  // Animation values
  const fadeAnim = new Animated.Value(0);
  const slideAnim = new Animated.Value(50);
  
  // State
  const [selectedEmergencyType, setSelectedEmergencyType] = useState(null);
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState(null);
  const [locationPermission, setLocationPermission] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Emergency types
  const emergencyTypes = [
    {
      id: 'earthquake',
      title: 'Deprem',
      icon: 'warning',
      color: '#FF6B35',
      bgColor: '#FFF0ED'
    },
    {
      id: 'fire',
      title: 'Yangın',
      icon: 'flame',
      color: '#FF3B30',
      bgColor: '#FFE5E5'
    },
    {
      id: 'flood',
      title: 'Sel',
      icon: 'water',
      color: '#007AFF',
      bgColor: '#E5F3FF'
    },
    {
      id: 'accident',
      title: 'Kaza',
      icon: 'car',
      color: '#FF9500',
      bgColor: '#FFF5E5'
    },
    {
      id: 'medical',
      title: 'Tıbbi Acil',
      icon: 'medical',
      color: '#34C759',
      bgColor: '#E8F5E8'
    },
    {
      id: 'other',
      title: 'Diğer',
      icon: 'help-circle',
      color: '#8E8E93',
      bgColor: '#F2F2F7'
    }
  ];
  
  useEffect(() => {
    // Animation
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
    ]).start();
    
    // Request location permission
    requestLocationPermission();
  }, []);
  
  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        setLocationPermission(true);
        getCurrentLocation();
      } else {
        setLocationPermission(false);
        Alert.alert(
          'Konum İzni Gerekli',
          'Acil durum bildiriminizin doğru konumda işlenmesi için konum izni gereklidir.',
          [
            { text: 'İptal', style: 'cancel' },
            { text: 'Ayarlara Git', onPress: () => Location.requestForegroundPermissionsAsync() }
          ]
        );
      }
    } catch (error) {
      console.error('Konum izni hatası:', error);
    }
  };
  
  const getCurrentLocation = async () => {
    try {
      const location = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setLocation(location);
    } catch (error) {
      console.error('Konum alma hatası:', error);
    }
  };
  
  const handleEmergencyTypeSelect = (type) => {
    setSelectedEmergencyType(type);
  };
  
  const handleSubmit = async () => {
    if (!selectedEmergencyType) {
      Alert.alert('Uyarı', 'Lütfen acil durum türünü seçin.');
      return;
    }
    
    if (!description.trim()) {
      Alert.alert('Uyarı', 'Lütfen durum açıklaması girin.');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      Alert.alert(
        'Başarılı',
        'Acil durum bildiriminiz başarıyla gönderildi. Yetkili birimler en kısa sürede size ulaşacaktır.',
        [
          {
            text: 'Tamam',
            onPress: () => navigation.goBack()
          }
        ]
      );
    } catch (error) {
      Alert.alert('Hata', 'Bildirim gönderilirken bir hata oluştu. Lütfen tekrar deneyin.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
      {/* Status Bar */}
      <StatusBar 
        title="Acil Durum Bildir"
        showSearch={false}
        showNotifications={false}
        showBack={true}
        onBackPress={() => navigation.goBack()}
      />
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Emergency Alert */}
        <Animated.View 
          style={[
            styles.alertContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.alertIcon}>
            <Ionicons name="warning" size={32} color="#FF3B30" />
          </View>
          <Text style={styles.alertTitle}>Acil Durum Bildirimi</Text>
          <Text style={styles.alertSubtitle}>
            Bu form sadece gerçek acil durumlar için kullanılmalıdır. 
            Yanlış bildirim suç teşkil eder.
          </Text>
        </Animated.View>
        
        {/* Emergency Type Selection */}
        <Animated.View 
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Acil Durum Türü</Text>
          <View style={styles.emergencyTypesGrid}>
            {emergencyTypes.map((type) => (
              <TouchableOpacity
                key={type.id}
                style={[
                  styles.emergencyTypeCard,
                  {
                    backgroundColor: selectedEmergencyType?.id === type.id ? type.color : type.bgColor,
                    borderColor: selectedEmergencyType?.id === type.id ? type.color : 'transparent'
                  }
                ]}
                onPress={() => handleEmergencyTypeSelect(type)}
              >
                <Ionicons 
                  name={type.icon} 
                  size={24} 
                  color={selectedEmergencyType?.id === type.id ? '#FFFFFF' : type.color} 
                />
                <Text 
                  style={[
                    styles.emergencyTypeText,
                    {
                      color: selectedEmergencyType?.id === type.id ? '#FFFFFF' : type.color
                    }
                  ]}
                >
                  {type.title}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </Animated.View>
        
        {/* Location Info */}
        <Animated.View 
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Konum Bilgisi</Text>
          <View style={[styles.locationCard, { backgroundColor: theme.colors.cardBackground }]}>
            <View style={styles.locationHeader}>
              <Ionicons 
                name={locationPermission ? "location" : "location-outline"} 
                size={20} 
                color={locationPermission ? "#34C759" : "#FF9500"} 
              />
              <Text style={[styles.locationTitle, { color: theme.colors.text }]}>
                {locationPermission ? 'Konum Paylaşıldı' : 'Konum İzni Gerekli'}
              </Text>
            </View>
            {location && (
              <Text style={[styles.locationText, { color: theme.colors.secondaryText }]}>
                Enlem: {location.coords.latitude.toFixed(6)}{"\n"}
                Boylam: {location.coords.longitude.toFixed(6)}
              </Text>
            )}
            {!locationPermission && (
              <TouchableOpacity 
                style={styles.enableLocationButton}
                onPress={requestLocationPermission}
              >
                <Text style={styles.enableLocationText}>Konumu Etkinleştir</Text>
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
        
        {/* Description */}
        <Animated.View 
          style={[
            styles.section,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>Durum Açıklaması</Text>
          <TextInput
            style={[
              styles.descriptionInput,
              {
                backgroundColor: theme.colors.cardBackground,
                color: theme.colors.text,
                borderColor: theme.colors.border
              }
            ]}
            placeholder="Acil durumla ilgili detayları açıklayın..."
            placeholderTextColor={theme.colors.secondaryText}
            multiline
            numberOfLines={4}
            value={description}
            onChangeText={setDescription}
            maxLength={500}
          />
          <Text style={[styles.characterCount, { color: theme.colors.secondaryText }]}>
            {description.length}/500
          </Text>
        </Animated.View>
        
        {/* Submit Button */}
        <Animated.View 
          style={[
            styles.submitContainer,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <TouchableOpacity 
            style={[
              styles.submitButton,
              {
                opacity: isSubmitting ? 0.6 : 1
              }
            ]}
            onPress={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <Text style={styles.submitButtonText}>Gönderiliyor...</Text>
            ) : (
              <>
                <Ionicons name="send" size={20} color="#FFFFFF" />
                <Text style={styles.submitButtonText}>Acil Durum Bildir</Text>
              </>
            )}
          </TouchableOpacity>
        </Animated.View>
        
        <View style={styles.bottomSpacing} />
      </ScrollView>
    </View>
  );
};

export default EmergencyScreen;