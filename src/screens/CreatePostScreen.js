import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator,
  Platform,
  KeyboardAvoidingView,
} from 'react-native';
import { StyleSheet } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';

const CreatePostScreen = ({ navigation }) => {
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  const { user } = useAuth();

  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [image, setImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Request permissions for image picker
  const requestPermissions = async () => {
    if (Platform.OS !== 'web') {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          t.permission_required || 'İzin Gerekli',
          t.camera_permission_message || 'Fotoğraf seçmek için galeri erişim izni gerekli.'
        );
        return false;
      }
    }
    return true;
  };

  // Pick image from gallery
  const pickImage = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        setImage(result.assets[0]);
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert(
        t.error || 'Hata',
        t.image_pick_error || 'Fotoğraf seçilirken bir hata oluştu.'
      );
    }
  };

  // Upload image to Supabase storage
  const uploadImage = async (imageUri) => {
    try {
      setIsUploading(true);
      
      // Create form data
      const formData = new FormData();
      const filename = `post_${Date.now()}.jpg`;
      
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg',
        name: filename,
      });

      // Upload to Supabase storage
      const { data, error } = await supabase.storage
        .from('posts')
        .upload(`images/${filename}`, formData, {
          cacheControl: '3600',
          upsert: false,
        });

      if (error) {
        throw error;
      }

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('posts')
        .getPublicUrl(`images/${filename}`);

      return publicUrl;
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    } finally {
      setIsUploading(false);
    }
  };

  // Create post
  const handleCreatePost = async () => {
    // Validation
    if (!title.trim()) {
      Alert.alert(
        t.validation_error || 'Doğrulama Hatası',
        t.title_required || 'Başlık gereklidir.'
      );
      return;
    }

    if (!content.trim()) {
      Alert.alert(
        t.validation_error || 'Doğrulama Hatası',
        t.content_required || 'İçerik gereklidir.'
      );
      return;
    }

    if (title.length > 200) {
      Alert.alert(
        t.validation_error || 'Doğrulama Hatası',
        t.title_too_long || 'Başlık 200 karakterden uzun olamaz.'
      );
      return;
    }

    if (content.length > 5000) {
      Alert.alert(
        t.validation_error || 'Doğrulama Hatası',
        t.content_too_long || 'İçerik 5000 karakterden uzun olamaz.'
      );
      return;
    }

    try {
      setIsLoading(true);

      let imageUrl = null;
      if (image) {
        imageUrl = await uploadImage(image.uri);
      }

      // Create post via API
      const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL}/api/posts`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.access_token}`,
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
          image_url: imageUrl,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Post oluşturulamadı');
      }

      Alert.alert(
        t.success || 'Başarılı',
        t.post_created_successfully || 'Post başarıyla oluşturuldu!',
        [
          {
            text: t.ok || 'Tamam',
            onPress: () => {
              // Reset form
              setTitle('');
              setContent('');
              setImage(null);
              // Navigate back to home
              navigation.navigate('Main');
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert(
        t.error || 'Hata',
        error.message || t.post_creation_error || 'Post oluşturulurken bir hata oluştu.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const styles = createStyles(theme);

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => navigation.goBack()}
        >
          <Ionicons 
            name="arrow-back" 
            size={24} 
            color={theme.colors.text} 
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>
          {t.create_post || 'Post Oluştur'}
        </Text>
        <TouchableOpacity 
          style={[styles.publishButton, (!title.trim() || !content.trim() || isLoading) && styles.publishButtonDisabled]} 
          onPress={handleCreatePost}
          disabled={!title.trim() || !content.trim() || isLoading}
        >
          {isLoading ? (
            <ActivityIndicator size="small" color={theme.colors.background} />
          ) : (
            <Text style={styles.publishButtonText}>
              {t.publish || 'Paylaş'}
            </Text>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Title Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            {t.post_title || 'Post Başlığı'}
          </Text>
          <TextInput
            style={styles.titleInput}
            placeholder={t.enter_title || 'Başlık girin...'}
            placeholderTextColor={theme.colors.textSecondary}
            value={title}
            onChangeText={setTitle}
            maxLength={200}
            multiline={false}
          />
          <Text style={styles.characterCount}>
            {title.length}/200
          </Text>
        </View>

        {/* Content Input */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            {t.post_content || 'Post İçeriği'}
          </Text>
          <TextInput
            style={styles.contentInput}
            placeholder={t.enter_content || 'İçeriğinizi yazın...'}
            placeholderTextColor={theme.colors.textSecondary}
            value={content}
            onChangeText={setContent}
            maxLength={5000}
            multiline={true}
            textAlignVertical="top"
          />
          <Text style={styles.characterCount}>
            {content.length}/5000
          </Text>
        </View>

        {/* Image Section */}
        <View style={styles.inputContainer}>
          <Text style={styles.label}>
            {t.post_image || 'Fotoğraf'} ({t.optional || 'İsteğe bağlı'})
          </Text>
          
          {image ? (
            <View style={styles.imageContainer}>
              <Image source={{ uri: image.uri }} style={styles.selectedImage} />
              <TouchableOpacity 
                style={styles.removeImageButton}
                onPress={() => setImage(null)}
              >
                <Ionicons name="close-circle" size={24} color={theme.colors.error} />
              </TouchableOpacity>
            </View>
          ) : (
            <TouchableOpacity 
              style={styles.imagePickerButton} 
              onPress={pickImage}
              disabled={isUploading}
            >
              {isUploading ? (
                <ActivityIndicator size="small" color={theme.colors.primary} />
              ) : (
                <>
                  <Ionicons 
                    name="camera" 
                    size={32} 
                    color={theme.colors.primary} 
                  />
                  <Text style={styles.imagePickerText}>
                    {t.select_image || 'Fotoğraf Seç'}
                  </Text>
                </>
              )}
            </TouchableOpacity>
          )}
        </View>

        {/* Guidelines */}
        <View style={styles.guidelinesContainer}>
          <Text style={styles.guidelinesTitle}>
            {t.posting_guidelines || 'Paylaşım Kuralları'}
          </Text>
          <Text style={styles.guidelinesText}>
            • {t.guideline_1 || 'Saygılı ve yapıcı bir dil kullanın'}
          </Text>
          <Text style={styles.guidelinesText}>
            • {t.guideline_2 || 'Spam veya tekrarlayan içerik paylaşmayın'}
          </Text>
          <Text style={styles.guidelinesText}>
            • {t.guideline_3 || 'Telif hakkı olan içerikleri paylaşmayın'}
          </Text>
          <Text style={styles.guidelinesText}>
            • {t.guideline_4 || 'Kişisel bilgileri paylaşmaktan kaçının'}
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const createStyles = (theme) => StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  backButton: {
    padding: 8,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: theme.colors.text,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: 16,
  },
  publishButton: {
    backgroundColor: theme.colors.primary,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 70,
    alignItems: 'center',
  },
  publishButtonDisabled: {
    backgroundColor: theme.colors.disabled,
  },
  publishButtonText: {
    color: theme.colors.background,
    fontSize: 14,
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  inputContainer: {
    marginBottom: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 8,
  },
  titleInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
    minHeight: 50,
  },
  contentInput: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
    minHeight: 120,
  },
  characterCount: {
    fontSize: 12,
    color: theme.colors.textSecondary,
    textAlign: 'right',
    marginTop: 4,
  },
  imageContainer: {
    position: 'relative',
    marginTop: 8,
  },
  selectedImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    resizeMode: 'cover',
  },
  removeImageButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: theme.colors.background,
    borderRadius: 12,
  },
  imagePickerButton: {
    borderWidth: 2,
    borderColor: theme.colors.primary,
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: theme.colors.surface,
  },
  imagePickerText: {
    fontSize: 16,
    color: theme.colors.primary,
    marginTop: 8,
    fontWeight: '500',
  },
  guidelinesContainer: {
    backgroundColor: theme.colors.surface,
    padding: 16,
    borderRadius: 12,
    marginTop: 16,
  },
  guidelinesTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: theme.colors.text,
    marginBottom: 12,
  },
  guidelinesText: {
    fontSize: 14,
    color: theme.colors.textSecondary,
    marginBottom: 4,
    lineHeight: 20,
  },
});

export default CreatePostScreen;