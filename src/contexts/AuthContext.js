import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // API base URL
  const API_BASE_URL = 'http://localhost:3001/api';

  // Axios instance
  const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
      'Content-Type': 'application/json',
    },
  });

  // Token'ı localStorage'dan al
  const getStoredToken = () => {
    try {
      return localStorage.getItem('authToken');
    } catch (error) {
      return null;
    }
  };

  // Token'ı localStorage'a kaydet
  const setStoredToken = (token) => {
    try {
      if (token) {
        localStorage.setItem('authToken', token);
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      } else {
        localStorage.removeItem('authToken');
        delete apiClient.defaults.headers.common['Authorization'];
      }
    } catch (error) {
      console.error('Token storage error:', error);
    }
  };

  // Kullanıcı kaydı
  const register = async (userData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post('/auth/register', userData);
      
      if (response.data.success) {
        const { user, token } = response.data.data;
        setUser(user);
        setStoredToken(token);
        return { success: true, user };
      } else {
        throw new Error(response.data.error || 'Kayıt işlemi başarısız');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Kayıt işlemi başarısız';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Kullanıcı girişi
  const login = async (email, password) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post('/auth/login', {
        email,
        password,
      });
      
      if (response.data.success) {
        const { user, token } = response.data.data;
        setUser(user);
        setStoredToken(token);
        return { success: true, user };
      } else {
        throw new Error(response.data.error || 'Giriş işlemi başarısız');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Giriş işlemi başarısız';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Kullanıcı çıkışı
  const logout = async () => {
    try {
      setLoading(true);
      
      // Backend'e logout isteği gönder
      await apiClient.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      // Her durumda local state'i temizle
      setUser(null);
      setStoredToken(null);
      setError(null);
      setLoading(false);
    }
  };

  // Kullanıcı profilini getir
  const getUserProfile = async () => {
    try {
      const response = await apiClient.get('/users/profile');
      
      if (response.data.success) {
        setUser(response.data.data.user);
        return response.data.data;
      }
    } catch (error) {
      console.error('Get profile error:', error);
      // Token geçersizse logout yap
      if (error.response?.status === 401) {
        logout();
      }
    }
  };

  // Kullanıcı profilini güncelle
  const updateUserProfile = async (profileData) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.put('/users/profile', profileData);
      
      if (response.data.success) {
        const updatedUser = response.data.data.user;
        setUser(updatedUser);
        return { success: true, user: updatedUser };
      } else {
        throw new Error(response.data.error || 'Profil güncelleme başarısız');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Profil güncelleme başarısız';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  // Şifre sıfırlama isteği gönder
  const resetPassword = async (email) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post('/auth/reset-password', { email });
      
      if (response.data.success) {
        return { success: true, message: 'Doğrulama kodu e-posta adresinize gönderildi.' };
      } else {
        throw new Error(response.data.error || 'Şifre sıfırlama isteği başarısız');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Şifre sıfırlama isteği başarısız';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Doğrulama kodunu kontrol et
  const verifyResetCode = async (email, code) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post('/auth/verify-reset-code', { email, code });
      
      if (response.data.success) {
        return { success: true, message: 'Doğrulama kodu geçerli.' };
      } else {
        throw new Error(response.data.error || 'Doğrulama kodu geçersiz');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Doğrulama kodu geçersiz';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Yeni şifre belirle
  const updatePassword = async (email, code, newPassword) => {
    try {
      setLoading(true);
      setError(null);

      const response = await apiClient.post('/auth/update-password', {
        email,
        code,
        newPassword,
      });
      
      if (response.data.success) {
        return { success: true, message: 'Şifre başarıyla güncellendi.' };
      } else {
        throw new Error(response.data.error || 'Şifre güncelleme başarısız');
      }
    } catch (error) {
      const errorMessage = error.response?.data?.error || error.message || 'Şifre güncelleme başarısız';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Uygulama başlatıldığında token kontrolü
  useEffect(() => {
    const initAuth = async () => {
      const token = getStoredToken();
      
      if (token) {
        apiClient.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        await getUserProfile();
      }
      
      setLoading(false);
    };

    initAuth();
  }, []);

  // Error'ı temizle
  const clearError = () => {
    setError(null);
  };

  const value = {
    user,
    loading,
    error,
    register,
    login,
    logout,
    getUserProfile,
    updateUserProfile,
    resetPassword,
    verifyResetCode,
    updatePassword,
    clearError,
    isAuthenticated: !!user,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;