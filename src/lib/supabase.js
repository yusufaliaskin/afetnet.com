import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rjzvcanjkdwukasjaeib.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJqenZjYW5qa2R3dWthc2phZWliIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTU2ODU1NDQsImV4cCI6MjA3MTI2MTU0NH0.xSQyVF6axjElOB2Ti6zcP5fO_Zxnbdl58wi7eR93Oy0';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

// Auth helper functions
export const auth = {
  // Kullanıcı kayıt işlemi
  async signUp(email, password, userData) {
    try {
      // Supabase auth ile kullanıcı oluştur
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName,
            phone: userData.phone
          }
        }
      });

      if (authError) throw authError;

      // Kullanıcı profil bilgilerini profiles tablosuna kaydet
      if (authData.user) {
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: authData.user.id,
            first_name: userData.firstName,
            last_name: userData.lastName,
            phone: userData.phone,
            email: email,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (profileError) {
          console.error('Profile creation error:', profileError);
          // Auth kullanıcısı oluşturuldu ama profil oluşturulamadı
          // Bu durumda kullanıcıyı bilgilendir ama işlemi başarılı say
        }
      }

      return { user: authData.user, session: authData.session };
    } catch (error) {
      console.error('SignUp error:', error);
      throw error;
    }
  },

  // Kullanıcı giriş işlemi
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      return { user: data.user, session: data.session };
    } catch (error) {
      console.error('SignIn error:', error);
      throw error;
    }
  },

  // Kullanıcı çıkış işlemi
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
    } catch (error) {
      console.error('SignOut error:', error);
      throw error;
    }
  },

  // Mevcut kullanıcı oturumunu al
  async getSession() {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) throw error;
      return session;
    } catch (error) {
      console.error('Get session error:', error);
      throw error;
    }
  },

  // Kullanıcı profil bilgilerini al
  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Get user profile error:', error);
      throw error;
    }
  }
};

// Validation helper functions
export const validation = {
  // E-posta format kontrolü
  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  },

  // Şifre güvenlik kontrolü
  isValidPassword(password) {
    // Sadece en az 8 karakter kontrolü
    return password && password.length >= 8;
  },

  // Telefon numarası format kontrolü
  isValidPhone(phone) {
    // Türkiye telefon numarası formatı
    const phoneRegex = /^(\+90|0)?[5][0-9]{9}$/;
    return phoneRegex.test(phone.replace(/\s/g, ''));
  },

  // Ad/soyad kontrolü
  isValidName(name) {
    return name && name.trim().length >= 2;
  }
};