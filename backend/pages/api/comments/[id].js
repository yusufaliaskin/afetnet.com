import { supabase } from '../../../lib/supabase';
import { authMiddleware } from '../../../lib/middleware/auth';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { id: commentId } = req.query;

  if (!commentId) {
    return res.status(400).json({ error: 'Comment ID is required' });
  }

  try {
    switch (req.method) {
      case 'GET':
        return await getComment(req, res, commentId);
      case 'PUT':
        return await updateComment(req, res, commentId);
      case 'DELETE':
        return await deleteComment(req, res, commentId);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Comment API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

// Get a single comment
async function getComment(req, res, commentId) {
  try {
    const { data: comment, error } = await supabase
      .from('post_comments')
      .select(`
        *,
        users!post_comments_user_id_fkey (
          id,
          full_name,
          avatar_url
        ),
        posts!post_comments_post_id_fkey (
          id,
          title
        )
      `)
      .eq('id', commentId)
      .eq('is_active', true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: 'Comment not found' });
      }
      return res.status(400).json({ error: error.message });
    }

    // Get replies if this is a parent comment
    const { data: replies, error: repliesError } = await supabase
      .from('post_comments')
      .select(`
        *,
        users!post_comments_user_id_fkey (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('parent_comment_id', commentId)
      .eq('is_active', true)
      .order('created_at', { ascending: true });

    return res.status(200).json({
      ...comment,
      replies: replies || []
    });
  } catch (error) {
    console.error('Get comment error:', error);
    return res.status(500).json({ error: 'Failed to fetch comment' });
  }
}

// Update a comment
async function updateComment(req, res, commentId) {
  try {
    // Check authentication
    const authResult = await authMiddleware(req, res);
    if (!authResult.success) {
      return res.status(401).json({ error: authResult.error });
    }

    const { content } = req.body;
    const user_id = authResult.user.id;

    // Validation
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ 
        error: 'Comment content is required' 
      });
    }

    if (content.length > 1000) {
      return res.status(400).json({ 
        error: 'Comment must be less than 1000 characters' 
      });
    }

    // Check if comment exists and user owns it
    const { data: existingComment, error: checkError } = await supabase
      .from('post_comments')
      .select('id, user_id, post_id')
      .eq('id', commentId)
      .eq('is_active', true)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Comment not found' });
      }
      return res.status(400).json({ error: checkError.message });
    }

    // Check ownership
    if (existingComment.user_id !== user_id) {
      return res.status(403).json({ error: 'You can only edit your own comments' });
    }

    // Update comment
    const { data: comment, error } = await supabase
      .from('post_comments')
      .update({
        content: content.trim(),
        updated_at: new Date().toISOString()
      })
      .eq('id', commentId)
      .select(`
        *,
        users!post_comments_user_id_fkey (
          id,
          full_name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error('Error updating comment:', error);
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ 
      message: 'Comment updated successfully',
      comment
    });
  } catch (error) {
    console.error('Update comment error:', error);
    return res.status(500).json({ error: 'Failed to update comment' });
  }
}

// Delete a comment
async function deleteComment(req, res, commentId) {
  try {
    // Check authentication
    const authResult = await authMiddleware(req, res);
    if (!authResult.success) {
      return res.status(401).json({ error: authResult.error });
    }

    const { hard_delete = false } = req.query;
    const user_id = authResult.user.id;

    // Check if comment exists
    const { data: existingComment, error: checkError } = await supabase
      .from('post_comments')
      .select('id, user_id, post_id')
      .eq('id', commentId)
      .eq('is_active', true)
      .single();

    if (checkError) {
      if (checkError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Comment not found' });
      }
      return res.status(400).json({ error: checkError.message });
    }

    // Check ownership (users can only delete their own comments)
    if (existingComment.user_id !== user_id) {
      return res.status(403).json({ error: 'You can only delete your own comments' });
    }

    if (hard_delete === 'true') {
      // Hard delete - permanently remove from database
      const { error } = await supabase
        .from('post_comments')
        .delete()
        .eq('id', commentId);

      if (error) {
        console.error('Error hard deleting comment:', error);
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({ 
        message: 'Comment permanently deleted'
      });
    } else {
      // Soft delete - mark as inactive
      const { error } = await supabase
        .from('post_comments')
        .update({ 
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', commentId);

      if (error) {
        console.error('Error soft deleting comment:', error);
        return res.status(400).json({ error: error.message });
      }

      return res.status(200).json({ 
        message: 'Comment deleted successfully'
      });
    }
  } catch (error) {
    console.error('Delete comment error:', error);
    return res.status(500).json({ error: 'Failed to delete comment' });
  }
}