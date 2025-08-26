import { supabase } from '../../../../lib/supabase';
import { authMiddleware } from '../../../../lib/middleware/auth';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id: postId } = req.query;

  if (!postId) {
    return res.status(400).json({ error: 'Post ID is required' });
  }

  try {
    switch (req.method) {
      case 'GET':
        return await getPostLikes(req, res, postId);
      case 'POST':
        return await likePost(req, res, postId);
      case 'DELETE':
        return await unlikePost(req, res, postId);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Post likes API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

// Get post likes
async function getPostLikes(req, res, postId) {
  try {
    const { data: likes, error } = await supabase
      .from('post_likes')
      .select(`
        *,
        users!post_likes_user_id_fkey (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching post likes:', error);
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ 
      likes: likes || [],
      count: likes?.length || 0
    });
  } catch (error) {
    console.error('Get post likes error:', error);
    return res.status(500).json({ error: 'Failed to fetch post likes' });
  }
}

// Like a post
async function likePost(req, res, postId) {
  try {
    // Check authentication
    const authResult = await authMiddleware(req, res);
    if (!authResult.success) {
      return res.status(401).json({ error: authResult.error });
    }

    const user_id = authResult.user.id;

    // Check if post exists
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id')
      .eq('id', postId)
      .eq('is_active', true)
      .single();

    if (postError) {
      if (postError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Post not found' });
      }
      return res.status(400).json({ error: postError.message });
    }

    // Check if user already liked this post
    const { data: existingLike, error: checkError } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user_id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      return res.status(400).json({ error: checkError.message });
    }

    if (existingLike) {
      return res.status(400).json({ error: 'You have already liked this post' });
    }

    // Create like
    const { data: like, error } = await supabase
      .from('post_likes')
      .insert({
        post_id: postId,
        user_id: user_id
      })
      .select(`
        *,
        users!post_likes_user_id_fkey (
          id,
          full_name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error('Error creating like:', error);
      return res.status(400).json({ error: error.message });
    }

    // Get updated likes count
    const { data: updatedPost, error: updateError } = await supabase
      .from('posts')
      .select('likes_count')
      .eq('id', postId)
      .single();

    return res.status(201).json({ 
      message: 'Post liked successfully',
      like,
      likes_count: updatedPost?.likes_count || 0
    });
  } catch (error) {
    console.error('Like post error:', error);
    return res.status(500).json({ error: 'Failed to like post' });
  }
}

// Unlike a post
async function unlikePost(req, res, postId) {
  try {
    // Check authentication
    const authResult = await authMiddleware(req, res);
    if (!authResult.success) {
      return res.status(401).json({ error: authResult.error });
    }

    const user_id = authResult.user.id;

    // Check if like exists
    const { data: existingLike, error: checkError } = await supabase
      .from('post_likes')
      .select('id')
      .eq('post_id', postId)
      .eq('user_id', user_id)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Like not found' });
      }
      return res.status(400).json({ error: checkError.message });
    }

    // Delete like
    const { error } = await supabase
      .from('post_likes')
      .delete()
      .eq('post_id', postId)
      .eq('user_id', user_id);

    if (error) {
      console.error('Error deleting like:', error);
      return res.status(400).json({ error: error.message });
    }

    // Get updated likes count
    const { data: updatedPost, error: updateError } = await supabase
      .from('posts')
      .select('likes_count')
      .eq('id', postId)
      .single();

    return res.status(200).json({ 
      message: 'Post unliked successfully',
      likes_count: updatedPost?.likes_count || 0
    });
  } catch (error) {
    console.error('Unlike post error:', error);
    return res.status(500).json({ error: 'Failed to unlike post' });
  }
}