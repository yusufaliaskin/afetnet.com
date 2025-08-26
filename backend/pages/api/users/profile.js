import { supabase } from '../../../lib/supabase.js';
import { userSchemas } from '../../../lib/validation/schemas.js';
import { corsMiddleware, errorHandler, requestLogger, authenticateToken, rateLimit } from '../../../lib/middleware/auth.js';

/**
 * Kullanıcı profil yönetimi endpoint'i
 * GET /api/users/profile - Profil bilgilerini getir
 * PUT /api/users/profile - Profil bilgilerini güncelle
 */
export default async function handler(req, res) {
  // CORS middleware
  corsMiddleware(req, res, () => {});
  
  // Request logging
  await requestLogger(req, res, () => {});

  // Rate limiting
  const rateLimitMiddleware = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: req.method === 'GET' ? 100 : 30, // GET için 100, PUT için 30
    message: 'Too many requests, please try again later'
  });
  
  await new Promise((resolve) => {
    rateLimitMiddleware(req, res, resolve);
  });

  // Authentication required
  await new Promise((resolve, reject) => {
    authenticateToken(req, res, (error) => {
      if (error) reject(error);
      else resolve();
    });
  });

  try {
    if (req.method === 'GET') {
      return await handleGetProfile(req, res);
    } else if (req.method === 'PUT') {
      return await handleUpdateProfile(req, res);
    } else {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
    }
  } catch (error) {
    console.error('Profile API error:', error);
    errorHandler(error, req, res, () => {});
  }
}

/**
 * Kullanıcı profil bilgilerini getir
 */
async function handleGetProfile(req, res) {
  try {
    // Kullanıcı profil bilgilerini getir
    const { data: userProfile, error: profileError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        full_name,
        phone,
        avatar_url,
        location,
        notification_preferences,
        is_verified,
        is_active,
        last_login_at,
        created_at,
        updated_at
      `)
      .eq('id', req.userId)
      .single();

    if (profileError) {
      console.error('Profile fetch error:', profileError);
      return res.status(500).json({
        success: false,
        error: 'Failed to fetch user profile'
      });
    }

    if (!userProfile) {
      return res.status(404).json({
        success: false,
        error: 'User profile not found'
      });
    }

    // Kullanıcının kayıtlı konumlarını getir
    const { data: userLocations, error: locationsError } = await supabase
      .from('user_locations')
      .select('*')
      .eq('user_id', req.userId)
      .order('is_primary', { ascending: false })
      .order('created_at', { ascending: false });

    if (locationsError) {
      console.error('User locations fetch error:', locationsError);
    }

    // Kullanıcının acil durum kişilerini getir
    const { data: emergencyContacts, error: contactsError } = await supabase
      .from('emergency_contacts')
      .select('*')
      .eq('user_id', req.userId)
      .eq('is_active', true)
      .order('priority', { ascending: true });

    if (contactsError) {
      console.error('Emergency contacts fetch error:', contactsError);
    }

    // Kullanıcının bildirim istatistiklerini getir
    const { count: totalNotifications } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.userId);

    const { count: unreadNotifications } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.userId)
      .eq('read', false);

    res.status(200).json({
      success: true,
      data: {
        profile: userProfile,
        locations: userLocations || [],
        emergency_contacts: emergencyContacts || [],
        statistics: {
          total_notifications: totalNotifications || 0,
          unread_notifications: unreadNotifications || 0,
          member_since: userProfile.created_at,
          last_login: userProfile.last_login_at
        }
      }
    });

  } catch (error) {
    console.error('Get profile error:', error);
    throw error;
  }
}

/**
 * Kullanıcı profil bilgilerini güncelle
 */
async function handleUpdateProfile(req, res) {
  // Input validation
  const { error, value } = userSchemas.updateProfile.validate(req.body);
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

  const updateData = { ...value };

  // Konum verisi varsa PostGIS formatına çevir
  if (updateData.location) {
    updateData.location = `POINT(${updateData.location.longitude} ${updateData.location.latitude})`;
  }

  try {
    // Profil bilgilerini güncelle
    const { data: updatedProfile, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', req.userId)
      .select(`
        id,
        email,
        full_name,
        phone,
        avatar_url,
        location,
        notification_preferences,
        is_verified,
        is_active,
        last_login_at,
        created_at,
        updated_at
      `)
      .single();

    if (updateError) {
      console.error('Profile update error:', updateError);
      return res.status(500).json({
        success: false,
        error: 'Failed to update user profile'
      });
    }

    // Supabase Auth kullanıcı metadata'sını da güncelle
    if (updateData.full_name || updateData.phone) {
      const { error: authUpdateError } = await supabase.auth.updateUser({
        data: {
          full_name: updateData.full_name,
          phone: updateData.phone
        }
      });

      if (authUpdateError) {
        console.error('Auth metadata update error:', authUpdateError);
        // Bu hata kritik değil, devam et
      }
    }

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      data: {
        profile: updatedProfile
      }
    });

  } catch (error) {
    console.error('Update profile error:', error);
    throw error;
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