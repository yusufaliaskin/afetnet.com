import { supabase } from '../../../lib/supabase.js';
import { earthquakeSchemas } from '../../../lib/validation/schemas.js';
import { corsMiddleware, errorHandler, requestLogger, optionalAuth, rateLimit } from '../../../lib/middleware/auth.js';

/**
 * Deprem verileri endpoint'i
 * GET /api/earthquakes - Deprem listesi
 * POST /api/earthquakes - Yeni deprem ekle (admin)
 */
export default async function handler(req, res) {
  // CORS middleware
  corsMiddleware(req, res, () => {});
  
  // Request logging
  await requestLogger(req, res, () => {});

  // Rate limiting
  const rateLimitMiddleware = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: req.method === 'GET' ? 200 : 10, // GET için 200, POST için 10
    message: 'Too many requests, please try again later'
  });
  
  await new Promise((resolve) => {
    rateLimitMiddleware(req, res, resolve);
  });

  // Optional authentication (kullanıcı giriş yapmış olabilir)
  await new Promise((resolve) => {
    optionalAuth(req, res, resolve);
  });

  try {
    if (req.method === 'GET') {
      return await handleGetEarthquakes(req, res);
    } else if (req.method === 'POST') {
      return await handleCreateEarthquake(req, res);
    } else {
      return res.status(405).json({
        success: false,
        error: 'Method not allowed'
      });
    }
  } catch (error) {
    console.error('Earthquakes API error:', error);
    errorHandler(error, req, res, () => {});
  }
}

/**
 * Deprem listesi getir
 */
async function handleGetEarthquakes(req, res) {
  // Query parametrelerini validate et
  const { error, value } = earthquakeSchemas.search.validate(req.query);
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
    magnitude_min,
    magnitude_max,
    depth_min,
    depth_max,
    date_from,
    date_to,
    latitude,
    longitude,
    radius,
    source,
    limit,
    offset,
    sort_by,
    sort_order
  } = value;

  // Supabase query builder
  let query = supabase
    .from('earthquakes')
    .select(`
      id,
      magnitude,
      depth,
      location,
      latitude,
      longitude,
      date,
      source,
      quality,
      region,
      country,
      tsunami_warning,
      felt_reports,
      intensity_max,
      created_at
    `);

  // Filtreleri uygula
  if (magnitude_min !== undefined) {
    query = query.gte('magnitude', magnitude_min);
  }
  if (magnitude_max !== undefined) {
    query = query.lte('magnitude', magnitude_max);
  }
  if (depth_min !== undefined) {
    query = query.gte('depth', depth_min);
  }
  if (depth_max !== undefined) {
    query = query.lte('depth', depth_max);
  }
  if (date_from) {
    query = query.gte('date', date_from);
  }
  if (date_to) {
    query = query.lte('date', date_to);
  }
  if (source) {
    query = query.eq('source', source);
  }

  // Konum bazlı filtreleme
  if (latitude && longitude && radius) {
    // PostGIS ile mesafe hesaplama (km cinsinden)
    query = query.rpc('earthquakes_within_radius', {
      center_lat: latitude,
      center_lng: longitude,
      radius_km: radius
    });
  }

  // Sıralama
  const sortColumn = sort_by === 'date' ? 'date' : sort_by === 'magnitude' ? 'magnitude' : 'depth';
  query = query.order(sortColumn, { ascending: sort_order === 'asc' });

  // Sayfalama
  query = query.range(offset, offset + limit - 1);

  const { data: earthquakes, error: fetchError, count } = await query;

  if (fetchError) {
    console.error('Earthquake fetch error:', fetchError);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch earthquakes'
    });
  }

  // Toplam sayıyı al
  const { count: totalCount } = await supabase
    .from('earthquakes')
    .select('*', { count: 'exact', head: true });

  res.status(200).json({
    success: true,
    data: {
      earthquakes,
      pagination: {
        total: totalCount || 0,
        limit,
        offset,
        has_more: (offset + limit) < (totalCount || 0)
      },
      filters: {
        magnitude_min,
        magnitude_max,
        depth_min,
        depth_max,
        date_from,
        date_to,
        source,
        location: latitude && longitude ? { latitude, longitude, radius } : null
      }
    }
  });
}

/**
 * Yeni deprem ekle (admin only)
 */
async function handleCreateEarthquake(req, res) {
  // Admin kontrolü gerekli
  if (!req.user) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required'
    });
  }

  // Admin yetkisi kontrolü
  if (req.user.user_metadata?.role !== 'admin' && req.user.app_metadata?.role !== 'admin') {
    return res.status(403).json({
      success: false,
      error: 'Admin access required'
    });
  }

  // Input validation
  const { error, value } = earthquakeSchemas.create.validate(req.body);
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

  const earthquakeData = {
    ...value,
    latitude: value.coordinates.latitude,
    longitude: value.coordinates.longitude,
    coordinates: `POINT(${value.coordinates.longitude} ${value.coordinates.latitude})`
  };

  // Aynı external_id ile deprem var mı kontrol et
  if (earthquakeData.external_id) {
    const { data: existing } = await supabase
      .from('earthquakes')
      .select('id')
      .eq('external_id', earthquakeData.external_id)
      .single();

    if (existing) {
      return res.status(409).json({
        success: false,
        error: 'Earthquake with this external ID already exists'
      });
    }
  }

  // Depremi veritabanına ekle
  const { data: newEarthquake, error: insertError } = await supabase
    .from('earthquakes')
    .insert(earthquakeData)
    .select()
    .single();

  if (insertError) {
    console.error('Earthquake insert error:', insertError);
    return res.status(500).json({
      success: false,
      error: 'Failed to create earthquake record'
    });
  }

  res.status(201).json({
    success: true,
    message: 'Earthquake created successfully',
    data: {
      earthquake: newEarthquake
    }
  });
}

// Next.js API route configuration
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '2mb'
    }
  }
};