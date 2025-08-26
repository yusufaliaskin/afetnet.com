import { supabase } from '../../../../lib/supabase';
import { authMiddleware } from '../../../../lib/middleware/auth';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
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
        return await getPostComments(req, res, postId);
      case 'POST':
        return await createComment(req, res, postId);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Post comments API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

// Get post comments
async function getPostComments(req, res, postId) {
  try {
    const { page = 1, limit = 20 } = req.query;
    const offset = (page - 1) * limit;

    const { data: comments, error } = await supabase
      .from('post_comments')
      .select(`
        *,
        users!post_comments_user_id_fkey (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('post_id', postId)
      .eq('is_active', true)
      .is('parent_comment_id', null) // Only top-level comments
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) {
      console.error('Error fetching post comments:', error);
      return res.status(400).json({ error: error.message });
    }

    // Get replies for each comment
    const commentsWithReplies = await Promise.all(
      (comments || []).map(async (comment) => {
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
          .eq('parent_comment_id', comment.id)
          .eq('is_active', true)
          .order('created_at', { ascending: true });

        return {
          ...comment,
          replies: replies || []
        };
      })
    );

    // Get total count for pagination
    const { count, error: countError } = await supabase
      .from('post_comments')
      .select('*', { count: 'exact', head: true })
      .eq('post_id', postId)
      .eq('is_active', true)
      .is('parent_comment_id', null);

    return res.status(200).json({
      comments: commentsWithReplies,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Get post comments error:', error);
    return res.status(500).json({ error: 'Failed to fetch post comments' });
  }
}

// Create a comment
async function createComment(req, res, postId) {
  try {
    // Check authentication
    const authResult = await authMiddleware(req, res);
    if (!authResult.success) {
      return res.status(401).json({ error: authResult.error });
    }

    const { content, parent_comment_id } = req.body;
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

    // If replying to a comment, check if parent comment exists
    if (parent_comment_id) {
      const { data: parentComment, error: parentError } = await supabase
        .from('post_comments')
        .select('id, post_id')
        .eq('id', parent_comment_id)
        .eq('is_active', true)
        .single();

      if (parentError) {
        if (parentError.code === 'PGRST116') {
          return res.status(404).json({ error: 'Parent comment not found' });
        }
        return res.status(400).json({ error: parentError.message });
      }

      if (parentComment.post_id !== postId) {
        return res.status(400).json({ error: 'Parent comment does not belong to this post' });
      }
    }

    // Create comment
    const { data: comment, error } = await supabase
      .from('post_comments')
      .insert({
        post_id: postId,
        user_id: user_id,
        content: content.trim(),
        parent_comment_id: parent_comment_id || null
      })
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
      console.error('Error creating comment:', error);
      return res.status(400).json({ error: error.message });
    }

    // Get updated comments count
    const { data: updatedPost, error: updateError } = await supabase
      .from('posts')
      .select('comments_count')
      .eq('id', postId)
      .single();

    return res.status(201).json({ 
      message: 'Comment created successfully',
      comment,
      comments_count: updatedPost?.comments_count || 0
    });
  } catch (error) {
    console.error('Create comment error:', error);
    return res.status(500).json({ error: 'Failed to create comment' });
  }
}