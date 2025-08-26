import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  Alert,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { auth, validation } from '../lib/supabase';

const { width, height } = Dimensions.get('window');

const RegisterScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    phone: '',
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [fadeAnim] = useState(new Animated.Value(0));
  const [slideAnim] = useState(new Animated.Value(50));
  const insets = useSafeAreaInsets();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleRegister = async () => {
    if (!formData.firstName || !formData.lastName || !formData.phone || !formData.email || !formData.password) {
      Alert.alert('Hata', 'Lütfen tüm alanları doldurunuz.');
      return;
    }
    
    if (!validation.isValidName(formData.firstName)) {
      Alert.alert('Hata', 'Lütfen geçerli bir ad giriniz.');
      return;
    }
    
    if (!validation.isValidName(formData.lastName)) {
      Alert.alert('Hata', 'Lütfen geçerli bir soyad giriniz.');
      return;
    }
    
    if (!validation.isValidPhone(formData.phone)) {
      Alert.alert('Hata', 'Lütfen geçerli bir telefon numarası giriniz. (Örn: 05xxxxxxxxx)');
      return;
    }
    
    if (!validation.isValidEmail(formData.email)) {
      Alert.alert('Hata', 'Lütfen geçerli bir e-posta adresi giriniz.');
      return;
    }
    
    if (!validation.isValidPassword(formData.password)) {
      Alert.alert('Hata', 'Şifre en az 8 karakter olmalıdır.');
      return;
    }
    
    setLoading(true);
    
    try {
      const result = await auth.signUp(formData.email, formData.password, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        phone: formData.phone
      });
      
      if (result.user) {
        Alert.alert(
          'Kayıt Başarılı!', 
          'Hesabınız oluşturuldu. E-posta adresinize gönderilen aktivasyon linkine tıklayarak hesabınızı aktifleştirin. Aktivasyon işlemi tamamlanmadan giriş yapamazsınız.',
          [{
            text: 'Tamam',
            onPress: () => {
              // Kullanıcıyı login sayfasına yönlendir, ana sayfaya değil
              navigation.navigate('Login');
            }
          }]
        );
      }
    } catch (error) {
      console.error('Register error:', error);
      let errorMessage = 'Kayıt sırasında bir hata oluştu.';
      
      if (error.message.includes('already registered') || error.message.includes('User already registered')) {
        errorMessage = 'Bu e-posta adresi zaten kayıtlı.';
      } else if (error.message.includes('Password')) {
        errorMessage = 'Şifre gereksinimlerini karşılamıyor.';
      } else if (error.message.includes('Email')) {
        errorMessage = 'Geçersiz e-posta adresi.';
      } else if (error.message.includes('signup disabled')) {
        errorMessage = 'Kayıt işlemi şu anda devre dışı.';
      }
      
      Alert.alert('Hata', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <KeyboardAvoidingView 
        style={styles.keyboardContainer}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContainer}
          showsVerticalScrollIndicator={false}
        >
          <Animated.View 
            style={[
              styles.contentContainer,
              {
                opacity: fadeAnim,
                transform: [{ translateY: slideAnim }],
              },
            ]}
          >
            {/* Logo */}
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Ionicons name="leaf" size={40} color="#FFFFFF" />
              </View>
            </View>

            {/* Title */}
            <View style={styles.titleContainer}>
              <Text style={styles.title}>Hesap Oluştur</Text>
              <Text style={styles.subtitle}>
                Yeni hesabınızı oluşturun ve başlayın
              </Text>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              {/* Name Fields Row */}
              <View style={styles.nameRow}>
                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>Ad *</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="Adınızı girin"
                      placeholderTextColor="#9E9E9E"
                      value={formData.firstName}
                      onChangeText={(value) => handleInputChange('firstName', value)}
                      autoCapitalize="words"
                      autoCorrect={false}
                    />
                  </View>
                </View>
                
                <View style={[styles.inputContainer, styles.halfWidth]}>
                  <Text style={styles.inputLabel}>Soyad *</Text>
                  <View style={styles.inputWrapper}>
                    <TextInput
                      style={styles.input}
                      placeholder="Soyadınızı girin"
                      placeholderTextColor="#9E9E9E"
                      value={formData.lastName}
                      onChangeText={(value) => handleInputChange('lastName', value)}
                      autoCapitalize="words"
                      autoCorrect={false}
                    />
                  </View>
                </View>
              </View>

              {/* Email Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>E-posta *</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.input}
                    placeholder="ornek@gmail.com"
                    placeholderTextColor="#9E9E9E"
                    value={formData.email}
                    onChangeText={(value) => handleInputChange('email', value)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Phone Number Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Telefon Numarası *</Text>
                <View style={styles.phoneInputContainer}>
                  <View style={styles.countryCodeContainer}>
                    <Text style={styles.countryFlag}>🇹🇷</Text>
                    <Text style={styles.countryCode}>+90</Text>
                  </View>
                  <View style={styles.phoneInputWrapper}>
                    <TextInput
                      style={styles.phoneInput}
                      placeholder="5XX XXX XXXX"
                      placeholderTextColor="#9E9E9E"
                      value={formData.phone}
                      onChangeText={(value) => handleInputChange('phone', value)}
                      keyboardType="phone-pad"
                      maxLength={10}
                    />
                  </View>
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <Text style={styles.inputLabel}>Şifre *</Text>
                <View style={styles.inputWrapper}>
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="En az 8 karakter gerekli"
                    placeholderTextColor="#9E9E9E"
                    value={formData.password}
                    onChangeText={(value) => handleInputChange('password', value)}
                    secureTextEntry={!showPassword}
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                  <TouchableOpacity 
                    style={styles.passwordToggle}
                    onPress={() => setShowPassword(!showPassword)}
                  >
                    <Ionicons 
                      name={showPassword ? "eye-off-outline" : "eye-outline"} 
                      size={20} 
                      color="#FF6B35"
                    />
                  </TouchableOpacity>
                </View>
              </View>

               {/* Terms and Conditions */}
               <View style={styles.termsContainer}>
                 <TouchableOpacity style={styles.checkboxContainer}>
                   <View style={styles.checkbox}>
                     <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                   </View>
                 </TouchableOpacity>
                 <Text style={styles.termsText}>
                   <Text style={styles.termsLink}>Kullanım Şartlarını</Text> kabul ediyorum
                 </Text>
               </View>

               <View style={styles.termsContainer}>
                 <TouchableOpacity style={styles.checkboxContainer}>
                   <View style={styles.checkbox}>
                     <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                   </View>
                 </TouchableOpacity>
                 <Text style={styles.termsText}>
                   <Text style={styles.termsLink}>NSosyal Gizlilik Bildirimi</Text>
                 </Text>
               </View>

              {/* Sign Up Button */}
              <TouchableOpacity
                style={[styles.signUpButton, loading && styles.signUpButtonDisabled]}
                onPress={handleRegister}
                disabled={loading}
              >
                <LinearGradient
                  colors={loading ? ['#CCCCCC', '#CCCCCC'] : ['#FF6B35', '#FF8A50']}
                  style={styles.signUpButtonGradient}
                >
                  <Text style={styles.signUpButtonText}>
                    {loading ? 'Hesap oluşturuluyor...' : 'Kayıt Ol'}
                  </Text>
                </LinearGradient>
              </TouchableOpacity>

              {/* Divider */}
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>Veya</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social Login Buttons */}
              <View style={styles.socialContainer}>
                <TouchableOpacity style={styles.socialButton}>
                  <Ionicons name="logo-google" size={20} color="#4285F4" />
                </TouchableOpacity>
                
                <TouchableOpacity style={styles.socialButton}>
                  <Ionicons name="logo-apple" size={20} color="#000000" />
                </TouchableOpacity>
              </View>

              {/* Login Link */}
              <View style={styles.loginContainer}>
                <Text style={styles.loginText}>
                  Zaten hesabın var mı? <Text style={styles.loginLink} onPress={() => navigation.navigate('Login')}>Giriş Yap</Text>
                </Text>
              </View>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  keyboardContainer: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  contentContainer: {
    flex: 1,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF6B35',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8,
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1A1A1A',
    marginBottom: 8,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 16,
    color: '#666666',
    textAlign: 'center',
    lineHeight: 24,
  },
  formContainer: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    color: '#1A1A1A',
    marginBottom: 8,
    fontWeight: '500',
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    height: 56,
    borderWidth: 1,
    borderColor: '#E9ECEF',
  },
  nameRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  phoneInputContainer: {
    flexDirection: 'row',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    overflow: 'hidden',
  },
  countryCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    backgroundColor: '#E9ECEF',
    borderRightWidth: 1,
    borderRightColor: '#DEE2E6',
  },
  countryFlag: {
    fontSize: 16,
    marginRight: 4,
  },
  countryCode: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  phoneInputWrapper: {
    flex: 1,
    paddingHorizontal: 16,
    justifyContent: 'center',
  },
  phoneInput: {
    fontSize: 16,
    color: '#1A1A1A',
    height: 56,
  },
  smsButton: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderWidth: 1,
    borderColor: '#E9ECEF',
    alignItems: 'center',
  },
  smsButtonText: {
    fontSize: 16,
    color: '#1A1A1A',
    fontWeight: '500',
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  checkboxContainer: {
    marginRight: 12,
    marginTop: 2,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderRadius: 3,
    backgroundColor: '#FF6B35',
    justifyContent: 'center',
    alignItems: 'center',
  },
  termsText: {
    flex: 1,
    fontSize: 14,
    color: '#666666',
    lineHeight: 20,
  },
  termsLink: {
    color: '#FF6B35',
    textDecorationLine: 'underline',
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: '#1A1A1A',
  },
  passwordToggle: {
    paddingHorizontal: 16,
  },
  signUpButton: {
    borderRadius: 12,
    height: 56,
    marginBottom: 32,
    shadowColor: '#4CAF50',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  signUpButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  signUpButtonDisabled: {
    shadowOpacity: 0,
    elevation: 0,
  },
  signUpButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E9ECEF',
  },
  dividerText: {
    fontSize: 14,
    color: '#666666',
    marginHorizontal: 16,
    fontWeight: '500',
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 32,
  },
  socialButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginContainer: {
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#666666',
  },
  loginLink: {
    color: '#FF6B35',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
});

export default RegisterScreen;