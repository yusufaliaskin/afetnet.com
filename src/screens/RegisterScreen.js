import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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
  const insets = useSafeAreaInsets();

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
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoCircle}>
            <Ionicons name="refresh" size={32} color="#FFA500" />
          </View>
        </View>

        {/* Title */}
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Sign up</Text>
          <Text style={styles.subtitle}>
            Create your account to access{"\n"}practice tests
          </Text>
        </View>

        {/* Form */}
        <View style={styles.formContainer}>
          {/* Name Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Your Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Your Name"
              placeholderTextColor="#666666"
              value={formData.firstName}
              onChangeText={(value) => handleInputChange('firstName', value)}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          {/* Last Name Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Your Last Name</Text>
            <TextInput
              style={styles.input}
              placeholder="Your Last Name"
              placeholderTextColor="#666666"
              value={formData.lastName}
              onChangeText={(value) => handleInputChange('lastName', value)}
              autoCapitalize="words"
              autoCorrect={false}
            />
          </View>

          {/* Phone Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Phone Number</Text>
            <TextInput
              style={styles.input}
              placeholder="Phone Number"
              placeholderTextColor="#666666"
              value={formData.phone}
              onChangeText={(value) => handleInputChange('phone', value)}
              keyboardType="phone-pad"
              autoCapitalize="none"
              autoCorrect={false}
              maxLength={11}
            />
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Email or Phone</Text>
            <TextInput
              style={styles.input}
              placeholder="Email or Phone"
              placeholderTextColor="#666666"
              value={formData.email}
              onChangeText={(value) => handleInputChange('email', value)}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <Text style={styles.inputLabel}>Password</Text>
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder="Enter password here"
                placeholderTextColor="#666666"
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
                  color="#FFA500"
                />
              </TouchableOpacity>
            </View>
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            style={[styles.signUpButton, loading && styles.signUpButtonDisabled]}
            onPress={handleRegister}
            disabled={loading}
          >
            <Text style={styles.signUpButtonText}>
              {loading ? 'Creating account...' : 'Sign up'}
            </Text>
          </TouchableOpacity>

          {/* Divider */}
          <View style={styles.divider}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>Or</Text>
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
              Already have an Account? <Text style={styles.loginLink} onPress={() => navigation.navigate('Login')}>Login</Text>
            </Text>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: 24,
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#FFF5E6',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#FFA500',
  },
  titleContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 8,
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
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    fontSize: 16,
    backgroundColor: '#FFFFFF',
    color: '#333333',
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    height: 50,
  },
  passwordInput: {
    flex: 1,
    paddingHorizontal: 16,
    fontSize: 16,
    color: '#333333',
  },
  passwordToggle: {
    paddingHorizontal: 16,
  },
  signUpButton: {
    height: 50,
    backgroundColor: '#FFA500',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 32,
    shadowColor: '#FFA500',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  signUpButtonDisabled: {
    backgroundColor: '#CCCCCC',
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
    backgroundColor: '#E0E0E0',
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
  loginContainer: {
    alignItems: 'center',
  },
  loginText: {
    fontSize: 14,
    color: '#666666',
  },
  loginLink: {
    color: '#FFA500',
    fontWeight: '600',
  },
});

export default RegisterScreen;