import { supabase } from '../../../lib/supabase.js';
import { userSchemas } from '../../../lib/validation/schemas.js';
import { corsMiddleware, errorHandler, requestLogger, validateInput } from '../../../lib/middleware/auth.js';
import bcrypt from 'bcryptjs';

/**
 * Kullanıcı kayıt endpoint'i
 * POST /api/auth/register
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
    const { error, value } = userSchemas.register.validate(req.body);
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

    const { email, password, full_name, phone } = value;

    // Email'in zaten kullanılıp kullanılmadığını kontrol et
    const { data: existingUser } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single();

    if (existingUser) {
      return res.status(409).json({
        success: false,
        error: 'Email already registered'
      });
    }

    // Supabase Auth ile kullanıcı oluştur
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name,
          phone
        }
      }
    });

    if (authError) {
      console.error('Supabase auth error:', authError);
      return res.status(400).json({
        success: false,
        error: authError.message
      });
    }

    // Kullanıcı profil bilgilerini users tablosuna ekle
    if (authData.user) {
      const { error: profileError } = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          email,
          full_name,
          phone,
          is_verified: false,
          is_active: true
        });

      if (profileError) {
        console.error('Profile creation error:', profileError);
        // Auth kullanıcısını sil
        await supabase.auth.admin.deleteUser(authData.user.id);
        
        return res.status(500).json({
          success: false,
          error: 'Failed to create user profile'
        });
      }
    }

    // Başarılı kayıt
    res.status(201).json({
      success: true,
      message: 'User registered successfully. Please check your email for verification.',
      data: {
        user: {
          id: authData.user.id,
          email: authData.user.email,
          full_name,
          phone,
          email_confirmed: authData.user.email_confirmed_at ? true : false
        }
      }
    });

  } catch (error) {
    console.error('Registration error:', error);
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