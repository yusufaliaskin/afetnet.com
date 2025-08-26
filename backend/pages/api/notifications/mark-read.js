import { supabase } from '../../../lib/supabase.js';
import { notificationSchemas } from '../../../lib/validation/schemas.js';
import { corsMiddleware, errorHandler, requestLogger, authenticateToken, rateLimit } from '../../../lib/middleware/auth.js';

/**
 * Bildirimleri okundu olarak işaretleme endpoint'i
 * POST /api/notifications/mark-read
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

  // Rate limiting
  const rateLimitMiddleware = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 50, // 50 istek
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
    // Input validation
    const { error, value } = notificationSchemas.markAsRead.validate(req.body);
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

    const { notification_ids } = value;

    // Bildirimlerin kullanıcıya ait olduğunu kontrol et ve güncelle
    const { data: updatedNotifications, error: updateError } = await supabase
      .from('notifications')
      .update({
        read: true,
        read_at: new Date().toISOString()
      })
      .in('id', notification_ids)
      .eq('user_id', req.userId)
      .eq('read', false) // Sadece okunmamış olanları güncelle
      .select('id, title, read, read_at');

    if (updateError) {
      console.error('Mark as read error:', updateError);
      return res.status(500).json({
        success: false,
        error: 'Failed to mark notifications as read'
      });
    }

    // Güncellenen bildirim sayısını kontrol et
    const updatedCount = updatedNotifications?.length || 0;
    const requestedCount = notification_ids.length;

    if (updatedCount === 0) {
      return res.status(404).json({
        success: false,
        error: 'No unread notifications found with the provided IDs'
      });
    }

    // Kullanıcının toplam okunmamış bildirim sayısını al
    const { count: remainingUnreadCount } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', req.userId)
      .eq('read', false);

    res.status(200).json({
      success: true,
      message: `${updatedCount} notification(s) marked as read`,
      data: {
        updated_notifications: updatedNotifications,
        updated_count: updatedCount,
        requested_count: requestedCount,
        remaining_unread_count: remainingUnreadCount || 0,
        skipped_count: requestedCount - updatedCount // Zaten okunmuş veya bulunamayan
      }
    });

  } catch (error) {
    console.error('Mark as read handler error:', error);
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