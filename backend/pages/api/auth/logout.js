import { supabase } from '../../../lib/supabase.js';
import { corsMiddleware, errorHandler, requestLogger, authenticateToken } from '../../../lib/middleware/auth.js';

/**
 * Kullanıcı çıkış endpoint'i
 * POST /api/auth/logout
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
    // Token doğrulama
    await new Promise((resolve, reject) => {
      authenticateToken(req, res, (error) => {
        if (error) reject(error);
        else resolve();
      });
    });

    // Supabase'den çıkış yap
    const { error: signOutError } = await supabase.auth.signOut();

    if (signOutError) {
      console.error('Sign out error:', signOutError);
      return res.status(500).json({
        success: false,
        error: 'Failed to sign out'
      });
    }

    // Başarılı çıkış
    res.status(200).json({
      success: true,
      message: 'Logged out successfully'
    });

  } catch (error) {
    console.error('Logout handler error:', error);
    
    // Token geçersiz olsa bile çıkış işlemini başarılı say
    if (error.message && error.message.includes('token')) {
      return res.status(200).json({
        success: true,
        message: 'Logged out successfully'
      });
    }
    
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