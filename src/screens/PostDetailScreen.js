import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  TextInput,
  Alert,
  Share,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const PostDetailScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { postId, focusComments } = route.params;

  const [post, setPost] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([]);
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);

  // Fetch post details
  const fetchPostDetails = async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/posts/${postId}`, {
        headers: {
          'Authorization': user ? `Bearer ${user.access_token}` : '',
        },
      });

      const data = await response.json();
      if (response.ok) {
        setPost(data.post);
      } else {
        Alert.alert(
          t.error || 'Hata',
          data.error || t.post_not_found || 'Post bulunamadı.'
        );
        navigation.goBack();
      }
    } catch (error) {
      console.error('Error fetching post details:', error);
      Alert.alert(
        t.error || 'Hata',
        t.network_error || 'Ağ hatası oluştu.'
      );
      navigation.goBack();
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch comments
  const fetchComments = async () => {
    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/posts/${postId}/comments`);
      const data = await response.json();
      if (response.ok) {
        setComments(data.comments || []);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    }
  };

  useEffect(() => {
    fetchPostDetails();
    fetchComments();
  }, [postId]);

  if (isLoading) {
    return (
      <View style={[{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }, { paddingTop: insets.top }]}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
        <Text style={{ marginTop: 16, color: theme.colors.text }}>
          {t.loading || 'Yükleniyor...'}
        </Text>
      </View>
    );
  }

  if (!post) {
    return (
      <View style={[{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.colors.background }, { paddingTop: insets.top }]}>
        <Text style={{ color: theme.colors.text }}>
          {t.post_not_found || 'Post bulunamadı.'}
        </Text>
      </View>
    );
  }

  const [oldComments] = useState([
    {
      id: 1,
      user: {
        name: language === 'tr' ? 'Ahmet Yılmaz' : 'Ahmet Yilmaz',
        avatar: 'https://via.placeholder.com/40x40/4A90E2/FFFFFF?text=AY',
      },
      text: language === 'tr' 
        ? 'Çok faydalı bir paylaşım, teşekkürler!' 
        : 'Very useful post, thank you!',
      date: language === 'tr' ? '2 saat önce' : '2 hours ago',
    },
    {
      id: 2,
      user: {
        name: language === 'tr' ? 'Fatma Demir' : 'Fatma Demir',
        avatar: 'https://via.placeholder.com/40x40/FF6B35/FFFFFF?text=FD',
      },
      text: language === 'tr' 
        ? 'Bu konuda daha fazla bilgi alabilir miyiz?' 
        : 'Can we get more information on this topic?',
      date: language === 'tr' ? '1 saat önce' : '1 hour ago',
    },
  ]);

  // Handle like/unlike
  const handleLike = async () => {
    if (!user) {
      Alert.alert(
        t.login_required || 'Giriş Gerekli',
        t.login_required_message || 'Bu işlem için giriş yapmanız gerekiyor.'
      );
      return;
    }

    try {
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/posts/${postId}/likes`, {
        method: post.user_liked ? 'DELETE' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.access_token}`,
        },
      });

      const data = await response.json();

      if (response.ok) {
        setPost(prevPost => ({
          ...prevPost,
          likes_count: data.likes_count || prevPost.likes_count,
          user_liked: !prevPost.user_liked
        }));
      } else {
        Alert.alert(
          t.error || 'Hata',
          data.error || t.operation_failed || 'İşlem başarısız oldu.'
        );
      }
    } catch (error) {
      console.error('Error liking post:', error);
      Alert.alert(
        t.error || 'Hata',
        t.network_error || 'Ağ hatası oluştu.'
      );
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${post.title}\n\n${post.content}`,
        title: post.title,
      });
    } catch (error) {
      Alert.alert(
        t.error || 'Hata',
        t.share_error || 'Paylaşım sırasında bir hata oluştu.'
      );
    }
  };

  const formatDate = (dateString) => {
    const now = new Date();
    const date = new Date(dateString);
    const diffInMs = now - date;
    const diffInMinutes = Math.floor(diffInMs / (1000 * 60));
    const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));

    if (diffInMinutes < 1) {
      return 'Şimdi';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} dakika önce`;
    } else if (diffInHours < 24) {
      return `${diffInHours} saat önce`;
    } else if (diffInDays < 7) {
      return `${diffInDays} gün önce`;
    } else {
      return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
  };

  // Handle add comment
  const handleAddComment = async () => {
    if (!user) {
      Alert.alert(
        t.login_required || 'Giriş Gerekli',
        t.login_required_message || 'Bu işlem için giriş yapmanız gerekiyor.'
      );
      return;
    }

    if (!commentText.trim()) {
      Alert.alert(
        t.error || 'Hata',
        t.comment_required || 'Yorum yazmanız gerekiyor.'
      );
      return;
    }

    try {
      setIsSubmittingComment(true);
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/posts/${postId}/comments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.access_token}`,
        },
        body: JSON.stringify({
          content: commentText.trim()
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setComments(prevComments => [...prevComments, data.comment]);
        setPost(prevPost => ({
          ...prevPost,
          comments_count: (prevPost.comments_count || 0) + 1
        }));
        setCommentText('');
      } else {
        Alert.alert(
          t.error || 'Hata',
          data.error || t.operation_failed || 'Yorum eklenemedi.'
        );
      }
    } catch (error) {
      console.error('Error adding comment:', error);
      Alert.alert(
        t.error || 'Hata',
        t.network_error || 'Ağ hatası oluştu.'
      );
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.colors.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    backButton: {
      padding: 8,
      marginRight: 8,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      flex: 1,
    },
    shareButton: {
      padding: 8,
    },
    scrollView: {
      flex: 1,
    },
    postContainer: {
      backgroundColor: theme.colors.background,
      paddingVertical: 16,
    },
    userHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      marginBottom: 16,
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: 12,
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      flexDirection: 'row',
      alignItems: 'center',
    },
    verifiedIcon: {
      marginLeft: 4,
    },
    userHandle: {
      fontSize: 14,
      color: theme.colors.secondaryText,
      marginTop: 2,
    },
    contentContainer: {
      paddingHorizontal: 16,
    },
    contentDate: {
      fontSize: 14,
      color: theme.colors.secondaryText,
      marginBottom: 12,
    },
    contentTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: theme.colors.text,
      lineHeight: 28,
      marginBottom: 12,
    },
    contentDescription: {
      fontSize: 16,
      color: theme.colors.text,
      lineHeight: 24,
      marginBottom: 16,
    },
    contentImage: {
      width: '100%',
      height: 250,
      borderRadius: 12,
      backgroundColor: '#E0E0E0',
      marginBottom: 16,
    },
    actionsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
    actionButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 8,
      paddingHorizontal: 16,
      borderRadius: 20,
      marginRight: 12,
    },
    likeButton: {
      backgroundColor: isLiked ? '#FFE5E5' : 'transparent',
    },
    actionText: {
      fontSize: 14,
      fontWeight: '500',
      marginLeft: 6,
    },
    likeText: {
      color: isLiked ? '#FF3B30' : theme.colors.secondaryText,
    },
    shareText: {
      color: theme.colors.secondaryText,
    },
    commentsSection: {
      backgroundColor: theme.colors.background,
      paddingTop: 16,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
      paddingHorizontal: 16,
      marginBottom: 16,
    },
    commentInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderTopWidth: 1,
      borderBottomWidth: 1,
      borderColor: theme.colors.border,
      backgroundColor: theme.colors.background,
    },
    commentInput: {
      flex: 1,
      borderWidth: 1,
      borderColor: theme.colors.border,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
      fontSize: 14,
      color: theme.colors.text,
      backgroundColor: theme.colors.background,
      marginRight: 12,
    },
    sendButton: {
      backgroundColor: theme.colors.primary,
      borderRadius: 20,
      paddingHorizontal: 16,
      paddingVertical: 8,
    },
    sendButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '500',
    },
    commentItem: {
      flexDirection: 'row',
      paddingHorizontal: 16,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    commentAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 12,
    },
    commentContent: {
      flex: 1,
    },
    commentHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 4,
    },
    commentUserName: {
      fontSize: 14,
      fontWeight: '600',
      color: theme.colors.text,
      marginRight: 8,
    },
    commentDate: {
      fontSize: 12,
      color: theme.colors.secondaryText,
    },
    commentText: {
      fontSize: 14,
      color: theme.colors.text,
      lineHeight: 20,
    },
  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color={theme.colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {language === 'tr' ? 'Gönderi Detayı' : 'Post Detail'}
        </Text>
        <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
          <Ionicons name="share-outline" size={24} color={theme.colors.text} />
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {/* Post Content */}
        <View style={styles.postContainer}>
          {/* User Header */}
          <View style={styles.userHeader}>
            {post.users?.avatar_url ? (
              <Image 
                source={{ uri: post.users.avatar_url }}
                style={styles.avatar}
                resizeMode="cover"
              />
            ) : (
              <View style={[styles.avatar, { backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center' }]}>
                <Text style={{ color: '#FFFFFF', fontSize: 18, fontWeight: '600' }}>
                  {(post.users?.full_name || post.users?.username || 'A').charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
            <View style={styles.userInfo}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.userName}>{post.users?.full_name || post.users?.username || 'Anonim'}</Text>
                {post.users?.is_verified && (
                  <Ionicons 
                    name="checkmark-circle" 
                    size={18} 
                    color={theme.colors.primary} 
                    style={styles.verifiedIcon}
                  />
                )}
              </View>
              <Text style={styles.userHandle}>@{post.users?.username || 'anonim'}</Text>
            </View>
          </View>

          {/* Content */}
          <View style={styles.contentContainer}>
            <Text style={styles.contentDate}>{formatDate(post.created_at)}</Text>
            <Text style={styles.contentTitle}>{post.title}</Text>
            <Text style={styles.contentDescription}>{post.content}</Text>
            
            {post.image_url && (
              <Image 
                source={{ uri: post.image_url }}
                style={styles.contentImage}
                resizeMode="cover"
              />
            )}
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, post.user_liked && styles.likeButton]} 
            onPress={handleLike}
          >
            <Ionicons 
              name={post.user_liked ? "heart" : "heart-outline"} 
              size={20} 
              color={post.user_liked ? "#FF3B30" : theme.colors.secondaryText} 
            />
            <Text style={[styles.actionText, post.user_liked && styles.likeText]}>{post.likes_count || 0}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="eye-outline" size={20} color={theme.colors.secondaryText} />
            <Text style={[styles.actionText, styles.shareText]}>{post.views_count || 0}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={20} color={theme.colors.secondaryText} />
            <Text style={[styles.actionText, styles.shareText]}>{post.comments_count || 0}</Text>
          </TouchableOpacity>
        </View>

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <Text style={styles.sectionTitle}>
            {language === 'tr' ? 'Yorumlar' : 'Comments'} ({comments.length})
          </Text>
          
          {/* Comment Input */}
          <View style={styles.commentInputContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder={language === 'tr' ? 'Yorum yazın...' : 'Write a comment...'}
              placeholderTextColor={theme.colors.secondaryText}
              value={commentText}
              onChangeText={setCommentText}
              multiline
            />
            <TouchableOpacity 
              style={[styles.sendButton, isSubmittingComment && { opacity: 0.6 }]} 
              onPress={handleAddComment}
              disabled={isSubmittingComment}
            >
              {isSubmittingComment ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.sendButtonText}>
                  {t.send || 'Gönder'}
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Comments List */}
          {comments.map((comment) => (
            <View key={comment.id} style={styles.commentItem}>
              {comment.users?.avatar_url ? (
                <Image 
                  source={{ uri: comment.users.avatar_url }}
                  style={styles.commentAvatar}
                  resizeMode="cover"
                />
              ) : (
                <View style={[styles.commentAvatar, { backgroundColor: theme.colors.primary, justifyContent: 'center', alignItems: 'center' }]}>
                  <Text style={{ color: '#FFFFFF', fontSize: 14, fontWeight: '600' }}>
                    {(comment.users?.full_name || comment.users?.username || 'A').charAt(0).toUpperCase()}
                  </Text>
                </View>
              )}
              <View style={styles.commentContent}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentUserName}>{comment.users?.full_name || comment.users?.username || 'Anonim'}</Text>
                  <Text style={styles.commentDate}>{formatDate(comment.created_at)}</Text>
                </View>
                <Text style={styles.commentText}>{comment.content}</Text>
              </View>
            </View>
          ))}
        </View>
        
        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

export default PostDetailScreen;