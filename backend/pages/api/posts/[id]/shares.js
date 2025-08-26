import { supabase } from '../../../../lib/supabase';
import { authMiddleware } from '../../../../lib/middleware/auth';

export default async function handler(req, res) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
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
        return await getPostShares(req, res, postId);
      case 'POST':
        return await sharePost(req, res, postId);
      default:
        return res.status(405).json({ error: 'Method not allowed' });
    }
  } catch (error) {
    console.error('Post shares API error:', error);
    return res.status(500).json({ 
      error: 'Internal server error',
      message: error.message 
    });
  }
}

// Get post shares
async function getPostShares(req, res, postId) {
  try {
    const { data: shares, error } = await supabase
      .from('post_shares')
      .select(`
        *,
        users!post_shares_user_id_fkey (
          id,
          full_name,
          avatar_url
        )
      `)
      .eq('post_id', postId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching post shares:', error);
      return res.status(400).json({ error: error.message });
    }

    return res.status(200).json({ 
      shares: shares || [],
      count: shares?.length || 0
    });
  } catch (error) {
    console.error('Get post shares error:', error);
    return res.status(500).json({ error: 'Failed to fetch post shares' });
  }
}

// Share a post
async function sharePost(req, res, postId) {
  try {
    // Check authentication
    const authResult = await authMiddleware(req, res);
    if (!authResult.success) {
      return res.status(401).json({ error: authResult.error });
    }

    const { share_type = 'internal', message } = req.body;
    const user_id = authResult.user.id;

    // Validate share_type
    const validShareTypes = ['internal', 'external', 'copy_link'];
    if (!validShareTypes.includes(share_type)) {
      return res.status(400).json({ 
        error: 'Invalid share type. Must be one of: internal, external, copy_link' 
      });
    }

    // Check if post exists
    const { data: post, error: postError } = await supabase
      .from('posts')
      .select('id, title, user_id')
      .eq('id', postId)
      .eq('is_active', true)
      .single();

    if (postError) {
      if (postError.code === 'PGRST116') {
        return res.status(404).json({ error: 'Post not found' });
      }
      return res.status(400).json({ error: postError.message });
    }

    // Prevent users from sharing their own posts (optional business rule)
    if (post.user_id === user_id && share_type === 'internal') {
      return res.status(400).json({ error: 'You cannot share your own post internally' });
    }

    // Check if user already shared this post (for internal shares)
    if (share_type === 'internal') {
      const { data: existingShare, error: checkError } = await supabase
        .from('post_shares')
        .select('id')
        .eq('post_id', postId)
        .eq('user_id', user_id)
        .eq('share_type', 'internal')
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        return res.status(400).json({ error: checkError.message });
      }

      if (existingShare) {
        return res.status(400).json({ error: 'You have already shared this post' });
      }
    }

    // Create share record
    const { data: share, error } = await supabase
      .from('post_shares')
      .insert({
        post_id: postId,
        user_id: user_id,
        share_type: share_type,
        message: message || null
      })
      .select(`
        *,
        users!post_shares_user_id_fkey (
          id,
          full_name,
          avatar_url
        )
      `)
      .single();

    if (error) {
      console.error('Error creating share:', error);
      return res.status(400).json({ error: error.message });
    }

    // Get updated shares count
    const { data: updatedPost, error: updateError } = await supabase
      .from('posts')
      .select('shares_count')
      .eq('id', postId)
      .single();

    // Generate share URL based on share type
    let shareUrl = null;
    if (share_type === 'external' || share_type === 'copy_link') {
      shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/posts/${postId}`;
    }

    return res.status(201).json({ 
      message: 'Post shared successfully',
      share,
      shares_count: updatedPost?.shares_count || 0,
      share_url: shareUrl
    });
  } catch (error) {
    console.error('Share post error:', error);
    return res.status(500).json({ error: 'Failed to share post' });
  }
}