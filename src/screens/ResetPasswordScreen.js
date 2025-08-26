import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';

const ResetPasswordScreen = ({ navigation, route }) => {
  const { email, code } = route.params;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { updatePassword } = useAuth();

  const validatePassword = (password) => {
    if (password.length < 6) {
      return 'Şifre en az 6 karakter olmalıdır.';
    }
    if (!/(?=.*[a-z])/.test(password)) {
      return 'Şifre en az bir küçük harf içermelidir.';
    }
    if (!/(?=.*[A-Z])/.test(password)) {
      return 'Şifre en az bir büyük harf içermelidir.';
    }
    if (!/(?=.*\d)/.test(password)) {
      return 'Şifre en az bir rakam içermelidir.';
    }
    return null;
  };

  const handleUpdatePassword = async () => {
    if (!password.trim()) {
      Alert.alert('Hata', 'Lütfen yeni şifrenizi girin.');
      return;
    }

    if (!confirmPassword.trim()) {
      Alert.alert('Hata', 'Lütfen şifrenizi tekrar girin.');
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      Alert.alert('Hata', passwordError);
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Hata', 'Şifreler eşleşmiyor.');
      return;
    }

    setLoading(true);
    try {
      await updatePassword(email, code, password);
      Alert.alert(
        'Başarılı',
        'Şifreniz başarıyla güncellendi. Yeni şifrenizle giriş yapabilirsiniz.',
        [
          {
            text: 'Tamam',
            onPress: () => navigation.navigate('Login'),
          },
        ]
      );
    } catch (error) {
      Alert.alert('Hata', error.message || 'Şifre güncellenirken bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#333" />
          </TouchableOpacity>
        </View>

        <View style={styles.content}>
          <Text style={styles.title}>Yeni şifre belirleyin</Text>
          <Text style={styles.subtitle}>
            Yeni bir şifre oluşturun. Güvenlik için{' \n'}
            öncekilerden farklı olduğundan emin olun
          </Text>

          <View style={styles.formContainer}>
            <Text style={styles.label}>Şifre</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Yeni şifrenizi girin"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowPassword(!showPassword)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            <Text style={styles.label}>Şifre Tekrarı</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Şifrenizi tekrar girin"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={styles.eyeButton}
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <Ionicons
                  name={showConfirmPassword ? 'eye-off' : 'eye'}
                  size={20}
                  color="#666"
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={[styles.updateButton, loading && styles.disabledButton]}
              onPress={handleUpdatePassword}
              disabled={loading}
            >
              <Text style={styles.updateButtonText}>
                {loading ? 'Güncelleniyor...' : 'Şifreyi Güncelle'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollContainer: {
    flexGrow: 1,
  },
  header: {
    paddingTop: 50,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    marginBottom: 40,
    lineHeight: 22,
  },
  formContainer: {
    flex: 1,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333',
    marginBottom: 8,
  },
  inputContainer: {
    position: 'relative',
    marginBottom: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingRight: 50,
    fontSize: 16,
    backgroundColor: '#F8F9FA',
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 12,
    padding: 4,
  },
  updateButton: {
    backgroundColor: '#FF6B35',
    borderRadius: 8,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  disabledButton: {
    backgroundColor: '#B0B0B0',
  },
  updateButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ResetPasswordScreen;