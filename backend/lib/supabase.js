import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

// Public client (anon key)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false
  }
});

// Admin client (service role key) - sadece server-side kullanım için
export const supabaseAdmin = createClient(
  supabaseUrl,
  supabaseServiceRoleKey || supabaseAnonKey,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Database helper functions
export const db = {
  // Users table operations
  users: {
    async create(userData) {
      const { data, error } = await supabaseAdmin
        .from('users')
        .insert(userData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    
    async findById(id) {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    
    async findByEmail(email) {
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('email', email)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    
    async update(id, updates) {
      const { data, error } = await supabaseAdmin
        .from('users')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  },
  
  // Earthquakes table operations
  earthquakes: {
    async create(earthquakeData) {
      const { data, error } = await supabaseAdmin
        .from('earthquakes')
        .insert(earthquakeData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    
    async findAll(limit = 50, offset = 0) {
      const { data, error } = await supabase
        .from('earthquakes')
        .select('*')
        .order('date', { ascending: false })
        .range(offset, offset + limit - 1);
      
      if (error) throw error;
      return data;
    },
    
    async findById(id) {
      const { data, error } = await supabase
        .from('earthquakes')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    },
    
    async findByMagnitudeRange(minMagnitude, maxMagnitude) {
      const { data, error } = await supabase
        .from('earthquakes')
        .select('*')
        .gte('magnitude', minMagnitude)
        .lte('magnitude', maxMagnitude)
        .order('date', { ascending: false });
      
      if (error) throw error;
      return data;
    }
  },
  
  // Notifications table operations
  notifications: {
    async create(notificationData) {
      const { data, error } = await supabaseAdmin
        .from('notifications')
        .insert(notificationData)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    
    async findByUserId(userId, limit = 20) {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(limit);
      
      if (error) throw error;
      return data;
    },
    
    async markAsRead(id) {
      const { data, error } = await supabaseAdmin
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    }
  }
};

export default supabase;