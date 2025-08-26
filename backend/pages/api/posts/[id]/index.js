import { supabase } from '../../../../lib/supabase';
import { authMiddleware } from '../../../../lib/middleware/auth';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id } = req.query;

  if (!id) {
    return res.status(400).json({ error: 'Post ID is required' });
  }

  try {
    switch (req.method) {
      case 'GET':
        return await getPost(req, res, id);
      case 'PUT':
        return await updatePost(req, res, id);
      case 'DELETE':
        return await deletePost(req, res, id);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Post API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

// Get single post with detailed information
async function getPost(req, res, postId) {
  try {
    const { data: post, error } = await supabase
      .from('posts')
      .select(`
        *,
        users!posts_user_id_fkey (
          id,
          full_name,
          email,
          avatar_url
        )
      `)
      .eq('id', postId)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Post not found' });
      }
      console.error('Error fetching post:', error);
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ post });
  } catch (error) {
    console.error('Get post error:', error);
    return res.status(500).json({ error: 'Failed to fetch post' });
  }
}

// Update post
async function updatePost(req, res, postId) {
  try {
    // Check authentication
    const authResult = await authMiddleware(req, res);
    if (!authResult.success) {
      return res.status(401).json({ error: authResult.error });
    }

    const { title, content, image_url, image_urls } = req.body;
    const user_id = authResult.user.id;

    // Check if post exists and user owns it
    const { data: existingPost, error: fetchError } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', postId)
      .eq('is_active', true)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Post not found' });
      }
      return res.status(400).json({ error: fetchError.message });
    }

    if (existingPost.user_id !== user_id) {
      return res.status(403).json({ error: 'You can only edit your own posts' });
    }

    // Validation
    if (title && title.length > 255) {
      return res.status(400).json({ 
        error: 'Title must be less than 255 characters' 
      });
    }

    if (content && content.length > 5000) {
      return res.status(400).json({ 
        error: 'Content must be less than 5000 characters' 
      });
    }

    // Prepare update data
    const updateData = {};
    if (title !== undefined) updateData.title = title.trim();
    if (content !== undefined) updateData.content = content.trim();
    if (image_url !== undefined) updateData.image_url = image_url;
    if (image_urls !== undefined) updateData.image_urls = image_urls;

    // Update post
    const { data: post, error } = await supabase
      .from('posts')
      .update(updateData)
      .eq('id', postId)
      .select(`
        *,
        users!posts_user_id_fkey (
          id,
          full_name,
          email,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error('Error updating post:', error);
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ 
      message: 'Post updated successfully',
      post 
    });
  } catch (error) {
    console.error('Update post error:', error);
    return res.status(500).json({ error: 'Failed to update post' });
  }
}

// Delete post
async function deletePost(req, res, postId) {
  try {
    // Check authentication
    const authResult = await authMiddleware(req, res);
    if (!authResult.success) {
      return res.status(401).json({ error: authResult.error });
    }

    const user_id = authResult.user.id;

    // Check if post exists and user owns it
    const { data: existingPost, error: fetchError } = await supabase
      .from('posts')
      .select('user_id')
      .eq('id', postId)
      .eq('is_active', true)
      .single();

    if (fetchError) {
      if (fetchError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Post not found' });
      }
      return res.status(400).json({ error: fetchError.message });
    }

    if (existingPost.user_id !== user_id) {
      return res.status(403).json({ error: 'You can only delete your own posts' });
    }

    // Soft delete (set is_active to false) or hard delete
    const { soft_delete } = req.query;
    
    if (soft_delete === 'true') {
      // Soft delete
      const { error } = await supabase
        .from('posts')
        .update({ is_active: false })
        .eq('id', postId);

      if (error) {
        console.error('Error soft deleting post:', error);
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({ 
        message: 'Post deactivated successfully' 
      });
    } else {
      // Hard delete
      const { error } = await supabase
        .from('posts')
        .delete()
        .eq('id', postId);

      if (error) {
        console.error('Error deleting post:', error);
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({ 
        message: 'Post deleted permanently' 
      });
    }
  } catch (error) {
    console.error('Delete post error:', error);
    return res.status(500).json({ error: 'Failed to delete post' });
  }
}