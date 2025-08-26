import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  SafeAreaView,
  Animated,
  Easing,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width, height } = Dimensions.get('window');

const onboardingData = [
  {
    id: 1,
    title: 'Hoş Geldiniz',
    subtitle: "Afet durumlarında\nyanınızdayız",
    buttonText: 'Başlayalım',
    backgroundColor: '#FFFFFF',
    textColor: '#FF6B35',
    placeholderText: '[Afet Yardım Ekibi Fotoğrafı]'
  },
  {
    id: 2,
    title: 'Afet Durumlarında\nHazırlıklı Olun',
    subtitle: 'Acil durum planları ve\ngüvenlik ipuçları',
    buttonText: 'Devam Et',
    backgroundColor: '#FFFFFF',
    textColor: '#FF6B35',
    placeholderText: '[Afet Hazırlık Malzemeleri Fotoğrafı]'
  },
  {
    id: 3,
    title: 'Toplumla Birlikte\nDayanışma',
    subtitle: 'Afet Yardım Topluluğuna Katılın',
    buttonText: 'Hesap Oluştur',
    backgroundColor: '#FFFFFF',
    textColor: '#FF6B35',
    icon: 'shield-checkmark'
  }
];

export default function WelcomeScreen({ navigation }) {
  const [showSplash, setShowSplash] = useState(true);
  const [currentStep, setCurrentStep] = useState(0);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;
  const buttonScale = useRef(new Animated.Value(1)).current;
  const splashFade = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (showSplash) {
      // Splash screen animasyonu
      Animated.sequence([
        Animated.delay(2000), // 2 saniye bekle
        Animated.timing(splashFade, {
          toValue: 0,
          duration: 800,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        })
      ]).start(() => {
        setShowSplash(false);
      });
    } else {
      startAnimation();
    }
  }, [showSplash, currentStep]);

  const startAnimation = () => {
    fadeAnim.setValue(0);
    scaleAnim.setValue(0.8);
    slideAnim.setValue(30);

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.back(1.2)),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start();
  };

  const handleNext = () => {
    if (currentStep < onboardingData.length - 1) {
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(slideAnim, {
          toValue: -20,
          duration: 300,
          easing: Easing.in(Easing.quad),
          useNativeDriver: true,
        }),
      ]).start(() => {
        setCurrentStep(currentStep + 1);
      });
    } else {
      handleGetStarted();
    }
  };

  const handleGetStarted = () => {
    Animated.sequence([
      Animated.timing(buttonScale, {
        toValue: 0.95,
        duration: 100,
        useNativeDriver: true,
      }),
      Animated.timing(buttonScale, {
        toValue: 1,
        duration: 100,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: -50,
        duration: 400,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => {
      navigation.navigate('Login');
    });
  };

  // Splash Screen
  if (showSplash) {
    return (
      <SafeAreaView style={styles.splashContainer}>
        <Animated.View style={[styles.splashContent, { opacity: splashFade }]}>
          <Text style={styles.splashText}>AFETNET</Text>
        </Animated.View>
      </SafeAreaView>
    );
  }

  const currentData = onboardingData[currentStep];

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: currentData.backgroundColor }]}>
      <View style={styles.content}>
        {/* Ana İçerik */}
        <Animated.View style={[styles.contentContainer, {
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }, { translateY: slideAnim }]
        }]}>
          {/* Görsel Placeholder veya İkon */}
          <View style={styles.imageContainer}>
            {currentData.icon ? (
              <View style={styles.iconWrapper}>
                <View style={styles.disasterIconContainer}>
                  <Ionicons name="shield-checkmark" size={60} color="#FF6B35" />
                  <View style={styles.protectionRing} />
                  <View style={styles.safetyIndicators}>
                    <View style={styles.safetyDot} />
                    <View style={[styles.safetyDot, styles.safetyDot2]} />
                    <View style={[styles.safetyDot, styles.safetyDot3]} />
                  </View>
                </View>
              </View>
            ) : (
              <View style={styles.placeholderContainer}>
                <Text style={styles.placeholderText}>{currentData.placeholderText}</Text>
              </View>
            )}
          </View>

          {/* Başlık */}
          <Text style={[styles.title, { color: currentData.textColor }]}>
            {currentData.title}
          </Text>

          {/* Alt Başlık */}
          <Text style={[styles.subtitle, { color: currentData.textColor }]}>
            {currentData.subtitle}
          </Text>
        </Animated.View>

        {/* Alt Kısım */}
        <View style={styles.bottomSection}>
          {/* Sayfa Göstergeleri */}
          <View style={styles.pagination}>
            {onboardingData.map((_, index) => (
              <View
                key={index}
                style={[
                  styles.dot,
                  {
                    backgroundColor: index === currentStep ? '#FF6B35' : '#E0E0E0',
                    width: index === currentStep ? 24 : 8,
                  }
                ]}
              />
            ))}
          </View>

          {/* Buton */}
          <Animated.View style={[styles.buttonContainer, {
            transform: [{ scale: buttonScale }]
          }]}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleNext}
              activeOpacity={0.8}
            >
              <Text style={styles.actionButtonText}>
                {currentData.buttonText}
              </Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  // Splash Screen Styles
  splashContainer: {
    flex: 1,
    backgroundColor: '#FF6B35',
  },
  splashContent: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  splashText: {
    fontSize: 48,
    fontWeight: '300',
    color: '#FFFFFF',
    letterSpacing: 8,
  },

  // Main Screen Styles
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    paddingHorizontal: 30,
    paddingVertical: 40,
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imageContainer: {
    height: height * 0.4,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  placeholderContainer: {
    width: '80%',
    height: '70%',
    backgroundColor: '#F5F5F5',
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#E0E0E0',
    borderStyle: 'dashed',
  },
  placeholderText: {
    fontSize: 16,
    color: '#999999',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  iconWrapper: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  disasterIconContainer: {
    alignItems: 'center',
    position: 'relative',
  },
  protectionRing: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    borderColor: '#FF6B35',
    position: 'absolute',
    top: -10,
    opacity: 0.3,
  },
  safetyIndicators: {
    position: 'relative',
    alignItems: 'center',
    marginTop: 20,
  },
  safetyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B35',
    position: 'absolute',
  },
  safetyDot2: {
    left: 15,
    top: 10,
  },
  safetyDot3: {
    right: 15,
    top: 10,
  },
  title: {
    fontSize: 28,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    opacity: 0.7,
  },
  bottomSection: {
    alignItems: 'center',
    paddingBottom: 20,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 40,
  },
  dot: {
    height: 8,
    borderRadius: 4,
    marginHorizontal: 4,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 25,
    paddingHorizontal: 50,
    paddingVertical: 16,
    minWidth: 200,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
});