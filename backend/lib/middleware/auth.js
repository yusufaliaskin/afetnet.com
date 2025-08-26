import jwt from 'jsonwebtoken';
import { supabase, supabaseAdmin } from '../supabase.js';

/**
 * JWT token doğrulama middleware'i
 * @param {Object} req - Request object
 * @param {Object} res - Response object
 * @param {Function} next - Next middleware function
 */
export const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Access token required'
      });
    }

    // Supabase JWT token doğrulama
    const { data: { user }, error } = await supabase.auth.getUser(token);
    
    if (error || !user) {
      return res.status(403).json({
        success: false,
        error: 'Invalid or expired token'
      });
    }

    // Kullanıcı bilgilerini request'e ekle
    req.user = user;
    req.userId = user.id;
    
    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication failed'
    });
  }
};

/**
 * Opsiyonel kimlik doğrulama middleware'i
 * Token varsa doğrular, yoksa devam eder
 */
export const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (token) {
      const { data: { user }, error } = await supabase.auth.getUser(token);
      
      if (!error && user) {
        req.user = user;
        req.userId = user.id;
      }
    }
    
    next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    next(); // Hata olsa bile devam et
  }
};

/**
 * Admin yetkisi kontrolü
 */
export const requireAdmin = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required'
      });
    }

    // Admin kontrolü - user metadata'dan veya ayrı admin tablosundan
    const { data: userData, error } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', req.userId)
      .single();

    if (error || !userData) {
      return res.status(403).json({
        success: false,
        error: 'User not found'
      });
    }

    // Admin kontrolü (user metadata'da role field'ı olduğunu varsayıyoruz)
    if (req.user.user_metadata?.role !== 'admin' && req.user.app_metadata?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Admin access required'
      });
    }

    next();
  } catch (error) {
    console.error('Admin middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authorization failed'
    });
  }
};

/**
 * Rate limiting middleware
 */
const rateLimitStore = new Map();

export const rateLimit = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000, // 15 dakika
    max = 100, // maksimum istek sayısı
    message = 'Too many requests, please try again later'
  } = options;

  return (req, res, next) => {
    const key = req.ip || req.connection.remoteAddress;
    const now = Date.now();
    
    if (!rateLimitStore.has(key)) {
      rateLimitStore.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      return next();
    }

    const record = rateLimitStore.get(key);
    
    if (now > record.resetTime) {
      record.count = 1;
      record.resetTime = now + windowMs;
      return next();
    }

    if (record.count >= max) {
      return res.status(429).json({
        success: false,
        error: message,
        retryAfter: Math.ceil((record.resetTime - now) / 1000)
      });
    }

    record.count++;
    next();
  };
};

/**
 * CORS middleware
 */
export const corsMiddleware = (req, res, next) => {
  const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:8081',
    'http://localhost:8082',
    'https://your-app-domain.com' // Production domain
  ];

  const origin = req.headers.origin;
  
  if (allowedOrigins.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  next();
};

/**
 * Error handling middleware
 */
export const errorHandler = (error, req, res, next) => {
  console.error('API Error:', error);

  // Supabase errors
  if (error.code) {
    return res.status(400).json({
      success: false,
      error: error.message,
      code: error.code
    });
  }

  // Validation errors
  if (error.isJoi) {
    return res.status(400).json({
      success: false,
      error: 'Validation failed',
      details: error.details.map(detail => detail.message)
    });
  }

  // Default error
  res.status(500).json({
    success: false,
    error: 'Internal server error'
  });
};

/**
 * Request logging middleware
 */
export const requestLogger = async (req, res, next) => {
  const start = Date.now();
  
  // Response'u intercept et
  const originalSend = res.send;
  let responseBody;
  
  res.send = function(body) {
    responseBody = body;
    originalSend.call(this, body);
  };

  res.on('finish', async () => {
    const duration = Date.now() - start;
    
    try {
      // API log'u veritabanına kaydet
      await supabaseAdmin.from('api_logs').insert({
        endpoint: req.originalUrl,
        method: req.method,
        user_id: req.userId || null,
        ip_address: req.ip || req.connection.remoteAddress,
        user_agent: req.headers['user-agent'],
        request_body: req.method !== 'GET' ? req.body : null,
        response_status: res.statusCode,
        response_time: duration,
        error_message: res.statusCode >= 400 ? responseBody : null
      });
    } catch (error) {
      console.error('Failed to log API request:', error);
    }
  });

  next();
};

/**
 * Input validation middleware factory
 */
export const validateInput = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    
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
    
    next();
  };
};