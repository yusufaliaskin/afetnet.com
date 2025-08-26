import { supabase, supabaseAdmin } from '../../../lib/supabase.js';
import { notificationSchemas } from '../../../lib/validation/schemas.js';
import { corsMiddleware, errorHandler, requestLogger, authenticateToken, requireAdmin, rateLimit } from '../../../lib/middleware/auth.js';

/**
 * Bildirimler endpoint'i
 * GET /api/notifications - Kullanıcının bildirimlerini getir
 * POST /api/notifications - Yeni bildirim oluştur (admin)
 */
export default async function handler(req, res) {
  // CORS middleware
  corsMiddleware(req, res, () => {});
  
  // Request logging
  await requestLogger(req, res, () => {});

  // Rate limiting
  const rateLimitMiddleware = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: req.method === 'GET' ? 100 : 20, // GET için 100, POST için 20
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
      return await handleGetNotifications(req, res);
    } else if (req.method === 'POST') {
      return await handleCreateNotification(req, res);
    } else {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
    }
  } catch (error) {
    console.error('Notifications API error:', error);
    errorHandler(error, req, res, () => {});
  }
}

/**
 * Kullanıcının bildirimlerini getir
 */
async function handleGetNotifications(req, res) {
  // Query parametrelerini validate et
  const { error, value } = notificationSchemas.search.validate(req.query);
  if (error) {
    return res.status(400).json({
      success: false,
      error: 'Invalid query parameters',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message
      }))
    });
  }

  const {
    type,
    read,
    priority,
    date_from,
    date_to,
    limit,
    offset
  } = value;

  // Kullanıcının bildirimlerini getir
  let query = supabase
    .from('notifications')
    .select(`
      id,
      earthquake_id,
      type,
      title,
      message,
      priority,
      read,
      read_at,
      metadata,
      created_at,
      earthquakes (
        id,
        magnitude,
        location,
        latitude,
        longitude,
        date
      )
    `)
    .eq('user_id', req.userId);

  // Filtreleri uygula
  if (type) {
    query = query.eq('type', type);
  }
  if (read !== undefined) {
    query = query.eq('read', read);
  }
  if (priority) {
    query = query.eq('priority', priority);
  }
  if (date_from) {
    query = query.gte('created_at', date_from);
  }
  if (date_to) {
    query = query.lte('created_at', date_to);
  }

  // Sıralama (en yeni önce)
  query = query.order('created_at', { ascending: false });

  // Sayfalama
  query = query.range(offset, offset + limit - 1);

  const { data: notifications, error: fetchError } = await query;

  if (fetchError) {
    console.error('Notifications fetch error:', fetchError);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch notifications'
    });
  }

  // Okunmamış bildirim sayısını al
  const { count: unreadCount } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', req.userId)
    .eq('read', false);

  // Toplam bildirim sayısını al
  const { count: totalCount } = await supabase
    .from('notifications')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', req.userId);

  res.status(200).json({
    success: true,
    data: {
      notifications,
      pagination: {
        total: totalCount || 0,
        limit,
        offset,
        has_more: (offset + limit) < (totalCount || 0)
      },
      summary: {
        total: totalCount || 0,
        unread: unreadCount || 0,
        read: (totalCount || 0) - (unreadCount || 0)
      },
      filters: {
        type,
        read,
        priority,
        date_from,
        date_to
      }
    }
  });
}

/**
 * Yeni bildirim oluştur (admin only)
 */
async function handleCreateNotification(req, res) {
  // Admin kontrolü
  await new Promise((resolve, reject) => {
    requireAdmin(req, res, (error) => {
      if (error) reject(error);
      else resolve();
    });
  });

  // Input validation
  const { error, value } = notificationSchemas.create.validate(req.body);
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

  const {
    user_id,
    earthquake_id,
    type,
    title,
    message,
    priority,
    metadata
  } = value;

  try {
    let notifications = [];

    if (user_id) {
      // Belirli bir kullanıcıya bildirim gönder
      const notificationData = {
        user_id,
        earthquake_id,
        type,
        title,
        message,
        priority,
        metadata
      };

      const { data: newNotification, error: insertError } = await supabaseAdmin
        .from('notifications')
        .insert(notificationData)
        .select()
        .single();

      if (insertError) {
        throw insertError;
      }

      notifications.push(newNotification);
    } else {
      // Tüm aktif kullanıcılara bildirim gönder
      const { data: users, error: usersError } = await supabaseAdmin
        .from('users')
        .select('id')
        .eq('is_active', true);

      if (usersError) {
        throw usersError;
      }

      // Batch insert için bildirim verilerini hazırla
      const notificationData = users.map(user => ({
        user_id: user.id,
        earthquake_id,
        type,
        title,
        message,
        priority,
        metadata
      }));

      // Batch insert (maksimum 1000 kayıt)
      const batchSize = 1000;
      for (let i = 0; i < notificationData.length; i += batchSize) {
        const batch = notificationData.slice(i, i + batchSize);
        
        const { data: batchNotifications, error: batchError } = await supabaseAdmin
          .from('notifications')
          .insert(batch)
          .select();

        if (batchError) {
          throw batchError;
        }

        notifications.push(...batchNotifications);
      }
    }

    res.status(201).json({
      success: true,
      message: `${notifications.length} notification(s) created successfully`,
      data: {
        notifications_created: notifications.length,
        sample_notification: notifications[0] || null
      }
    });

  } catch (insertError) {
    console.error('Notification insert error:', insertError);
    return res.status(500).json({
      success: false,
      error: 'Failed to create notification(s)'
    });
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