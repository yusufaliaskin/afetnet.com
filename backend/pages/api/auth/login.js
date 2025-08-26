import { supabase } from '../../../lib/supabase.js';
import { userSchemas } from '../../../lib/validation/schemas.js';
import { corsMiddleware, errorHandler, requestLogger } from '../../../lib/middleware/auth.js';

/**
 * Kullanıcı giriş endpoint'i
 * POST /api/auth/login
 */
export default async function handler(req, res) {
  // CORS middleware
  corsMiddleware(req, res, () => {});
  
  // Request logging
  await requestLogger(req, res, () => {});

  if (req.method !== 'POST') {
    return res.status(405).json({
      success: false,
      error: 'Method not allowed'
    });
  }

  try {
    // Input validation
    const { error, value } = userSchemas.login.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        details: error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message
        }))
      });
    }

    const { email, password } = value;

    // Supabase Auth ile giriş yap
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.error('Login error:', authError);
      
      // Hata tipine göre uygun mesaj döndür
      let errorMessage = 'Login failed';
      if (authError.message.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password';
      } else if (authError.message.includes('Email not confirmed')) {
        errorMessage = 'Please verify your email address before logging in';
      } else if (authError.message.includes('Too many requests')) {
        errorMessage = 'Too many login attempts. Please try again later';
      }
      
      return res.status(401).json({
        success: false,
        error: errorMessage
      });
    }

    // Kullanıcı profil bilgilerini al
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', authData.user.id)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch user profile'
      });
    }

    // Kullanıcının aktif olup olmadığını kontrol et
    if (!userProfile.is_active) {
      return res.status(403).json({
        success: false,
        error: 'Account is deactivated. Please contact support.'
      });
    }

    // Son giriş zamanını güncelle
    await supabase
      .from('users')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', authData.user.id);

    // Başarılı giriş
    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: authData.user.id,
          email: authData.user.email,
          full_name: userProfile.full_name,
          phone: userProfile.phone,
          avatar_url: userProfile.avatar_url,
          location: userProfile.location,
          notification_preferences: userProfile.notification_preferences,
          is_verified: userProfile.is_verified,
          last_login_at: userProfile.last_login_at,
          created_at: userProfile.created_at
        },
        session: {
          access_token: authData.session.access_token,
          refresh_token: authData.session.refresh_token,
          expires_at: authData.session.expires_at,
          expires_in: authData.session.expires_in
        }
      }
    });

  } catch (error) {
    console.error('Login handler error:', error);
    errorHandler(error, req, res, () => {});
  }
}

// Next.js API route configuration
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '1mb'
    }
  }
};