import { authMiddleware } from '../../../lib/middleware/auth';
import { v4 as uuidv4 } from 'uuid';

// In-memory storage for posts
let posts = [
  {
    id: uuidv4(),
    user_id: '550e8400-e29b-41d4-a716-446655440000',
    title: 'Afet Hazırlığı Önerileri',
    content: 'Deprem çantası hazırlamak için gerekli malzemeler: Su, konserve yiyecekler, el feneri, pil, ilk yardım malzemeleri ve önemli belgelerinizin kopyaları.',
    image_url: null,
    image_urls: null,
    likes_count: 15,
    comments_count: 8,
    shares_count: 3,
    is_active: true,
    created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    updated_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    users: {
      id: '550e8400-e29b-41d4-a716-446655440000',
      full_name: 'Ahmet Yılmaz',
      email: 'ahmet@example.com',
      avatar_url: null
    }
  },
  {
    id: uuidv4(),
    user_id: '550e8400-e29b-41d4-a716-446655440001',
    title: 'Deprem Anında Yapılması Gerekenler',
    content: 'Deprem sırasında sakin kalın, masa altına saklanın veya hayat üçgeni oluşturun. Asansör kullanmayın, merdivenleri tercih edin.',
    image_url: null,
    image_urls: null,
    likes_count: 23,
    comments_count: 12,
    shares_count: 7,
    is_active: true,
    created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
    updated_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    users: {
      id: '550e8400-e29b-41d4-a716-446655440001',
      full_name: 'Fatma Demir',
      email: 'fatma@example.com',
      avatar_url: null
    }
  },
  {
    id: uuidv4(),
    user_id: '550e8400-e29b-41d4-a716-446655440002',
    title: 'Yangın Güvenliği',
    content: 'Evde yangın söndürücü bulundurun, kaçış planı yapın ve düzenli olarak duman dedektörü pillerini kontrol edin.',
    image_url: null,
    image_urls: null,
    likes_count: 9,
    comments_count: 4,
    shares_count: 2,
    is_active: true,
    created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
    updated_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
    users: {
      id: '550e8400-e29b-41d4-a716-446655440002',
      full_name: 'Mehmet Kaya',
      email: 'mehmet@example.com',
      avatar_url: null
    }
  },
  {
    id: uuidv4(),
    user_id: '550e8400-e29b-41d4-a716-446655440003',
    title: 'İletişim Planı',
    content: 'Aile üyeleriyle acil durum iletişim planı oluşturun. Şehir dışından bir yakınınızın telefon numarasını herkes bilsin.',
    image_url: null,
    image_urls: null,
    likes_count: 18,
    comments_count: 6,
    shares_count: 5,
    is_active: true,
    created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    updated_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
    users: {
      id: '550e8400-e29b-41d4-a716-446655440003',
      full_name: 'Ayşe Özkan',
      email: 'ayse@example.com',
      avatar_url: null
    }
  },
  {
    id: uuidv4(),
    user_id: '550e8400-e29b-41d4-a716-446655440004',
    title: 'Su Baskını Önlemleri',
    content: 'Yağmurlu havalarda alt katlarda yaşayanlar dikkatli olmalı. Elektrik tesisatını kontrol ettirin ve su baskını için acil plan yapın.',
    image_url: null,
    image_urls: null,
    likes_count: 11,
    comments_count: 3,
    shares_count: 1,
    is_active: true,
    created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    updated_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
    users: {
      id: '550e8400-e29b-41d4-a716-446655440004',
      full_name: 'Ali Çelik',
      email: 'ali@example.com',
      avatar_url: null
    }
  }
];

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case 'GET':
        return await getPosts(req, res);
      case 'POST':
        return await createPost(req, res);
      case 'DELETE':
        return await deleteAllPosts(req, res);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Posts API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

// Get all posts with user information and interaction counts
async function getPosts(req, res) {
  try {
    const { page = 1, limit = 10, user_id } = req.query;
    const offset = (page - 1) * limit;

    // Filter active posts
    let filteredPosts = posts.filter(post => post.is_active);

    // Filter by user_id if provided
    if (user_id) {
      filteredPosts = filteredPosts.filter(post => post.user_id === user_id);
    }

    // Sort by created_at descending
    filteredPosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Apply pagination
    const paginatedPosts = filteredPosts.slice(offset, offset + parseInt(limit));

    return res.status(200).json({
      posts: paginatedPosts,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: filteredPosts.length,
        totalPages: Math.ceil(filteredPosts.length / limit)
      }
    });
  } catch (error) {
    console.error('Get posts error:', error);
    return res.status(500).json({ error: 'Failed to fetch posts' });
  }
}

// Create a new post
async function createPost(req, res) {
  try {
    const { title, content, image_url, image_urls } = req.body;

    // Validation
    if (!title || !content) {
      return res.status(400).json({ 
        error: 'Title and content are required' 
      });
    }

    if (title.length > 255) {
      return res.status(400).json({ 
        error: 'Title must be less than 255 characters' 
      });
    }

    if (content.length > 5000) {
      return res.status(400).json({ 
        error: 'Content must be less than 5000 characters' 
      });
    }

    // Create new post object
    const newPost = {
      id: uuidv4(),
      user_id: '550e8400-e29b-41d4-a716-446655440000', // Default user for demo
      title: title.trim(),
      content: content.trim(),
      image_url: image_url || null,
      image_urls: image_urls || null,
      likes_count: 0,
      comments_count: 0,
      shares_count: 0,
      is_active: true,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      users: {
        id: '550e8400-e29b-41d4-a716-446655440000',
        full_name: 'Yeni Kullanıcı',
        email: 'user@example.com',
        avatar_url: null
      }
    };

    // Add to in-memory storage
    posts.unshift(newPost); // Add to beginning of array

    return res.status(201).json({ 
      message: 'Post created successfully',
      post: newPost
    });
  } catch (error) {
    console.error('Create post error:', error);
    return res.status(500).json({ error: 'Failed to create post' });
  }
}

// Delete all posts (admin function)
async function deleteAllPosts(req, res) {
  try {
    const { confirm_delete_all } = req.body;
    if (confirm_delete_all !== 'YES_DELETE_ALL_POSTS') {
      return res.status(400).json({ 
        error: 'Confirmation required. Set confirm_delete_all to "YES_DELETE_ALL_POSTS"' 
      });
    }

    // Clear in-memory storage
    posts.length = 0;

    return res.status(200).json({ 
      message: 'All posts have been permanently deleted' 
    });
  } catch (error) {
    console.error('Delete all posts error:', error);
    return res.status(500).json({ error: 'Failed to delete posts' });
  }
}