import Joi from 'joi';

// Genel validation kuralları
const coordinateSchema = Joi.object({
  latitude: Joi.number().min(-90).max(90).required(),
  longitude: Joi.number().min(-180).max(180).required()
});

const uuidSchema = Joi.string().uuid().required();
const emailSchema = Joi.string().email().required();
const phoneSchema = Joi.string().pattern(/^[+]?[0-9\s\-\(\)]{10,20}$/);

// User validation schemas
export const userSchemas = {
  register: Joi.object({
    email: emailSchema,
    password: Joi.string().min(8).max(128).required()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'password')
      .messages({
        'string.pattern.name': 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
      }),
    full_name: Joi.string().min(2).max(100).required(),
    phone: phoneSchema.optional()
  }),

  login: Joi.object({
    email: emailSchema,
    password: Joi.string().required()
  }),

  updateProfile: Joi.object({
    full_name: Joi.string().min(2).max(100).optional(),
    phone: phoneSchema.optional(),
    avatar_url: Joi.string().uri().optional(),
    location: coordinateSchema.optional(),
    notification_preferences: Joi.object({
      earthquake_alerts: Joi.boolean().optional(),
      emergency_notifications: Joi.boolean().optional(),
      news_updates: Joi.boolean().optional(),
      magnitude_threshold: Joi.number().min(1).max(10).optional()
    }).optional()
  }),

  changePassword: Joi.object({
    current_password: Joi.string().required(),
    new_password: Joi.string().min(8).max(128).required()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, 'password')
      .messages({
        'string.pattern.name': 'Password must contain at least one uppercase letter, one lowercase letter, one number and one special character'
      })
  }),

  resetPassword: Joi.object({
    email: emailSchema
  }),

  verifyEmail: Joi.object({
    token: Joi.string().required()
  })
};

// Earthquake validation schemas
export const earthquakeSchemas = {
  create: Joi.object({
    external_id: Joi.string().optional(),
    magnitude: Joi.number().min(0).max(10).precision(1).required(),
    depth: Joi.number().min(0).max(1000).precision(2).optional(),
    location: Joi.string().min(1).max(500).required(),
    coordinates: coordinateSchema.required(),
    date: Joi.date().iso().required(),
    source: Joi.string().valid('kandilli', 'afad', 'manual').required(),
    quality: Joi.string().valid('automatic', 'reviewed', 'final').optional(),
    region: Joi.string().max(255).optional(),
    country: Joi.string().max(100).default('Turkey'),
    tsunami_warning: Joi.boolean().default(false),
    intensity_max: Joi.number().min(1).max(12).precision(1).optional(),
    raw_data: Joi.object().optional()
  }),

  update: Joi.object({
    magnitude: Joi.number().min(0).max(10).precision(1).optional(),
    depth: Joi.number().min(0).max(1000).precision(2).optional(),
    location: Joi.string().min(1).max(500).optional(),
    coordinates: coordinateSchema.optional(),
    quality: Joi.string().valid('automatic', 'reviewed', 'final').optional(),
    region: Joi.string().max(255).optional(),
    tsunami_warning: Joi.boolean().optional(),
    felt_reports: Joi.number().min(0).optional(),
    intensity_max: Joi.number().min(1).max(12).precision(1).optional()
  }),

  search: Joi.object({
    magnitude_min: Joi.number().min(0).max(10).optional(),
    magnitude_max: Joi.number().min(0).max(10).optional(),
    depth_min: Joi.number().min(0).optional(),
    depth_max: Joi.number().min(0).optional(),
    date_from: Joi.date().iso().optional(),
    date_to: Joi.date().iso().optional(),
    latitude: Joi.number().min(-90).max(90).optional(),
    longitude: Joi.number().min(-180).max(180).optional(),
    radius: Joi.number().min(1).max(1000).optional(), // km
    source: Joi.string().valid('kandilli', 'afad', 'manual').optional(),
    limit: Joi.number().min(1).max(1000).default(50),
    offset: Joi.number().min(0).default(0),
    sort_by: Joi.string().valid('date', 'magnitude', 'depth').default('date'),
    sort_order: Joi.string().valid('asc', 'desc').default('desc')
  })
};

// Notification validation schemas
export const notificationSchemas = {
  create: Joi.object({
    user_id: uuidSchema.optional(), // Admin can specify user_id
    earthquake_id: uuidSchema.optional(),
    type: Joi.string().valid('earthquake_alert', 'emergency', 'news', 'system').required(),
    title: Joi.string().min(1).max(255).required(),
    message: Joi.string().min(1).max(2000).required(),
    priority: Joi.string().valid('low', 'normal', 'high', 'critical').default('normal'),
    metadata: Joi.object().optional()
  }),

  update: Joi.object({
    read: Joi.boolean().optional()
  }),

  markAsRead: Joi.object({
    notification_ids: Joi.array().items(uuidSchema).min(1).required()
  }),

  search: Joi.object({
    type: Joi.string().valid('earthquake_alert', 'emergency', 'news', 'system').optional(),
    read: Joi.boolean().optional(),
    priority: Joi.string().valid('low', 'normal', 'high', 'critical').optional(),
    date_from: Joi.date().iso().optional(),
    date_to: Joi.date().iso().optional(),
    limit: Joi.number().min(1).max(100).default(20),
    offset: Joi.number().min(0).default(0)
  })
};

// Emergency contact validation schemas
export const emergencyContactSchemas = {
  create: Joi.object({
    name: Joi.string().min(1).max(255).required(),
    phone: phoneSchema.required(),
    relationship: Joi.string().max(100).optional(),
    priority: Joi.number().min(1).max(10).default(1)
  }),

  update: Joi.object({
    name: Joi.string().min(1).max(255).optional(),
    phone: phoneSchema.optional(),
    relationship: Joi.string().max(100).optional(),
    priority: Joi.number().min(1).max(10).optional(),
    is_active: Joi.boolean().optional()
  })
};

// User location validation schemas
export const userLocationSchemas = {
  create: Joi.object({
    name: Joi.string().min(1).max(255).required(),
    address: Joi.string().max(500).optional(),
    coordinates: coordinateSchema.required(),
    radius: Joi.number().min(100).max(100000).default(10000), // meters
    is_primary: Joi.boolean().default(false)
  }),

  update: Joi.object({
    name: Joi.string().min(1).max(255).optional(),
    address: Joi.string().max(500).optional(),
    coordinates: coordinateSchema.optional(),
    radius: Joi.number().min(100).max(100000).optional(),
    is_primary: Joi.boolean().optional()
  })
};

// Disaster report validation schemas
export const disasterReportSchemas = {
  create: Joi.object({
    earthquake_id: uuidSchema.optional(),
    type: Joi.string().valid('damage', 'injury', 'help_needed', 'safe', 'infrastructure').required(),
    title: Joi.string().min(1).max(255).required(),
    description: Joi.string().max(2000).optional(),
    coordinates: coordinateSchema.optional(),
    address: Joi.string().max(500).optional(),
    severity: Joi.string().valid('low', 'medium', 'high', 'critical').default('low'),
    images: Joi.array().items(Joi.string().uri()).max(10).optional(),
    contact_info: Joi.object({
      phone: phoneSchema.optional(),
      email: Joi.string().email().optional(),
      name: Joi.string().max(100).optional()
    }).optional()
  }),

  update: Joi.object({
    title: Joi.string().min(1).max(255).optional(),
    description: Joi.string().max(2000).optional(),
    severity: Joi.string().valid('low', 'medium', 'high', 'critical').optional(),
    status: Joi.string().valid('pending', 'verified', 'resolved', 'false_report').optional(),
    images: Joi.array().items(Joi.string().uri()).max(10).optional(),
    contact_info: Joi.object({
      phone: phoneSchema.optional(),
      email: Joi.string().email().optional(),
      name: Joi.string().max(100).optional()
    }).optional()
  }),

  search: Joi.object({
    type: Joi.string().valid('damage', 'injury', 'help_needed', 'safe', 'infrastructure').optional(),
    severity: Joi.string().valid('low', 'medium', 'high', 'critical').optional(),
    status: Joi.string().valid('pending', 'verified', 'resolved', 'false_report').optional(),
    earthquake_id: uuidSchema.optional(),
    latitude: Joi.number().min(-90).max(90).optional(),
    longitude: Joi.number().min(-180).max(180).optional(),
    radius: Joi.number().min(1).max(1000).optional(), // km
    date_from: Joi.date().iso().optional(),
    date_to: Joi.date().iso().optional(),
    limit: Joi.number().min(1).max(100).default(20),
    offset: Joi.number().min(0).default(0)
  }),

  verify: Joi.object({
    status: Joi.string().valid('verified', 'false_report').required(),
    notes: Joi.string().max(500).optional()
  })
};

// API parameter validation schemas
export const paramSchemas = {
  uuid: Joi.object({
    id: uuidSchema
  }),

  pagination: Joi.object({
    page: Joi.number().min(1).default(1),
    limit: Joi.number().min(1).max(100).default(20)
  }),

  coordinates: Joi.object({
    latitude: Joi.number().min(-90).max(90).required(),
    longitude: Joi.number().min(-180).max(180).required(),
    radius: Joi.number().min(1).max(1000).optional() // km
  })
};

// File upload validation
export const fileSchemas = {
  image: Joi.object({
    mimetype: Joi.string().valid('image/jpeg', 'image/png', 'image/webp').required(),
    size: Joi.number().max(5 * 1024 * 1024).required() // 5MB max
  }),

  avatar: Joi.object({
    mimetype: Joi.string().valid('image/jpeg', 'image/png', 'image/webp').required(),
    size: Joi.number().max(2 * 1024 * 1024).required() // 2MB max
  })
};

// Custom validation functions
export const customValidations = {
  // Koordinatların Türkiye sınırları içinde olup olmadığını kontrol et
  validateTurkeyCoordinates: (latitude, longitude) => {
    const turkeyBounds = {
      north: 42.1,
      south: 35.8,
      east: 44.8,
      west: 25.7
    };
    
    return latitude >= turkeyBounds.south && 
           latitude <= turkeyBounds.north && 
           longitude >= turkeyBounds.west && 
           longitude <= turkeyBounds.east;
  },

  // Deprem büyüklüğünün mantıklı olup olmadığını kontrol et
  validateMagnitude: (magnitude, depth) => {
    // Çok yüzeysel depremlerde büyük magnitude beklenmiyor
    if (depth < 5 && magnitude > 7) {
      return false;
    }
    
    // Çok derin depremlerde çok küçük magnitude beklenmiyor
    if (depth > 300 && magnitude < 4) {
      return false;
    }
    
    return true;
  },

  // Telefon numarasının Türkiye formatında olup olmadığını kontrol et
  validateTurkishPhone: (phone) => {
    const turkishPhoneRegex = /^(\+90|0)?[5][0-9]{9}$/;
    return turkishPhoneRegex.test(phone.replace(/\s|-|\(|\)/g, ''));
  },

  // Email domain'inin güvenli olup olmadığını kontrol et
  validateEmailDomain: (email) => {
    const blockedDomains = ['tempmail.org', '10minutemail.com', 'guerrillamail.com'];
    const domain = email.split('@')[1];
    return !blockedDomains.includes(domain);
  }
};

// Validation helper functions
export const validationHelpers = {
  // Joi validation sonucunu standart format'a çevir
  formatValidationError: (error) => {
    return {
      success: false,
      error: 'Validation failed',
      details: error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message,
        value: detail.context?.value
      }))
    };
  },

  // Başarılı validation sonucu
  validationSuccess: (data) => {
    return {
      success: true,
      data
    };
  }
};