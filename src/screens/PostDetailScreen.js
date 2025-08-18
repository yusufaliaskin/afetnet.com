import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const PostDetailScreen = ({ route, navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  const { post } = route.params;

  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(post.stats.likes);
  const [commentText, setCommentText] = useState('');
  const [comments, setComments] = useState([
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

  const handleLike = () => {
    setIsLiked(!isLiked);
    setLikeCount(isLiked ? likeCount - 1 : likeCount + 1);
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `${post.content.text}\n\n${post.content.description}`,
        title: post.content.text,
      });
    } catch (error) {
      Alert.alert(
        language === 'tr' ? 'Hata' : 'Error',
        language === 'tr' ? 'Paylaşım sırasında bir hata oluştu.' : 'An error occurred while sharing.'
      );
    }
  };

  const handleAddComment = () => {
    if (commentText.trim()) {
      const newComment = {
        id: comments.length + 1,
        user: {
          name: language === 'tr' ? 'Sen' : 'You',
          avatar: 'https://via.placeholder.com/40x40/8B4513/FFFFFF?text=S',
        },
        text: commentText,
        date: language === 'tr' ? 'Şimdi' : 'Now',
      };
      setComments([...comments, newComment]);
      setCommentText('');
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
            <Image 
              source={typeof post.user.avatar === 'string' ? { uri: post.user.avatar } : post.user.avatar}
              style={styles.avatar}
              resizeMode="cover"
            />
            <View style={styles.userInfo}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={styles.userName}>{post.user.name}</Text>
                {post.user.verified && (
                  <Ionicons 
                    name="checkmark-circle" 
                    size={18} 
                    color={theme.colors.primary} 
                    style={styles.verifiedIcon}
                  />
                )}
              </View>
              <Text style={styles.userHandle}>{post.user.username}</Text>
            </View>
          </View>

          {/* Content */}
          <View style={styles.contentContainer}>
            <Text style={styles.contentDate}>{post.content.date}</Text>
            <Text style={styles.contentTitle}>{post.content.text}</Text>
            <Text style={styles.contentDescription}>{post.content.description}</Text>
            
            <Image 
              source={typeof post.content.image === 'string' ? { uri: post.content.image } : post.content.image}
              style={styles.contentImage}
              resizeMode="cover"
            />
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity 
            style={[styles.actionButton, styles.likeButton]} 
            onPress={handleLike}
          >
            <Ionicons 
              name={isLiked ? "heart" : "heart-outline"} 
              size={20} 
              color={isLiked ? "#FF3B30" : theme.colors.secondaryText} 
            />
            <Text style={[styles.actionText, styles.likeText]}>{likeCount}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="eye-outline" size={20} color={theme.colors.secondaryText} />
            <Text style={[styles.actionText, styles.shareText]}>{post.stats.views}</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton}>
            <Ionicons name="chatbubble-outline" size={20} color={theme.colors.secondaryText} />
            <Text style={[styles.actionText, styles.shareText]}>{comments.length}</Text>
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
            <TouchableOpacity style={styles.sendButton} onPress={handleAddComment}>
              <Text style={styles.sendButtonText}>
                {language === 'tr' ? 'Gönder' : 'Send'}
              </Text>
            </TouchableOpacity>
          </View>

          {/* Comments List */}
          {comments.map((comment) => (
            <View key={comment.id} style={styles.commentItem}>
              <Image 
                source={{ uri: comment.user.avatar }}
                style={styles.commentAvatar}
                resizeMode="cover"
              />
              <View style={styles.commentContent}>
                <View style={styles.commentHeader}>
                  <Text style={styles.commentUserName}>{comment.user.name}</Text>
                  <Text style={styles.commentDate}>{comment.date}</Text>
                </View>
                <Text style={styles.commentText}>{comment.text}</Text>
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