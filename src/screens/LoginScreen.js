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
import { auth, validation, supabase } from '../lib/supabase';

const { width, height } = Dimensions.get('window');

const LoginScreen = ({ navigation }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
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

  const handleLogin = async () => {
    if (!formData.email || !formData.password) {
      Alert.alert('Hata', 'Lütfen e-posta/telefon ve şifre alanlarını doldurunuz.');
      return;
    }
    
    // E-posta veya telefon numarası kontrolü
    const isEmail = validation.isValidEmail(formData.email);
    const isPhone = validation.isValidPhone(formData.email);
    
    if (!isEmail && !isPhone) {
      Alert.alert('Hata', 'Lütfen geçerli bir e-posta adresi veya telefon numarası giriniz.');
      return;
    }
    
    setLoading(true);
    
    try {
      let result;
      
      if (isEmail) {
        // E-posta ile giriş
        result = await auth.signIn(formData.email, formData.password);
      } else if (isPhone) {
        // Telefon numarası ile giriş - önce telefon numarasından e-posta adresini bul
        try {
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('email')
            .eq('phone', formData.email)
            .single();
          
          if (userProfile && userProfile.email) {
            result = await auth.signIn(userProfile.email, formData.password);
          } else {
            throw new Error('Bu telefon numarası ile kayıtlı kullanıcı bulunamadı.');
          }
        } catch (phoneError) {
          throw new Error('Bu telefon numarası ile kayıtlı kullanıcı bulunamadı.');
        }
      }
      
      if (result && result.user) {
        navigation.navigate('Main');
      }
    } catch (error) {
      console.error('Login error:', error);
      let errorMessage = 'Giriş sırasında bir hata oluştu.';
      
      if (error.message.includes('Invalid login credentials')) {
        errorMessage = 'E-posta/telefon veya şifre hatalı.';
      } else if (error.message.includes('Email not confirmed')) {
        errorMessage = 'E-posta adresinizi doğrulamanız gerekiyor. Lütfen gelen kutunuzu kontrol edin.';
      } else if (error.message.includes('Too many requests')) {
        errorMessage = 'Çok fazla deneme yapıldı. Lütfen daha sonra tekrar deneyin.';
      } else if (error.message.includes('telefon numarası ile kayıtlı kullanıcı bulunamadı')) {
        errorMessage = error.message;
      }
      
      Alert.alert('Giriş Hatası', errorMessage);
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
              <Text style={styles.title}>Hoş Geldiniz</Text>
              <Text style={styles.subtitle}>
                Hesabınıza giriş yapın
              </Text>
            </View>

            {/* Form */}
            <View style={styles.formContainer}>
              {/* Email Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Ionicons name="mail-outline" size={20} color="#FF6B35" style={styles.inputIcon} />
                  <TextInput
                    style={styles.input}
                    placeholder="E-posta veya Telefon"
                    placeholderTextColor="#9E9E9E"
                    value={formData.email}
                    onChangeText={(value) => handleInputChange('email', value)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>

              {/* Password Input */}
              <View style={styles.inputContainer}>
                <View style={styles.inputWrapper}>
                  <Ionicons name="lock-closed-outline" size={20} color="#FF6B35" style={styles.inputIcon} />
                  <TextInput
                    style={styles.passwordInput}
                    placeholder="Şifrenizi girin"
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

              {/* Remember Me & Forgot Password */}
              <View style={styles.optionsContainer}>
                <TouchableOpacity 
                  style={styles.rememberContainer}
                  onPress={() => setRememberMe(!rememberMe)}
                >
                  <View style={[styles.checkbox, rememberMe && styles.checkboxChecked]}>
                    {rememberMe && (
                      <Ionicons name="checkmark" size={12} color="#FFFFFF" />
                    )}
                  </View>
                  <Text style={styles.rememberText}>Beni Hatırla</Text>
                </TouchableOpacity>
                
                <TouchableOpacity onPress={() => navigation.navigate('ForgotPassword')}>
                  <Text style={styles.forgotText}>Şifremi Unuttum</Text>
                </TouchableOpacity>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                style={[styles.loginButton, loading && styles.loginButtonDisabled]}
                onPress={handleLogin}
                disabled={loading}
              >
                <LinearGradient
                  colors={loading ? ['#CCCCCC', '#CCCCCC'] : ['#FF6B35', '#FF8A50']}
                  style={styles.loginButtonGradient}
                >
                  <Text style={styles.loginButtonText}>
                    {loading ? 'Giriş yapılıyor...' : 'Giriş Yap'}
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

               {/* Sign Up Link */}
               <View style={styles.signUpContainer}>
                 <Text style={styles.signUpText}>
                   Hesabın Yok mu? <Text style={styles.signUpLink} onPress={() => navigation.navigate('Register')}>Kayıt Ol</Text>
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
  signUpLink: {
    color: '#FF6B35',
    fontWeight: '600',
    textDecorationLine: 'underline',
  },
  formContainer: {
    flex: 1,
  },
  inputContainer: {
    marginBottom: 20,
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
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
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
    paddingLeft: 12,
  },
  optionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 32,
  },
  rememberContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: '#FF6B35',
    backgroundColor: 'transparent',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  checkboxChecked: {
    backgroundColor: '#FF6B35',
  },
  rememberText: {
    fontSize: 14,
    color: '#666666',
  },
  forgotText: {
    fontSize: 14,
    color: '#FF6B35',
    fontWeight: '500',
    textDecorationLine: 'underline',
  },
  loginButton: {
    height: 56,
    borderRadius: 12,
    marginBottom: 32,
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 8,
  },
  loginButtonGradient: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 12,
  },
  loginButtonText: {
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
  },
  socialContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    marginBottom: 32,
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    shadowColor: '#000000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  signUpContainer: {
    alignItems: 'center',
  },
  signUpText: {
    fontSize: 14,
    color: '#666666',
  },
});

export default LoginScreen;