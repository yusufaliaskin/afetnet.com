import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  Animated,
  TextInput,
  Image,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useLanguage } from '../contexts/LanguageContext';
import { useTheme } from '../contexts/ThemeContext';
import { useAuth } from '../contexts/AuthContext';
import { LinearGradient } from 'expo-linear-gradient';
// import * as ImagePicker from 'expo-image-picker'; // Temporarily commented out
import StatusBar from '../components/StatusBar';
import { supabase } from '../lib/supabase';

const ProfileScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = Dimensions.get('window');
  const { t } = useLanguage();
  const { theme } = useTheme();
  const { user, logout, updateUserProfile } = useAuth();
  
  // Animation values
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(50)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  
  const [userStats] = useState({
    totalShares: 12,
    familyMembers: 3
  });
  
  // User profile state
  const [userProfile, setUserProfile] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    location: user?.location || '',
    profileImage: user?.profileImage || null,
    isVerified: user?.isVerified || false,
    emergencyContact: user?.emergencyContact || ''
  });
  
  // Modal states
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [showEditMemberModal, setShowEditMemberModal] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  
  // Form states
  const [profileForm, setProfileForm] = useState({ 
    ...userProfile,
    age: user?.age || '',
    occupation: user?.occupation || '',
    bloodType: user?.bloodType || '',
    healthInfo: user?.healthInfo || ''
  });
  const [memberForm, setMemberForm] = useState({
    name: '',
    surname: '',
    relation: '',
    phone: '',
    emergencyContact: false
  });
  
  const startAnimations = () => {
    // Reset animation values
    fadeAnim.setValue(0);
    slideAnim.setValue(50);
    scaleAnim.setValue(0.9);
    
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }),
    ]).start();
  };
  
  useEffect(() => {
    startAnimations();
  }, [showAllMembers, theme.isDarkMode]);

  // Kullanıcı profil bilgilerini Supabase'den çek
  const loadUserProfile = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        // E-posta doğrulama durumunu kontrol et
        const emailVerified = user?.email_confirmed_at ? true : false;
        
        setUserProfile({
          firstName: data.first_name || user.firstName || '',
          lastName: data.last_name || user.lastName || '',
          email: data.email || user.email || '',
          phone: data.phone || user.phone || '',
          location: data.location || '',
          profileImage: data.avatar_url || null,
          isVerified: emailVerified,
          emergencyContact: data.phone || ''
        });
        
        setProfileForm({
          firstName: data.first_name || user.firstName || '',
          lastName: data.last_name || user.lastName || '',
          email: data.email || user.email || '',
          phone: data.phone || user.phone || '',
          location: data.location || '',
          profileImage: data.avatar_url || null,
          emergencyContact: data.phone || '',
          age: '',
          occupation: '',
          bloodType: '',
          healthInfo: ''
        });
      }
    } catch (error) {
      console.error('Kullanıcı profili yüklenirken hata:', error);
      // Hata durumunda mevcut user bilgilerini kullan
      if (user) {
        setUserProfile({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          email: user.email || '',
          phone: user.phone || '',
          location: user.location || '',
          profileImage: user.profileImage || null,
          isVerified: user.isVerified || false,
          emergencyContact: user.emergencyContact || ''
        });
      }
    }
  };

  // Kullanıcı bilgilerini güncelle
  useEffect(() => {
    loadUserProfile();
  }, [user]);

  // Aile üyelerini yükle
  const loadFamilyMembers = async () => {
    if (!user?.id) return;

    try {
      const { data, error } = await supabase
        .from('family_members')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      const formattedMembers = data.map(member => ({
        id: member.id,
        name: `${member.first_name} ${member.last_name}`,
        relation: member.relation,
        phone: member.phone,
        status: member.status || 'Bilinmiyor',
        lastSeen: member.last_seen || 'Henüz bağlanmadı',
        initial: member.first_name.charAt(0).toUpperCase(),
        statusColor: member.status === 'Güvenli' ? '#34C759' : member.status === 'Tehlikede' ? '#FF3B30' : '#FF9500',
        emergencyContact: member.emergency_contact || false
      }));

      setFamilyMembers(formattedMembers);
    } catch (error) {
      console.error('Aile üyeleri yüklenirken hata:', error);
      setFamilyMembers([]);
    }
  };

  // Kullanıcı değiştiğinde aile üyelerini yükle
  useEffect(() => {
    loadFamilyMembers();
  }, [user]);
  
  const [familyMembers, setFamilyMembers] = useState([]);
  
  const [showAllMembers, setShowAllMembers] = useState(false);
  
  // Profile image picker
  const pickImage = async () => {
    try {
      Alert.alert(
        'Profil Fotoğrafı',
        'Fotoğraf seçme özelliği yakında aktif olacak. Şu anda bu özellik geliştirme aşamasındadır.',
        [
          {
            text: 'Tamam',
            style: 'default',
          },
          {
            text: 'Bilgi Al',
            onPress: () => {
              Alert.alert(
                'Geliştirme Bilgisi',
                'Bu özellik için expo-image-picker kütüphanesi kurulması gerekiyor. Yakında eklenecek!',
                [{ text: 'Anladım', style: 'default' }]
              );
            },
          },
        ],
        { cancelable: true }
      );
    } catch (error) {
      console.error('Error in pickImage:', error);
      Alert.alert('Hata', 'Bir hata oluştu.');
    }
    /*
    // Future implementation with expo-image-picker
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('İzin Gerekli', 'Fotoğraf seçmek için galeri erişim izni gereklidir.');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });

    if (!result.canceled) {
      setProfileForm({ ...profileForm, profileImage: result.assets[0].uri });
    }
    */
  };

  // Profile management functions
  const handleEditProfile = () => {
    setProfileForm({ ...userProfile });
    setShowEditProfile(true);
  };

  const handleSaveProfile = async () => {
    if (!profileForm.firstName.trim() || !profileForm.lastName.trim()) {
      Alert.alert('Hata', 'Ad ve soyad alanları zorunludur.');
      return;
    }

    // E-posta format kontrolü
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(profileForm.email)) {
      Alert.alert('Hata', 'Geçerli bir e-posta adresi giriniz.');
      return;
    }

    // Telefon format kontrolü - daha esnek format
    if (profileForm.phone) {
      const phoneRegex = /^(\+90|0)?\s?[5-9][0-9]{2}\s?[0-9]{3}\s?[0-9]{2}\s?[0-9]{2}$/;
      const cleanPhone = profileForm.phone.replace(/\s/g, ''); // Boşlukları temizle
      
      if (!phoneRegex.test(profileForm.phone) && cleanPhone.length < 10) {
        Alert.alert('Hata', 'Geçerli bir telefon numarası giriniz. (5XX XXX XX XX veya +90 5XX XXX XX XX)');
        return;
      }
    }

    try {
      // Supabase'de profil güncelle
      const { data, error } = await supabase
        .from('users')
        .update({
          full_name: `${profileForm.firstName} ${profileForm.lastName}`.trim(),
          email: profileForm.email,
          phone: profileForm.phone,
          avatar_url: profileForm.profileImage,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        throw error;
      }

      // Local state'i güncelle
      setUserProfile({ ...profileForm });
      setShowEditProfile(false);
      Alert.alert('Başarılı', 'Profil bilgileriniz güncellendi.');
      
      // Profil bilgilerini yeniden yükle
      await loadUserProfile();
      
    } catch (error) {
      console.error('Profil güncelleme hatası:', error);
      Alert.alert('Hata', 'Profil güncellenirken bir hata oluştu.');
    }
  };

  // Family member management functions
  const handleAddMember = () => {
    setMemberForm({
      name: '',
      surname: '',
      relation: '',
      phone: '',
      emergencyContact: false
    });
    setEditingMember(null);
    setShowAddMember(true);
  };

  const handleEditMember = (member) => {
    const [firstName, ...lastNameParts] = member.name.split(' ');
    setMemberForm({
      name: firstName,
      surname: lastNameParts.join(' ') || '',
      relation: member.relation,
      phone: member.phone,
      emergencyContact: member.emergencyContact || false
    });
    setEditingMember(member);
    setShowAddMember(true);
  };

  const handleSaveMember = async () => {
    if (!memberForm.name.trim() || !memberForm.surname.trim()) {
      Alert.alert('Hata', 'Ad ve soyad alanları zorunludur.');
      return;
    }

    if (!memberForm.relation.trim()) {
      Alert.alert('Hata', 'Yakınlık derecesi zorunludur.');
      return;
    }

    if (!memberForm.phone.trim()) {
      Alert.alert('Hata', 'Telefon numarası zorunludur.');
      return;
    }

    // Telefon format kontrolü
    const phoneRegex = /^(\+90|0)?\s?[5-9][0-9]{2}\s?[0-9]{3}\s?[0-9]{2}\s?[0-9]{2}$/;
    if (!phoneRegex.test(memberForm.phone)) {
      Alert.alert('Hata', 'Geçerli bir telefon numarası giriniz. (5XX XXX XX XX)');
      return;
    }

    try {
      if (editingMember) {
        // Mevcut üyeyi güncelle
        const { error } = await supabase
          .from('family_members')
          .update({
            first_name: memberForm.name.trim(),
            last_name: memberForm.surname.trim(),
            relation: memberForm.relation.trim(),
            phone: memberForm.phone.trim(),
            emergency_contact: memberForm.emergencyContact,
            updated_at: new Date().toISOString()
          })
          .eq('id', editingMember.id);

        if (error) {
          throw error;
        }

        Alert.alert('Başarılı', 'Aile üyesi bilgileri güncellendi.');
      } else {
        // Yeni üye ekle
        const { error } = await supabase
          .from('family_members')
          .insert({
            user_id: user.id,
            first_name: memberForm.name.trim(),
            last_name: memberForm.surname.trim(),
            relation: memberForm.relation.trim(),
            phone: memberForm.phone.trim(),
            emergency_contact: memberForm.emergencyContact,
            status: 'Bilinmiyor'
          });

        if (error) {
          throw error;
        }

        Alert.alert('Başarılı', 'Yeni aile üyesi eklendi.');
      }

      // Aile üyelerini yeniden yükle
      await loadFamilyMembers();
      setShowAddMember(false);
      setEditingMember(null);
      setMemberForm({
        name: '',
        surname: '',
        relation: '',
        phone: '',
        emergencyContact: false
      });
    } catch (error) {
      console.error('Aile üyesi kaydetme hatası:', error);
      Alert.alert('Hata', 'Aile üyesi kaydedilirken bir hata oluştu.');
    }
  };

  const handleEmergencyReport = () => {
    Alert.alert(
      'Acil Durum Bildirimi',
      'Acil durum bildiriminiz yetkililere iletilecektir. Devam etmek istiyor musunuz?',
      [
        { text: 'İptal', style: 'cancel' },
        { text: 'Bildir', style: 'destructive', onPress: () => {
          Alert.alert('Başarılı', 'Acil durum bildiriminiz alındı.');
        }}
      ]
    );
  };
  
  const handleFamilyMemberPress = (member) => {
    setShowAllMembers(true);
  };
  
  const handleViewAllMembers = () => {
    setShowAllMembers(true);
  };
  
  const handleCallMember = (phone) => {
    Alert.alert('Arama', `${phone} numarası aranıyor...`);
  };
  
  const handleLocationRequest = (memberName) => {
    Alert.alert('Konum Sor', `${memberName} kişisine konum talebi gönderildi.`);
  };
  

  
  const handleDeleteMember = (memberId) => {
    const member = familyMembers.find(m => m.id === memberId);
    Alert.alert(
      'Üyeyi Sil',
      `${member?.name} adlı aile üyesini silmek istediğinizden emin misiniz?`,
      [
        { text: 'İptal', style: 'cancel' },
        { 
          text: 'Sil', 
          style: 'destructive', 
          onPress: async () => {
            try {
              const { error } = await supabase
                .from('family_members')
                .delete()
                .eq('id', memberId);

              if (error) {
                throw error;
              }

              // Aile üyelerini yeniden yükle
              await loadFamilyMembers();
              Alert.alert('Başarılı', 'Aile üyesi silindi.');
            } catch (error) {
              console.error('Aile üyesi silme hatası:', error);
              Alert.alert('Hata', 'Aile üyesi silinirken bir hata oluştu.');
            }
          }
        }
      ]
    );
  };

  const handleEmailVerification = async () => {
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: user?.email
      });

      if (error) {
        throw error;
      }

      Alert.alert(
        'Doğrulama E-postası Gönderildi',
        'E-posta adresinize doğrulama linki gönderildi. Lütfen e-postanızı kontrol edin ve doğrulama linkine tıklayın.',
        [{ text: 'Tamam' }]
      );
    } catch (error) {
      console.error('E-posta doğrulama hatası:', error);
      Alert.alert(
        'Hata',
        'Doğrulama e-postası gönderilirken bir hata oluştu. Lütfen daha sonra tekrar deneyin.',
        [{ text: 'Tamam' }]
      );
    }
  };
  
  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
      <StatusBar 
        title="Afetnet.com"
        showSearch={false}
        showNotifications={true}
        onNotificationPress={() => navigation.navigate('Notifications')}
      />
      
      <ScrollView style={[styles.scrollView, { backgroundColor: theme.colors.background }]} showsVerticalScrollIndicator={false}>
        {/* User Profile Card */}
        <Animated.View 
          style={[
            styles.modernProfileCard,
            { backgroundColor: theme.colors.cardBackground },
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }]
            }
          ]}
        >
          {/* Edit Icon Button - Top Right */}
          <TouchableOpacity 
            style={[styles.editIconButton, { backgroundColor: theme.colors.primary }]} 
            onPress={() => setShowEditProfile(true)}
          >
            <Ionicons name="create-outline" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          
          {/* Profile Content */}
          <View style={styles.profileContent}>
            {/* Profile Image */}
            <View style={styles.profileImageSection}>
              <View style={[styles.profileImageWrapper, { borderColor: theme.colors.primary }]}>
                {userProfile.profileImage ? (
                  <Image source={{ uri: userProfile.profileImage }} style={styles.profileImageLarge} />
                ) : (
                  <View style={[styles.profileImagePlaceholder, { backgroundColor: theme.colors.surface }]}>
                    <Ionicons name="person" size={50} color={theme.colors.primary} />
                  </View>
                )}
              </View>
            </View>
            
            {/* User Info */}
            <View style={styles.userInfoMain}>
              <Text style={[styles.userFullName, { color: theme.colors.text }]}>
                {userProfile.firstName} {userProfile.lastName}
              </Text>
              
              {/* User Email */}
              <Text style={[styles.userEmail, { color: theme.colors.secondaryText }]}>
                {userProfile.email || user?.email}
              </Text>
              
              {/* Verification Status */}
              <View style={[styles.verificationBadge, {
                backgroundColor: userProfile.isVerified 
                  ? 'rgba(52, 199, 89, 0.15)' 
                  : 'rgba(255, 149, 0, 0.15)'
              }]}>
                <Ionicons 
                  name={userProfile.isVerified ? "checkmark-circle" : "alert-circle"} 
                  size={16} 
                  color={userProfile.isVerified ? "#34C759" : "#FF9500"} 
                />
                <Text style={[styles.verificationText, { 
                  color: userProfile.isVerified ? "#34C759" : "#FF9500" 
                }]}>
                  {userProfile.isVerified ? 'Doğrulanmış Kullanıcı' : 'Doğrulanmamış Kullanıcı'}
                </Text>
              </View>
            </View>
          </View>
        </Animated.View>
        
        {/* Family Members Section */}
        <Animated.View 
          style={[
            styles.sectionContainer,
            { backgroundColor: theme.colors.cardBackground },
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="people" size={24} color={theme.colors.primary} style={styles.sectionIcon} />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('familyMembers')}</Text>
            </View>
            <TouchableOpacity 
              style={[styles.addButton, { backgroundColor: theme.colors.primary }]}
              onPress={handleAddMember}
            >
              <Ionicons name="add" size={20} color="#fff" />
            </TouchableOpacity>
          </View>
          
          {familyMembers.map((member) => (
            <TouchableOpacity 
               key={member.id} 
               style={[styles.familyMemberItem, { backgroundColor: theme.colors.surface, borderBottomColor: theme.colors.border }]}
               onPress={() => {
                 setEditingMember(member);
                 setShowEditMemberModal(true);
               }}
             >
              <View style={styles.memberInfo}>
                <View style={[styles.memberAvatar, { backgroundColor: theme.colors.primary }]}>
                  <Text style={styles.memberInitial}>{member.initial}</Text>
                </View>
                <View style={styles.memberDetails}>
                  <Text style={[styles.memberName, { color: theme.colors.text }]}>{member.name}</Text>
                  <Text style={[styles.memberRelation, { color: theme.colors.secondaryText }]}>{member.relation}</Text>
                  <View style={styles.memberStatusContainer}>
                    <View style={[styles.statusDot, { backgroundColor: member.statusColor }]} />
                    <Text style={[styles.statusText, { color: theme.colors.secondaryText }]}>⏰ {member.lastSeen}</Text>
                  </View>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={theme.colors.secondaryText} />
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity onPress={handleViewAllMembers} style={[styles.viewAllButton, { backgroundColor: theme.colors.surface, borderColor: theme.colors.border }]}>
            <Text style={[styles.viewAllText, { color: theme.colors.primary }]}>Tüm Aile Üyelerini Görüntüle</Text>
            <Ionicons name="chevron-forward" size={16} color={theme.colors.primary} />
          </TouchableOpacity>
        </Animated.View>
        

        

        
        <View style={styles.bottomSpacing} />
      </ScrollView>
      
      {/* Family Members Detail Modal */}
      <Modal
        visible={showAllMembers}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.modalContainer, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
          {/* Modal Header */}
          <View style={[styles.modalHeader, { backgroundColor: theme.colors.cardBackground, borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Aile Üyeleri</Text>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowAllMembers(false)}
            >
              <Ionicons name="close" size={24} color={theme.colors.secondaryText} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
            {familyMembers.map((member) => (
              <View key={member.id} style={[styles.detailedMemberCard, { backgroundColor: theme.colors.cardBackground }]}>
                <View style={styles.detailedMemberHeader}>
                  <View style={styles.detailedMemberInfo}>
                    <View style={styles.detailedMemberAvatar}>
                      <Text style={styles.detailedMemberInitial}>{member.initial}</Text>
                    </View>
                    <View style={styles.detailedMemberDetails}>
                      <Text style={[styles.detailedMemberName, { color: theme.colors.text }]}>{member.name}</Text>
                      <Text style={[styles.detailedMemberRelation, { color: theme.colors.secondaryText }]}>{member.relation}</Text>
                      <Text style={[styles.detailedMemberPhone, { color: theme.colors.primary }]}>{member.phone}</Text>
                      <Text style={[styles.detailedMemberLastSeen, { color: theme.colors.secondaryText }]}>Son görülme: {member.lastSeen}</Text>
                    </View>
                  </View>
                  <View style={styles.detailedMemberStatus}>
                    <View style={[styles.detailedStatusIndicator, { backgroundColor: member.statusColor }]} />
                    <Text style={[styles.detailedMemberStatusText, { color: member.statusColor }]}>
                      {member.status}
                    </Text>
                  </View>
                  <TouchableOpacity 
                    style={styles.detailedMemberOptions}
                    onPress={() => handleEditMember(member)}
                  >
                    <Ionicons name="create-outline" size={20} color={theme.colors.secondaryText} />
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.detailedMemberDelete}
                    onPress={() => handleDeleteMember(member.id)}
                  >
                    <Ionicons name="trash-outline" size={20} color="#FF3B30" />
                  </TouchableOpacity>
                </View>
                
                {/* Action Buttons */}
                <View style={styles.memberActionButtons}>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleCallMember(member.phone)}
                  >
                    <Ionicons name="call" size={16} color={theme.colors.primary} />
                    <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>{t('call')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleLocationRequest(member.name)}
                  >
                    <Ionicons name="location" size={16} color={theme.colors.primary} />
                    <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>{t('location')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            
            <TouchableOpacity 
              style={[styles.addMemberButton, { backgroundColor: theme.colors.cardBackground }]}
              onPress={handleAddMember}
            >
              <Ionicons name="add" size={20} color={theme.colors.primary} />
              <Text style={[styles.addMemberText, { color: theme.colors.primary }]}>{t('addMember')}</Text>
            </TouchableOpacity>
            
            <View style={styles.modalBottomSpacing} />
          </ScrollView>
        </View>
      </Modal>

      {/* Profile Edit Modal */}
      <Modal
        visible={showEditProfile}
        animationType="slide"
        presentationStyle="pageSheet"
      >
        <View style={[styles.editModalContainer, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
          <View style={[styles.editModalHeader, { backgroundColor: theme.colors.cardBackground }]}>
            <View style={styles.editModalHeaderContent}>
              <TouchableOpacity 
                style={styles.editModalCloseButton}
                onPress={() => setShowEditProfile(false)}
              >
                <Ionicons name="chevron-back" size={24} color={theme.colors.text} />
              </TouchableOpacity>
              <Text style={[styles.editModalTitle, { color: theme.colors.text }]}>Profili Düzenle</Text>
              <TouchableOpacity 
                style={[styles.editModalSaveButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleSaveProfile}
              >
                <Text style={[styles.editModalSaveText, { color: '#FFFFFF' }]}>Kaydet</Text>
              </TouchableOpacity>
            </View>
          </View>
          
          <ScrollView style={styles.editModalScrollView} showsVerticalScrollIndicator={false}>
            {/* Profile Image Section */}
            <View style={[styles.editFormSection, { backgroundColor: theme.colors.cardBackground }]}>
              <View style={styles.editProfileImageContainer}>
                <View style={styles.editProfileImageWrapper}>
                  <TouchableOpacity style={[styles.editProfileImagePicker, { borderColor: theme.colors.primary }]} onPress={pickImage}>
                    {profileForm.profileImage ? (
                      <Image source={{ uri: profileForm.profileImage }} style={styles.editProfileImagePreview} />
                    ) : (
                      <View style={[styles.editProfileImagePlaceholder, { backgroundColor: theme.colors.surface }]}>
                        <Ionicons name="person" size={50} color={theme.colors.primary} />
                      </View>
                    )}
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={[styles.editImageButton, { backgroundColor: theme.colors.primary }]}
                  >
                    <Ionicons name="camera" size={16} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity 
                  style={[styles.changePhotoButton, { backgroundColor: 'transparent', borderColor: theme.colors.primary }]}
                  onPress={pickImage}
                >
                  <Ionicons name="camera-outline" size={18} color={theme.colors.primary} />
                  <Text style={[styles.changePhotoText, { color: theme.colors.primary }]}>Fotoğraf Değiştir</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Personal Information */}
            <View style={[styles.editFormSection, { backgroundColor: theme.colors.cardBackground }]}>
              <Text style={[styles.editFormSectionTitle, { color: theme.colors.text }]}>Kişisel Bilgiler</Text>
              
              <View style={styles.editFormRow}>
                <View style={styles.editFormField}>
                  <Text style={[styles.editFormLabel, { color: theme.colors.text }]}>Ad</Text>
                  <TextInput
                    style={[styles.editFormInput, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
                    value={profileForm.firstName}
                    onChangeText={(text) => setProfileForm({ ...profileForm, firstName: text })}
                    placeholder="Adınızı giriniz"
                    placeholderTextColor={theme.colors.secondaryText}
                  />
                </View>
                <View style={styles.editFormField}>
                  <Text style={[styles.editFormLabel, { color: theme.colors.text }]}>Soyad</Text>
                  <TextInput
                    style={[styles.editFormInput, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
                    value={profileForm.lastName}
                    onChangeText={(text) => setProfileForm({ ...profileForm, lastName: text })}
                    placeholder="Soyadınızı giriniz"
                    placeholderTextColor={theme.colors.secondaryText}
                  />
                </View>
              </View>

              <View style={styles.editFormFieldFull}>
                <Text style={[styles.editFormLabel, { color: theme.colors.text }]}>E-posta</Text>
                <TextInput
                  style={[styles.editFormInput, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
                  value={profileForm.email}
                  onChangeText={(text) => setProfileForm({ ...profileForm, email: text })}
                  placeholder="E-posta adresinizi giriniz"
                  placeholderTextColor={theme.colors.secondaryText}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.editFormFieldFull}>
                <Text style={[styles.editFormLabel, { color: theme.colors.text }]}>Telefon</Text>
                <TextInput
                  style={[styles.editFormInput, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
                  value={profileForm.phone}
                  onChangeText={(text) => setProfileForm({ ...profileForm, phone: text })}
                  placeholder="+90 5XX XXX XX XX"
                  placeholderTextColor={theme.colors.secondaryText}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.editFormFieldFull}>
                <Text style={[styles.editFormLabel, { color: theme.colors.text }]}>Konum</Text>
                <TextInput
                  style={[styles.editFormInput, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
                  value={profileForm.location}
                  onChangeText={(text) => setProfileForm({ ...profileForm, location: text })}
                  placeholder="Şehir, Ülke"
                  placeholderTextColor={theme.colors.secondaryText}
                />
              </View>

            </View>

            {/* Emergency Contact Section */}
            <View style={[styles.editFormSection, { backgroundColor: theme.colors.cardBackground }]}>
              <Text style={[styles.editFormSectionTitle, { color: theme.colors.text }]}>Acil Durum İletişim</Text>
              <View style={[styles.emergencyContactContainer, { backgroundColor: theme.colors.surface, borderColor: theme.colors.primary }]}>
                <Ionicons name="call" size={20} color={theme.colors.primary} style={styles.emergencyIcon} />
                <TextInput
                  style={[styles.emergencyContactInput, { color: theme.colors.text }]}
                  value={profileForm.emergencyContact}
                  onChangeText={(text) => setProfileForm({ ...profileForm, emergencyContact: text })}
                  placeholder="Acil durum telefon numarası"
                  placeholderTextColor={theme.colors.secondaryText}
                  keyboardType="phone-pad"
                />
              </View>
              <Text style={[styles.emergencyHelpText, { color: theme.colors.secondaryText }]}>Bu numara acil durumlarda aranacaktır</Text>
            </View>

            {/* Additional Information Section */}
            <View style={[styles.editFormSection, { backgroundColor: theme.colors.cardBackground }]}>
              <Text style={[styles.editFormSectionTitle, { color: theme.colors.text }]}>Ek Bilgiler</Text>
              
              <View style={styles.editFormFieldFull}>
                <Text style={[styles.editFormLabel, { color: theme.colors.text }]}>Yaş</Text>
                <TextInput
                  style={[styles.editFormInput, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
                  value={profileForm.age}
                  onChangeText={(text) => setProfileForm({ ...profileForm, age: text })}
                  placeholder="Yaşınızı giriniz"
                  placeholderTextColor={theme.colors.secondaryText}
                  keyboardType="numeric"
                />
              </View>

              <View style={styles.formFieldFull}>
                <Text style={[styles.formLabel, { color: theme.colors.text }]}>{t('occupation')}</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
                  value={profileForm.occupation}
                  onChangeText={(text) => setProfileForm({ ...profileForm, occupation: text })}
                  placeholder="Mesleğinizi giriniz"
                  placeholderTextColor={theme.colors.secondaryText}
                />
              </View>

              <View style={styles.formFieldFull}>
                <Text style={[styles.formLabel, { color: theme.colors.text }]}>{t('bloodType')}</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
                  value={profileForm.bloodType}
                  onChangeText={(text) => setProfileForm({ ...profileForm, bloodType: text })}
                  placeholder="Kan grubunuzu giriniz (örn: A+)"
                  placeholderTextColor={theme.colors.secondaryText}
                />
              </View>

              <View style={styles.formFieldFull}>
                <Text style={[styles.formLabel, { color: theme.colors.text }]}>{t('healthInfo')}</Text>
                <TextInput
                  style={[styles.formTextArea, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
                  value={profileForm.healthInfo}
                  onChangeText={(text) => setProfileForm({ ...profileForm, healthInfo: text })}
                  placeholder="Önemli sağlık bilgileri, alerjiler vb."
                  placeholderTextColor={theme.colors.secondaryText}
                  multiline
                  numberOfLines={3}
                />
              </View>
            </View>

            {/* Save Button */}
            <View style={styles.formActions}>
              <TouchableOpacity 
                style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleSaveProfile}
              >
                <Text style={[styles.saveButtonText, { color: theme.colors.onPrimary }]}>{t('saveProfile')}</Text>
              </TouchableOpacity>
            </View>
            
            <View style={styles.modalBottomSpacing} />
           </ScrollView>
         </View>
       </Modal>

       {/* Add/Edit Member Modal */}
       <Modal
         visible={showAddMember || editingMember !== null}
         animationType="slide"
         presentationStyle="pageSheet"
       >
         <View style={[styles.modalContainer, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
           <View style={[styles.modalHeader, { backgroundColor: theme.colors.cardBackground, borderBottomColor: theme.colors.border }]}>
             <Text style={[styles.modalTitle, { color: theme.colors.text }]}>
               {editingMember ? t('editMember') : t('addMember')}
             </Text>
             <TouchableOpacity 
               style={styles.modalCloseButton}
               onPress={() => {
                 setShowAddMember(false);
                 setEditingMember(null);
                 setMemberForm({ name: '', surname: '', relation: '', phone: '', emergencyContact: false });
               }}
             >
               <Ionicons name="close" size={24} color={theme.colors.secondaryText} />
             </TouchableOpacity>
           </View>
           
           <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
             <View style={[styles.formSection, { backgroundColor: theme.colors.cardBackground }]}>
               <Text style={[styles.formSectionTitle, { color: theme.colors.text }]}>Aile Üyesi Bilgileri</Text>
               
               <View style={styles.formRow}>
                 <View style={styles.formField}>
                   <Text style={[styles.formLabel, { color: theme.colors.text }]}>Ad</Text>
                   <TextInput
                     style={[styles.formInput, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
                     value={memberForm.name}
                     onChangeText={(text) => setMemberForm({ ...memberForm, name: text })}
                     placeholder="Ad"
                     placeholderTextColor={theme.colors.secondaryText}
                   />
                 </View>
                 <View style={styles.formField}>
                   <Text style={[styles.formLabel, { color: theme.colors.text }]}>Soyad</Text>
                   <TextInput
                     style={[styles.formInput, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
                     value={memberForm.surname}
                     onChangeText={(text) => setMemberForm({ ...memberForm, surname: text })}
                     placeholder="Soyad"
                     placeholderTextColor={theme.colors.secondaryText}
                   />
                 </View>
               </View>

               <View style={styles.formFieldFull}>
                 <Text style={[styles.formLabel, { color: theme.colors.text }]}>Telefon Numarası</Text>
                 <TextInput
                   style={[styles.formInput, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
                   value={memberForm.phone}
                   onChangeText={(text) => setMemberForm({ ...memberForm, phone: text })}
                   placeholder="+90 5XX XXX XX XX"
                   placeholderTextColor={theme.colors.secondaryText}
                   keyboardType="phone-pad"
                 />
               </View>

               <View style={styles.formFieldFull}>
                 <Text style={[styles.formLabel, { color: theme.colors.text }]}>Yakınlık Derecesi</Text>
                 <View style={styles.relationshipButtons}>
                   {['Eş', 'Çocuk', 'Anne', 'Baba', 'Kardeş', 'Diğer'].map((relation) => (
                     <TouchableOpacity
                       key={relation}
                       style={[
                         styles.relationshipButton,
                         {
                           backgroundColor: memberForm.relation === relation 
                             ? theme.colors.primary 
                             : theme.colors.surface,
                           borderColor: theme.colors.border
                         }
                       ]}
                       onPress={() => setMemberForm({ ...memberForm, relation: relation })}
                     >
                       <Text style={[
                         styles.relationshipButtonText,
                         {
                           color: memberForm.relation === relation 
                             ? theme.colors.onPrimary 
                             : theme.colors.text
                         }
                       ]}>
                         {relation}
                       </Text>
                     </TouchableOpacity>
                   ))}
                 </View>
               </View>
             </View>

             {/* Save Button */}
             <View style={styles.formActions}>
               <TouchableOpacity 
                 style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
                 onPress={handleSaveMember}
               >
                 <Text style={[styles.saveButtonText, { color: theme.colors.onPrimary }]}>
                   {editingMember ? 'Güncelle' : 'Ekle'}
                 </Text>
               </TouchableOpacity>
             </View>
             
             <View style={styles.modalBottomSpacing} />
           </ScrollView>
         </View>
       </Modal>
     </View>
   );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  scrollView: {
    flex: 1,
    paddingTop: 8,
  },
  modernProfileCard: {
    position: 'relative',
    borderRadius: 28,
    marginHorizontal: 20,
    marginBottom: 24,
    padding: 32,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 0,
    backgroundColor: '#FFFFFF',
    minHeight: 320,
  },
  editIconButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 1,
  },
  profileContent: {
    alignItems: 'center',
  },
  profileImageSection: {
    alignItems: 'center',
    marginBottom: 24,
  },
  userInfoMain: {
    alignItems: 'center',
    width: '100%',
  },
  profileImageButton: {
    position: 'relative',
    marginRight: 16,
  },
  profileImageWrapper: {
    width: 120,
    height: 120,
    borderRadius: 60,
    borderWidth: 4,
    borderColor: 'rgba(0, 122, 255, 0.3)',
    overflow: 'hidden',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
    backgroundColor: '#FAFBFC',
  },
  profileImageLarge: {
    width: '100%',
    height: '100%',
  },
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 122, 255, 0.05)',
  },
  addPhotoText: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 4,
    textAlign: 'center',
  },

  userInfoSection: {
    flex: 1,
  },
  userFullName: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 8,
    marginTop: 0,
    letterSpacing: 0.5,
    textAlign: 'center',
    lineHeight: 34,
  },
  userEmail: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
    textAlign: 'center',
    opacity: 0.8,
    letterSpacing: 0.2,
  },
  verificationBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 24,
  },
  verificationText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
    letterSpacing: 0.2,
  },


  profileDetails: {
    marginTop: 0,
    paddingTop: 0,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 12,
  },
  detailItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FAFBFC',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.03)',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.02,
    shadowRadius: 4,
    elevation: 1,
    minHeight: 64,
  },
  detailContent: {
    flex: 1,
    marginLeft: 12,
  },
  detailLabel: {
    fontSize: 12,
    fontWeight: '600',
    marginBottom: 4,
    opacity: 0.6,
    letterSpacing: 0.2,
    textTransform: 'uppercase',
  },
  detailValue: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 18,
    letterSpacing: 0.1,
  },
  avatarContainer: {
    alignItems: 'center',
    marginBottom: 12,
    paddingTop: 0,
  },
  profileImageContainer: {
    position: 'relative',
    marginBottom: 12,
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 0,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    borderWidth: 3,
    borderColor: 'rgba(255, 255, 255, 0.8)',
  },
  onlineIndicator: {
    position: 'absolute',
    bottom: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#4CAF50',
    borderWidth: 3,
    borderColor: '#fff',
  },
  statusBadge: {
    backgroundColor: '#34C759',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  editButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    padding: 8,
    borderRadius: 8,
    backgroundColor: '#F2F2F7',
  },
  userName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 0.3,
    marginTop: 8,
  },
  userLocation: {
    fontSize: 14,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 16,
    opacity: 0.9,
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 10,
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statIconContainer: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 10,
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
    opacity: 0.9,
    textAlign: 'center',
  },
  sectionContainer: {
    marginHorizontal: 16,
    marginTop: 20,
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.12,
    shadowRadius: 20,
    elevation: 12,
    borderWidth: 0,
    backgroundColor: '#FFFFFF',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionIcon: {
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: 0.5,
    color: '#000000',
    marginLeft: 8,
  },
  addButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#FFA500',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#FFA500',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  addButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  familyMemberItem: {
     flexDirection: 'row',
     alignItems: 'center',
     paddingVertical: 18,
     paddingHorizontal: 20,
     marginVertical: 6,
     borderRadius: 20,
     elevation: 3,
     shadowColor: '#000',
     shadowOffset: { width: 0, height: 2 },
     shadowOpacity: 0.08,
     shadowRadius: 6,
     borderWidth: 1,
     borderColor: '#E9ECEF',
     backgroundColor: '#F8F9FA',
   },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberAvatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#FFA500',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 18,
    elevation: 4,
    shadowColor: '#FFA500',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  memberInitial: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 6,
    letterSpacing: 0.3,
  },
  memberRelation: {
    fontSize: 14,
    marginBottom: 6,
  },
  memberStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  memberStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 12,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  memberStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  memberOptions: {
    padding: 4,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    marginTop: 12,
    borderRadius: 16,
    borderWidth: 1.5,
    marginHorizontal: 6,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  viewAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  safetyContainer: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  safetyHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  safetyIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E8F5E8',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  safetyInfo: {
    flex: 1,
  },
  safetyTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#34C759',
    marginBottom: 2,
  },
  safetySubtitle: {
    fontSize: 12,
    color: '#8E8E93',
  },
  emergencyButton: {
    marginHorizontal: 16,
    marginTop: 16,
    borderRadius: 16,
    padding: 18,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: {
      width: 0,
      height: 3,
    },
    shadowOpacity: 0.25,
     shadowRadius: 10,
     elevation: 6,
  },
  emergencyIconContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  emergencyTextContainer: {
    flex: 1,
    marginLeft: 15,
  },
  emergencyButtonText: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  emergencySubtext: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 14,
    fontWeight: '500',
  },
  bottomSpacing: {
    height: 100,
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    margin: 20,
    borderRadius: 28,
    padding: 28,
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    backgroundColor: '#FFFFFF',
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 24,
    borderBottomWidth: 0,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: '700',
    letterSpacing: 0.2,
    color: '#000000',
  },
  modalCloseButton: {
    padding: 4,
  },
  modalScrollView: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  
  // Detailed Member Card Styles
  detailedMemberCard: {
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  detailedMemberHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  detailedMemberInfo: {
    flexDirection: 'row',
    flex: 1,
  },
  detailedMemberAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  detailedMemberInitial: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  detailedMemberDetails: {
    flex: 1,
  },
  detailedMemberName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  detailedMemberRelation: {
    fontSize: 14,
    marginBottom: 2,
  },
  detailedMemberPhone: {
    fontSize: 14,
    marginBottom: 4,
  },
  detailedMemberLastSeen: {
    fontSize: 12,
  },
  detailedMemberStatus: {
    alignItems: 'center',
    marginRight: 8,
  },
  detailedStatusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  detailedMemberStatusText: {
    fontSize: 12,
    fontWeight: '500',
  },
  detailedMemberOptions: {
    padding: 8,
    marginRight: 4,
  },
  detailedMemberDelete: {
    padding: 8,
  },
  
  // Action Buttons
  memberActionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F2F2F7',
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 16,
    backgroundColor: '#F2F2F7',
    borderRadius: 8,
    flex: 0.45,
    justifyContent: 'center',
  },
  actionButtonText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
    marginLeft: 6,
  },
  
  // Add Member Button
  addMemberButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
    padding: 16,
    marginTop: 8,
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#007AFF',
    borderStyle: 'dashed',
  },
  addMemberText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '500',
    marginLeft: 8,
  },
  modalBottomSpacing: {
    height: 20,
  },
  
  // Form Styles
  formSection: {
    marginHorizontal: 20,
    marginVertical: 8,
    borderRadius: 24,
    padding: 28,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 16,
    elevation: 4,
    backgroundColor: '#FFFFFF',
  },
  
  formSectionTitle: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 24,
    letterSpacing: 0.1,
    color: '#000000',
  },
  
  formRow: {
    flexDirection: 'row',
    gap: 12,
  },
  
  formField: {
    flex: 1,
  },
  
  formFieldFull: {
    marginBottom: 16,
  },
  
  formLabel: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 10,
    color: '#333333',
    letterSpacing: 0.2,
  },
  
  formInput: {
    borderWidth: 0,
    borderRadius: 20,
    padding: 20,
    fontSize: 16,
    minHeight: 60,
    backgroundColor: '#F8F9FA',
    fontWeight: '500',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  
  // Profile Image Styles
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  
  profileImagePicker: {
    width: 120,
    height: 120,
    borderRadius: 60,
    overflow: 'hidden',
  },
  
  profileImagePreview: {
    width: '100%',
    height: '100%',
  },
  
  profileImagePlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f0f0f0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  
  profileImageText: {
    fontSize: 12,
    marginTop: 4,
  },

  // Edit Profile Image Styles
  editProfileImageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },

  editProfileImagePicker: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    overflow: 'hidden',
    marginBottom: 12,
  },

  editProfileImagePreview: {
    width: '100%',
    height: '100%',
  },

  editProfileImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 47,
  },

  editProfileImageText: {
    fontSize: 12,
    fontWeight: '500',
    marginTop: 4,
  },

  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },

  changePhotoText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
  },

  // Emergency Contact Styles
  emergencyContactContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 0,
    borderRadius: 20,
    paddingHorizontal: 20,
    paddingVertical: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },

  emergencyIcon: {
    marginRight: 12,
  },

  emergencyContactInput: {
    flex: 1,
    fontSize: 16,
    paddingVertical: 16,
    fontWeight: '500',
  },

  emergencyHelpText: {
    fontSize: 12,
    fontStyle: 'italic',
    marginTop: 4,
  },

  // Form Text Area
  formTextArea: {
    borderWidth: 0,
    borderRadius: 20,
    padding: 20,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    fontWeight: '500',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  
  // Relationship Buttons
  relationshipButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  
  relationshipButton: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    borderWidth: 1.5,
    marginBottom: 8,
  },
  
  relationshipButtonText: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  
  // Form Actions
  // Edit Modal Styles
  editModalContainer: {
    flex: 1,
  },

  editModalHeader: {
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },

  editModalHeaderContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 44,
  },

  editModalCloseButton: {
    padding: 8,
    borderRadius: 20,
    minWidth: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },

  editModalTitle: {
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.2,
  },

  editModalSaveButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    minWidth: 70,
    alignItems: 'center',
    justifyContent: 'center',
  },

  editModalSaveText: {
    fontSize: 16,
    fontWeight: '600',
  },

  editModalScrollView: {
    flex: 1,
    paddingBottom: 20,
  },

  modalBottomSpacing: {
    height: 40,
  },
  
  editFormSection: {
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },

  editFormSectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 16,
    letterSpacing: 0.1,
  },

  editFormRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },

  editFormField: {
    flex: 1,
  },

  editFormFieldFull: {
    marginBottom: 16,
  },

  editFormLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
    letterSpacing: 0.1,
  },

  editFormInput: {
    borderWidth: 1,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    fontWeight: '500',
    minHeight: 52,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.03,
    shadowRadius: 2,
    elevation: 1,
  },
  
  editProfileImageWrapper: {
    alignItems: 'center',
    marginBottom: 16,
  },

  editProfileImageContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },

  editProfileImagePicker: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 3,
    overflow: 'hidden',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 6,
  },

  editProfileImagePreview: {
    width: '100%',
    height: '100%',
  },

  editProfileImagePlaceholder: {
    width: '100%',
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 47,
  },

  editImageButton: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },

  editImageButtonText: {
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 8,
  },

  changePhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },

  changePhotoText: {
    fontSize: 14,
    fontWeight: '500',
  },

  formActions: {
    marginHorizontal: 16,
    marginVertical: 20,
    marginBottom: 40,
  },

  saveButton: {
    borderRadius: 16,
    paddingVertical: 16,
    paddingHorizontal: 24,
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 52,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },

  saveButtonText: {
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 18,
    paddingHorizontal: 24,
    marginTop: 16,
    borderRadius: 20,
    borderWidth: 1.5,
    borderColor: '#FFA500',
    backgroundColor: '#FFF8F0',
    shadowColor: '#FFA500',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  viewAllText: {
    fontSize: 17,
    fontWeight: '700',
    color: '#FFA500',
    letterSpacing: 0.2,
  },
  memberDetails: {
    flex: 1,
    marginLeft: 12,
  },
  memberName: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  memberRelation: {
    fontSize: 14,
    marginBottom: 6,
  },
  memberStatusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  memberInitial: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  authButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  authButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
  },
});

export default ProfileScreen;