import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';

const HomeScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = Dimensions.get('window');
  const { theme } = useTheme();
  const { t, language } = useLanguage();
  

  
  // Feed data with disaster-related content
  const [feedData] = useState([
    {
      id: 1,
      user: {
        name: language === 'tr' ? 'AFAD Türkiye' : 'AFAD Turkey',
        username: '@afadturkiye',
        avatar: require('../../assets/logo.png'),
        verified: true
      },
      content: {
        text: language === 'tr' 
          ? 'Deprem konusunda yapay zekanın sağlık alanındaki etik sonuçları nelerdir?' 
          : 'What are the ethical implications of AI in earthquake healthcare?',
        description: language === 'tr'
          ? 'Yapay zeka (AI), 21. yüzyılın en dönüştürücü teknolojilerinden biri haline geldi...'
          : 'Artificial Intelligence (AI) has become one of the most transformative technologies of the 21st century...',
        image: require('../../assets/yapayzeka.jpeg'),
        date: language === 'tr' ? 'Çarşamba, 1 Ocak 2025' : 'Wednesday, January 1, 2025'
      },
      stats: {
        likes: 730,
        views: '2.1k',
        comments: 875
      }
    },
    {
      id: 2,
      user: {
        name: language === 'tr' ? 'Meteoroloji G.M' : 'Turkish State Meteorological Service',
        username: '@meteoroloji',
        avatar: require('../../assets/mgm.jpg'),
        verified: true
      },
      content: {
        text: language === 'tr' 
          ? 'Sel felaketlerinde yapay zekanın sağlık alanındaki etik sonuçları nelerdir?' 
          : 'What are the ethical implications of AI in flood healthcare?',
        description: language === 'tr'
          ? 'Yapay zeka (AI), 21. yüzyılın en dönüştürücü teknolojilerinden biri haline geldi...'
          : 'Artificial Intelligence (AI) has become one of the most transformative technologies of the 21st century...',
        image: require('../../assets/meto.jpg'),
        date: language === 'tr' ? 'Çarşamba, 1 Ocak 2025' : 'Wednesday, January 1, 2025'
      },
      stats: {
        likes: 730,
        views: '2.1k',
        comments: 876
      }
    },
    {
      id: 3,
      user: {
        name: language === 'tr' ? 'Orman Genel Müdürlüğü' : 'General Directorate of Forestry',
        username: '@ormangenel',
        avatar: 'https://via.placeholder.com/50x50/FF3B30/FFFFFF?text=OGM',
        verified: true
      },
      content: {
        text: language === 'tr' 
          ? 'Orman yangınlarında yapay zekanın sağlık alanındaki etik sonuçları nelerdir?' 
          : 'What are the ethical implications of AI in wildfire healthcare?',
        description: language === 'tr'
          ? 'Yapay zeka (AI), 21. yüzyılın en dönüştürücü teknolojilerinden biri haline geldi...'
          : 'Artificial Intelligence (AI) has become one of the most transformative technologies of the 21st century...',
        image: 'https://via.placeholder.com/400x200/FF3B30/FFFFFF?text=Yangın+AI',
        date: language === 'tr' ? 'Çarşamba, 1 Ocak 2025' : 'Wednesday, January 1, 2025'
      },
      stats: {
        likes: 730,
        views: '2.1k',
        comments: 876
      }
    },
    {
      id: 4,
      user: {
        name: language === 'tr' ? 'Jeoloji Mühendisleri Odası' : 'Chamber of Geological Engineers',
        username: '@jmo_turkiye',
        avatar: 'https://via.placeholder.com/50x50/8B4513/FFFFFF?text=JMO',
        verified: true
      },
      content: {
        text: language === 'tr' 
          ? 'Heyelan risklerinde yapay zekanın sağlık alanındaki etik sonuçları nelerdir?' 
          : 'What are the ethical implications of AI in landslide healthcare?',
        description: language === 'tr'
          ? 'Yapay zeka (AI), 21. yüzyılın en dönüştürücü teknolojilerinden biri haline geldi...'
          : 'Artificial Intelligence (AI) has become one of the most transformative technologies of the 21st century...',
        image: 'https://via.placeholder.com/400x200/8B4513/FFFFFF?text=Heyelan+AI',
        date: language === 'tr' ? 'Çarşamba, 1 Ocak 2025' : 'Wednesday, January 1, 2025'
      },
      stats: {
        likes: 730,
        views: '2.1k',
        comments: 876
      }
    }
  ]);
  

  
  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.colors.background,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingVertical: 12,
      backgroundColor: theme.colors.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: theme.colors.text,
    },
    headerIcons: {
      flexDirection: 'row',
      alignItems: 'center',
    },
    headerIcon: {
      marginLeft: 16,
      padding: 4,
    },

    scrollView: {
      flex: 1,
    },
    feedItem: {
      backgroundColor: theme.colors.background,
      borderBottomWidth: 1,
      borderBottomColor: theme.colors.border,
      paddingVertical: 16,
    },
    userHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      marginBottom: 12,
    },
    avatar: {
      width: 40,
      height: 40,
      borderRadius: 20,
      marginRight: 12,
    },
    userInfo: {
      flex: 1,
    },
    userName: {
      fontSize: 16,
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
    followButton: {
      backgroundColor: theme.colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 6,
      borderRadius: 16,
    },
    followButtonText: {
      color: '#FFFFFF',
      fontSize: 14,
      fontWeight: '500',
    },
    moreButton: {
      padding: 8,
      marginLeft: 8,
    },
    contentContainer: {
      paddingHorizontal: 16,
    },
    contentDate: {
      fontSize: 12,
      color: theme.colors.secondaryText,
      marginBottom: 8,
    },
    contentTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.colors.text,
      lineHeight: 22,
      marginBottom: 8,
    },
    contentDescription: {
      fontSize: 14,
      color: theme.colors.secondaryText,
      lineHeight: 20,
      marginBottom: 12,
    },
    contentImage: {
      width: '100%',
      height: 200,
      borderRadius: 12,
      backgroundColor: '#E0E0E0',
      marginBottom: 12,
    },
    statsContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: 16,
      paddingTop: 8,
    },
    statItem: {
      flexDirection: 'row',
      alignItems: 'center',
      marginRight: 24,
    },
    statText: {
      fontSize: 14,
      color: theme.colors.secondaryText,
      marginLeft: 4,
    },

  });

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>      
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {language === 'tr' ? 'afetnet.com' : 'afetnet.com'}
        </Text>
        <View style={styles.headerIcons}>
          <TouchableOpacity 
            style={styles.headerIcon}
            onPress={() => navigation.navigate('Notifications')}
          >
            <Ionicons name="notifications-outline" size={24} color={theme.colors.text} />
          </TouchableOpacity>
        </View>
      </View>





      {/* Feed */}
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        {feedData.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            style={styles.feedItem}
            onPress={() => navigation.navigate('PostDetail', { post: item })}
            activeOpacity={0.95}
          >
            {/* User Header */}
            <View style={styles.userHeader}>
              <Image 
                source={typeof item.user.avatar === 'string' ? { uri: item.user.avatar } : item.user.avatar}
                style={styles.avatar}
                resizeMode="cover"
              />
              <View style={styles.userInfo}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.userName}>{item.user.name}</Text>
                  {item.user.verified && (
                    <Ionicons 
                      name="checkmark-circle" 
                      size={16} 
                      color={theme.colors.primary} 
                      style={styles.verifiedIcon}
                    />
                  )}
                </View>
                <Text style={styles.userHandle}>{item.user.username}</Text>
              </View>
              <TouchableOpacity style={styles.followButton}>
                <Text style={styles.followButtonText}>
                  {language === 'tr' ? 'Takip Et' : 'Follow'}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.moreButton}>
                <Ionicons name="ellipsis-horizontal" size={20} color={theme.colors.secondaryText} />
              </TouchableOpacity>
            </View>

            {/* Content */}
            <View style={styles.contentContainer}>
              <Text style={styles.contentDate}>{item.content.date}</Text>
              <Text style={styles.contentTitle}>{item.content.text}</Text>
              <Text style={styles.contentDescription}>{item.content.description}</Text>
              
              <Image 
                source={typeof item.content.image === 'string' ? { uri: item.content.image } : item.content.image}
                style={styles.contentImage}
                resizeMode="cover"
              />
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <TouchableOpacity style={styles.statItem}>
                <Ionicons name="heart-outline" size={20} color={theme.colors.secondaryText} />
                <Text style={styles.statText}>{item.stats.likes}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.statItem}>
                <Ionicons name="eye-outline" size={20} color={theme.colors.secondaryText} />
                <Text style={styles.statText}>{item.stats.views}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.statItem}>
                <Ionicons name="chatbubble-outline" size={20} color={theme.colors.secondaryText} />
                <Text style={styles.statText}>{item.stats.comments}</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        ))}
        
        {/* Bottom spacing */}
        <View style={{ height: 100 }} />
      </ScrollView>
    </View>
  );
};

export default HomeScreen;