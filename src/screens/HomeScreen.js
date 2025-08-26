import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  RefreshControl,
  ActivityIndicator,
  Alert,
  FlatList,
  TextInput,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import StatusBar from '../components/StatusBar';
import { SvgUri } from 'react-native-svg';

const HomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  const { user } = useAuth();
  const { width: screenWidth } = Dimensions.get('window');
  const isTablet = screenWidth > 768;

  const [posts, setPosts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('trending');
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [isFilterVisible, setIsFilterVisible] = useState(false);
  const [selectedFilters, setSelectedFilters] = useState([]);

  const categories = [
    // Ana sayfadaki kategori butonları kaldırıldı
  ];

  const filterOptions = [
    { id: 'deprem', name: 'Deprem', icon: 'earth-outline' },
    { id: 'sel', name: 'Sel', icon: 'water-outline' },
    { id: 'yangin', name: 'Yangın', icon: 'flame-outline' },
  ];

  // Kuruluş logoları mapping
  const organizationLogos = {
    'AFAD': require('../../assets/afad-logo.svg'),
    'Meteoroloji Genel Müdürlüğü': require('../../assets/mgm-logo.svg'),
    'Orman Genel Müdürlüğü': require('../../assets/ogm-logo.svg'),
    'MTA Genel Müdürlüğü': require('../../assets/mta-logo.svg'),
  };

  // Sample news posts with improved content
  const sampleNewsPosts = [
    {
      id: 1,
      title: "Türkiye'de Deprem Erken Uyarı Sistemi Güncellendi",
      content: 'AFAD tarafından geliştirilen yeni erken uyarı sistemi, deprem öncesi kritik saniyeler kazandırarak can kayıplarını azaltmayı hedefliyor.',
      category: 'deprem',
      image_url: 'https://fileapi.bereket.com.tr/api/v1/image/public/57fc57d41cbb4339b1ab352195333519.jpeg',
      created_at: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      views_count: 2450,
      comments_count: 89,
      likes_count: 156,
      author: 'AFAD',
      readTime: '3 dk'
    },
    {
      id: 2,
      title: 'Orman Yangınları İçin Yeni Drone Teknolojisi',
      content: 'Yapay zeka destekli drone sistemleri, orman yangınlarını erken tespit ederek müdahale süresini %40 azaltıyor.',
      category: 'yangin',
      image_url: 'https://ichef.bbci.co.uk/ace/ws/640/cpsprodpb/9482/live/92a48800-1f13-11ee-9c7b-1b16c0025d82.jpg.webp',
      created_at: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      views_count: 1890,
      comments_count: 45,
      likes_count: 78,
      author: 'Orman Genel Müdürlüğü',
      readTime: '2 dk'
    },
    {
      id: 3,
      title: "Sel Baskınlarına Karşı Yeni Erken Uyarı Sistemi",
      content: 'Meteoroloji Genel Müdürlüğü, yapay zeka destekli yeni sistem ile sel riskini 6 saat önceden tahmin edebiliyor.',
      category: 'sel',
      image_url: 'https://fileapi.bereket.com.tr/api/v1/image/public/57fc57d41cbb4339b1ab352195333519.jpeg',
      created_at: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(),
      views_count: 3200,
      comments_count: 120,
      likes_count: 89,
      author: 'Meteoroloji Genel Müdürlüğü',
      readTime: '4 dk'
    },
    {
      id: 4,
      title: "Heyelan Riskli Bölgeler İçin Yeni Haritalama Sistemi",
      content: 'Jeoloji mühendisleri, uydu görüntüleri ve yapay zeka ile heyelan riskli bölgeleri %95 doğrulukla tespit ediyor.',
      category: 'heyelan',
      image_url: 'https://fileapi.bereket.com.tr/api/v1/image/public/57fc57d41cbb4339b1ab352195333519.jpeg',
      created_at: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(),
      views_count: 1567,
      comments_count: 78,
      likes_count: 123,
      author: 'MTA Genel Müdürlüğü',
      readTime: '5 dk'
    },
    {
      id: 5,
      title: 'Championship Finals: Underdog Team Secures Victory',
      content: 'Against all odds, the rookie team defeats the defending champions in a nail-biting finale.',
      category: 'sports',
      image_url: 'https://images.unsplash.com/photo-1461896836934-ffe607ba8211?w=400&h=200&fit=crop',
      created_at: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
      views_count: 4567,
      comments_count: 234,
      likes_count: 678
    },
    {
      id: 6,
      title: 'Market Analysis: Cryptocurrency Reaches New Milestone',
      content: 'Digital currencies show unprecedented growth as institutional adoption continues to rise.',
      category: 'business',
      image_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&h=200&fit=crop',
      created_at: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
      views_count: 2890,
      comments_count: 156,
      likes_count: 345
    }
  ];

  // Fetch posts from API
  const fetchPosts = async () => {
    try {
      setIsLoading(true);
      // Using sample news posts for now
      setTimeout(() => {
        setPosts(sampleNewsPosts);
        setIsLoading(false);
        setIsRefreshing(false);
      }, 1000);
    } catch (error) {
      console.error('Error fetching posts:', error);
      Alert.alert(
        'Error',
        'An error occurred while loading posts.'
      );
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  // Handle refresh
  const handleRefresh = () => {
    setIsRefreshing(true);
    fetchPosts();
  };

  // Handle filter toggle
  const handleFilterToggle = (filterId) => {
    setSelectedFilters(prev => {
      if (prev.includes(filterId)) {
        return prev.filter(id => id !== filterId);
      } else {
        return [...prev, filterId];
      }
    });
  };

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60));
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${diffInHours}h ago`;
    } else {
      const diffInDays = Math.floor(diffInHours / 24);
      return `${diffInDays}d ago`;
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: '#000000',
    },

    // Categories styles removed for cleaner design
    newsContainer: {
      paddingHorizontal: 0,
      paddingTop: 0,
      paddingBottom: 0,
    },
    newsCard: {
      backgroundColor: '#FFFFFF',
      borderRadius: 0,
      marginBottom: 0,
      marginHorizontal: 0,
      width: '100%',
      shadowColor: 'transparent',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0,
      shadowRadius: 0,
      elevation: 0,
      borderWidth: 0,
      borderBottomWidth: 1,
      borderBottomColor: '#E1E8ED',
    },
    // User Header Styles
    userHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 15,
      paddingTop: 12,
      paddingBottom: 0,
    },
    userInfo: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    avatarContainer: {
      marginRight: 12,
    },
    userAvatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#F0F0F0',
    },
    organizationLogo: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: '#F0F0F0',
    },
    userDetails: {
      flex: 1,
    },
    userNameContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      marginBottom: 2,
    },
    userName: {
       fontSize: isTablet ? 18 : 16,
       fontWeight: '700',
       color: '#000000',
       marginRight: 4,
     },
    verifiedBadge: {
      marginLeft: 2,
    },
    postTime: {
       fontSize: isTablet ? 15 : 14,
       color: '#666666',
       fontWeight: '400',
     },
    moreButton: {
      padding: 4,
    },
    // Post Content Styles
    postContent: {
      paddingHorizontal: 15,
      paddingTop: 12,
      paddingBottom: 0,
    },
    postText: {
       fontSize: isTablet ? 16 : 15,
       color: '#000000',
       lineHeight: isTablet ? 24 : 22,
       fontWeight: '400',
     },
    // Post Image Styles
    postImageContainer: {
      marginHorizontal: 15,
      marginTop: 12,
      marginBottom: 0,
      borderRadius: 16,
      overflow: 'hidden',
    },
    postImage: {
      width: '100%',
      height: 200,
      backgroundColor: '#F0F0F0',
    },
    // Interaction Stats Styles
    interactionStats: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 15,
      paddingVertical: 12,
      borderTopWidth: 0,
    },
    leftStats: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 20,
    },
    statText: {
      fontSize: 14,
      color: '#666666',
      marginLeft: 4,
      fontWeight: '500',
    },
    saveButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: 6,
      backgroundColor: '#F8F8F8',
    },
    saveText: {
      fontSize: 14,
      color: '#666666',
      marginLeft: 4,
      fontWeight: '500',
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 50,
    },
    emptyContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      paddingVertical: 50,
      paddingHorizontal: 20,
    },
    emptyText: {
      fontSize: 16,
      color: theme.colors.textSecondary,
      textAlign: 'center',
      marginTop: 16,
    },
    searchContainer: {
      backgroundColor: theme.colors.background,
      paddingHorizontal: 20,
      paddingVertical: 12,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    searchInputContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.colors.surface,
      borderRadius: 25,
      paddingHorizontal: 16,
      paddingVertical: 10,
    },
    searchInput: {
      flex: 1,
      fontSize: 16,
      color: theme.colors.text,
      marginLeft: 8,
    },
    filterContainer: {
      backgroundColor: '#FFFFFF',
      paddingHorizontal: 20,
      paddingVertical: 20,
      borderBottomWidth: 0.5,
      borderBottomColor: '#E1E8ED',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 3,
      elevation: 2,
    },
    filterHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: 16,
    },
    filterTitle: {
      fontSize: 18,
      fontWeight: '700',
      color: '#14171A',
      letterSpacing: -0.3,
    },
    clearFiltersButton: {
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 20,
      backgroundColor: '#F7F9FA',
      borderWidth: 1,
      borderColor: '#1DA1F2',
    },
    clearFiltersText: {
      fontSize: 14,
      color: '#1DA1F2',
      fontWeight: '600',
    },
    filterOptions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      marginTop: 4,
    },
    filterOption: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 10,
      borderRadius: 25,
      backgroundColor: '#F7F9FA',
      borderWidth: 1,
      borderColor: '#E1E8ED',
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 1,
      marginRight: 8,
      marginBottom: 8,
    },
    filterOptionSelected: {
      backgroundColor: '#1DA1F2',
      borderColor: '#1DA1F2',
      shadowColor: '#1DA1F2',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.2,
      shadowRadius: 4,
      elevation: 3,
    },
    filterOptionText: {
      fontSize: 14,
      fontWeight: '500',
      color: '#14171A',
      marginLeft: 8,
      marginRight: 4,
    },
    filterOptionTextSelected: {
      color: '#FFFFFF',
      fontWeight: '600',
    },
  });

  const filteredPosts = (() => {
    let filtered = posts;
    
    // Apply category filter first (if not trending)
    if (selectedCategory !== 'trending') {
      filtered = filtered.filter(post => post.category === selectedCategory);
    }
    
    // Apply selected filters (overrides category if filters are selected)
    if (selectedFilters.length > 0) {
      filtered = posts.filter(post => selectedFilters.includes(post.category));
    }
    
    // Apply search query filter
    if (searchQuery.trim()) {
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        post.content.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  })();

  const renderNewsItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.newsCard}
      onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
      activeOpacity={0.8}
    >
      {/* User Profile Header */}
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <View style={styles.avatarContainer}>
            {organizationLogos[item.author] ? (
              <Image 
                source={organizationLogos[item.author]}
                style={styles.organizationLogo}
              />
            ) : (
              <Image 
                source={{ uri: item.author_avatar || 'https://via.placeholder.com/40' }}
                style={styles.userAvatar}
              />
            )}
          </View>
          <View style={styles.userDetails}>
            <View style={styles.userNameContainer}>
              <Text style={styles.userName}>{item.author}</Text>
              <Ionicons name="checkmark-circle" size={16} color="#1DA1F2" style={styles.verifiedBadge} />
            </View>
            <Text style={styles.postTime}>Posted {formatDate(item.created_at)}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={20} color="#666" />
        </TouchableOpacity>
      </View>

      {/* Post Content */}
      <View style={styles.postContent}>
        <Text style={styles.postText} numberOfLines={4}>
          {item.content}
        </Text>
      </View>

      {/* Post Image */}
      {item.image_url && (
        <View style={styles.postImageContainer}>
          <Image 
            source={{ uri: item.image_url }}
            style={styles.postImage}
            resizeMode="cover"
          />
        </View>
      )}

      {/* Interaction Stats */}
      <View style={styles.interactionStats}>
        <View style={styles.leftStats}>
          <View style={styles.statItem}>
            <Ionicons name="eye-outline" size={16} color="#666" />
            <Text style={styles.statText}>{item.views_count || '5,674'}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="heart" size={16} color="#FF3040" />
            <Text style={styles.statText}>{item.likes_count || '215'}</Text>
          </View>
          <View style={styles.statItem}>
            <Ionicons name="chatbubble-outline" size={16} color="#1DA1F2" />
            <Text style={styles.statText}>{item.comments_count || '11'}</Text>
          </View>
        </View>
        <TouchableOpacity style={styles.saveButton}>
          <Ionicons name="bookmark-outline" size={16} color="#666" />
          <Text style={styles.saveText}>Save</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <StatusBar 
        title="Afetnet.com"
        showSearch={true}
        showFilter={true}
        showNotifications={true}
        onSearchPress={() => setIsSearchVisible(!isSearchVisible)}
        onFilterPress={() => setIsFilterVisible(!isFilterVisible)}
        onNotificationPress={() => navigation.navigate('Notifications')}
      />

      {/* Search Bar */}
      {isSearchVisible && (
        <View style={styles.searchContainer}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search-outline" size={20} color="#666666" />
            <TextInput
              style={styles.searchInput}
              placeholder="Search news..."
              placeholderTextColor="#999999"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoFocus={true}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => setSearchQuery('')}>
                <Ionicons name="close-circle" size={20} color="#666666" />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity 
            style={styles.searchCancelButton}
            onPress={() => {
              setIsSearchVisible(false);
              setSearchQuery('');
            }}
          >
          </TouchableOpacity>
        </View>
      )}

      {/* Filter Dropdown */}
      {isFilterVisible && (
        <View style={styles.filterContainer}>
          <View style={styles.filterHeader}>
            <Text style={styles.filterTitle}>Filtreler</Text>
            <TouchableOpacity 
              onPress={() => setSelectedFilters([])}
              style={styles.clearFiltersButton}
            >
              <Text style={styles.clearFiltersText}>Temizle</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.filterOptions}>
            {filterOptions.map((filter) => {
              const isSelected = selectedFilters.includes(filter.id);
              return (
                <TouchableOpacity
                  key={filter.id}
                  style={[
                    styles.filterOption,
                    isSelected && styles.filterOptionSelected
                  ]}
                  onPress={() => handleFilterToggle(filter.id)}
                >
                  <Ionicons 
                    name={filter.icon} 
                    size={20} 
                    color={isSelected ? theme.colors.onPrimary : theme.colors.text} 
                  />
                  <Text style={[
                    styles.filterOptionText,
                    isSelected && styles.filterOptionTextSelected
                  ]}>
                    {filter.name}
                  </Text>
                  {isSelected && (
                    <Ionicons 
                      name="checkmark-circle" 
                      size={20} 
                      color={theme.colors.onPrimary} 
                    />
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      )}

      {/* Categories removed for cleaner design */}

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.colors.primary} />
        </View>
      ) : filteredPosts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="document-text-outline" size={48} color={theme.colors.textTertiary} />
          <Text style={styles.emptyText}>No news available</Text>
        </View>
      ) : (
        <FlatList
          data={filteredPosts}
          renderItem={renderNewsItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.newsContainer}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={[theme.colors.primary]}
              tintColor={theme.colors.primary}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
};

export default HomeScreen;