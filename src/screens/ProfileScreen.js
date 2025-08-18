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
import { LinearGradient } from 'expo-linear-gradient';
// import * as ImagePicker from 'expo-image-picker'; // Temporarily commented out
import Header from '../components/Header';

const ProfileScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const { width: screenWidth } = Dimensions.get('window');
  const { t } = useLanguage();
  const { theme } = useTheme();
  
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
    firstName: 'Yusuf Ali',
    lastName: 'Aşkın',
    email: 'yusuf.ali@example.com',
    phone: '+90 532 123 45 67',
    location: 'İstanbul, Türkiye',
    profileImage: null,
    isVerified: true,
    emergencyContact: '+90 532 987 65 43'
  });
  
  // Modal states
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [showAddMember, setShowAddMember] = useState(false);
  const [editingMember, setEditingMember] = useState(null);
  
  // Form states
  const [profileForm, setProfileForm] = useState({ ...userProfile });
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
  
  const [familyMembers, setFamilyMembers] = useState([
    {
      id: 1,
      name: 'Emine Aşkın',
      relation: 'Eş',
      phone: '+90 532 111 22 33',
      status: 'Güvenli',
      lastSeen: '2 dakika önce',
      initial: 'E',
      statusColor: '#34C759',
      emergencyContact: true
    },
    {
      id: 2,
      name: 'Ali Aşkın',
      relation: 'Oğul',
      phone: '+90 533 444 55 66',
      status: 'Güvenli',
      lastSeen: '5 dakika önce',
      initial: 'A',
      statusColor: '#34C759',
      emergencyContact: false
    },
    {
      id: 3,
      name: 'Fatma Aşkın',
      relation: 'Kız',
      phone: '+90 534 777 88 99',
      status: 'Bilinmiyor',
      lastSeen: '1 saat önce',
      initial: 'F',
      statusColor: '#FF9500',
      emergencyContact: false
    }
  ]);
  
  const [showAllMembers, setShowAllMembers] = useState(false);
  
  // Profile image picker
  const pickImage = async () => {
    // Temporarily disabled - expo-image-picker not installed
    Alert.alert('Bilgi', 'Fotoğraf seçme özelliği geçici olarak devre dışı.');
    /*
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

  const handleSaveProfile = () => {
    if (!profileForm.firstName.trim() || !profileForm.lastName.trim()) {
      Alert.alert('Hata', 'Ad ve soyad alanları zorunludur.');
      return;
    }
    
    setUserProfile({ ...profileForm });
    setShowEditProfile(false);
    Alert.alert('Başarılı', 'Profil bilgileriniz güncellendi.');
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
    setMemberForm({
      name: member.name,
      surname: member.surname || '',
      relation: member.relation,
      phone: member.phone,
      emergencyContact: member.emergencyContact || false
    });
    setEditingMember(member);
    setShowAddMember(true);
  };

  const handleSaveMember = () => {
    if (!memberForm.name.trim() || !memberForm.surname.trim() || !memberForm.relation.trim() || !memberForm.phone.trim()) {
      Alert.alert('Hata', 'Tüm alanlar zorunludur.');
      return;
    }

    const phoneRegex = /^\+90\s?[0-9]{3}\s?[0-9]{3}\s?[0-9]{2}\s?[0-9]{2}$/;
    if (!phoneRegex.test(memberForm.phone)) {
      Alert.alert('Hata', 'Geçerli bir telefon numarası giriniz. (+90 5XX XXX XX XX)');
      return;
    }

    if (editingMember) {
      // Update existing member
      setFamilyMembers(prev => prev.map(member => 
        member.id === editingMember.id 
          ? {
              ...member,
              name: memberForm.name,
              surname: memberForm.surname,
              relation: memberForm.relation,
              phone: memberForm.phone,
              emergencyContact: memberForm.emergencyContact,
              initial: memberForm.name.charAt(0).toUpperCase()
            }
          : member
      ));
      Alert.alert('Başarılı', 'Aile üyesi bilgileri güncellendi.');
    } else {
      // Add new member
      const newMember = {
        id: Date.now(),
        name: memberForm.name,
        surname: memberForm.surname,
        relation: memberForm.relation,
        phone: memberForm.phone,
        status: 'Bilinmiyor',
        lastSeen: 'Henüz bağlanmadı',
        initial: memberForm.name.charAt(0).toUpperCase(),
        statusColor: '#8E8E93',
        emergencyContact: memberForm.emergencyContact
      };
      setFamilyMembers(prev => [...prev, newMember]);
      Alert.alert('Başarılı', 'Yeni aile üyesi eklendi.');
    }
    
    setShowAddMember(false);
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
          onPress: () => {
            setFamilyMembers(prev => prev.filter(member => member.id !== memberId));
            Alert.alert('Başarılı', 'Aile üyesi silindi.');
          }
        }
      ]
    );
  };
  
  return (
    <View style={[styles.container, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
      {/* Header */}
      <View style={[styles.header, { backgroundColor: theme.colors.background, borderBottomColor: theme.colors.border }]}>
        <Text style={[styles.headerTitle, { color: theme.colors.text }]}>
          afetnet.com
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
      
      <ScrollView style={[styles.scrollView, { backgroundColor: theme.colors.background }]} showsVerticalScrollIndicator={false}>
        {/* User Profile Card */}
        <Animated.View 
          style={[
            styles.profileCard,
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }, { scale: scaleAnim }]
            }
          ]}
        >
          <LinearGradient
            colors={['#667eea', '#764ba2']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.gradientBackground}
          >
          <View style={styles.centeredProfileContent}>
            <View style={styles.avatarContainer}>
              <TouchableOpacity style={styles.avatar} onPress={handleEditProfile}>
                {userProfile.profileImage ? (
                  <Image source={{ uri: userProfile.profileImage }} style={styles.profileImage} />
                ) : (
                  <Ionicons name="person" size={32} color="#007AFF" />
                )}
              </TouchableOpacity>
              <View style={[styles.statusBadge, { backgroundColor: userProfile.isVerified ? '#34C759' : '#FF9500' }]}>
                <Text style={styles.statusText}>{userProfile.isVerified ? 'Doğrulanmış' : 'Doğrulanmamış'}</Text>
              </View>
            </View>
            
            <Text style={[styles.userName, { color: '#FFFFFF' }]}>{userProfile.firstName} {userProfile.lastName}</Text>
            <Text style={[styles.userLocation, { color: '#E8E8E8' }]}>📍 {userProfile.location}</Text>
            
            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: '#FFFFFF' }]}>{userStats.totalShares}</Text>
                <Text style={[styles.statLabel, { color: '#E8E8E8' }]}>{t('totalShares')}</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={[styles.statNumber, { color: '#FFFFFF' }]}>{userStats.familyMembers}</Text>
                <Text style={[styles.statLabel, { color: '#E8E8E8' }]}>{t('familyMembers')}</Text>
              </View>
            </View>
          </View>
          
          <TouchableOpacity style={styles.editButton} onPress={handleEditProfile}>
            <Ionicons name="create-outline" size={20} color="#007AFF" />
          </TouchableOpacity>
          </LinearGradient>
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
              <Ionicons name="people" size={20} color={theme.colors.text} />
              <Text style={[styles.sectionTitle, { color: theme.colors.text }]}>{t('familyMembers')}</Text>
            </View>
            <TouchableOpacity onPress={handleAddMember} style={[styles.addButton, { backgroundColor: theme.colors.primary }]}>
              <Text style={[styles.addButtonText, { color: theme.colors.onPrimary }]}>Üye Ekle</Text>
            </TouchableOpacity>
          </View>
          
          {familyMembers.map((member) => (
            <TouchableOpacity 
              key={member.id} 
              style={[styles.familyMemberItem, { borderBottomColor: theme.colors.border }]}
              onPress={() => handleFamilyMemberPress(member)}
            >
              <View style={styles.memberInfo}>
                <View style={[styles.memberAvatar, { backgroundColor: theme.colors.surface }]}>
                  <Text style={[styles.memberInitial, { color: theme.colors.primary }]}>{member.initial}</Text>
                </View>
                <View style={styles.memberDetails}>
                  <Text style={[styles.memberName, { color: theme.colors.text }]}>{member.name}</Text>
                  <Text style={[styles.memberLastSeen, { color: theme.colors.secondaryText }]}>⏰ {member.lastSeen}</Text>
                </View>
              </View>
              <View style={styles.memberStatus}>
                <View style={[styles.statusIndicator, { backgroundColor: member.statusColor }]} />
                <Text style={[styles.memberStatusText, { color: member.statusColor }]}>
                  {member.status}
                </Text>
              </View>
              <TouchableOpacity style={styles.memberOptions}>
                <Ionicons name="ellipsis-horizontal" size={16} color={theme.colors.secondaryText} />
              </TouchableOpacity>
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity onPress={handleViewAllMembers} style={[styles.viewAllButton, { backgroundColor: theme.colors.surface }]}>
            <Text style={[styles.viewAllText, { color: theme.colors.primary }]}>Tüm Aile Üyelerini Görüntüle</Text>
          </TouchableOpacity>
        </Animated.View>
        
        {/* Safety Status */}
        <Animated.View 
          style={[
            styles.safetyContainer,
            {
              backgroundColor: theme.colors.cardBackground,
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <View style={styles.safetyHeader}>
            <View style={[styles.safetyIcon, { backgroundColor: theme.isDarkMode ? '#1C3A1C' : '#E8F5E8' }]}>
              <Ionicons name="shield-checkmark" size={24} color="#34C759" />
            </View>
            <View style={styles.safetyInfo}>
              <Text style={[styles.safetyTitle, { color: '#34C759' }]}>Durum: Güvenli</Text>
              <Text style={[styles.safetySubtitle, { color: theme.colors.secondaryText }]}>Son güncelleme: 5 dakika önce</Text>
            </View>
          </View>
        </Animated.View>
        
        {/* Emergency Report Button */}
        <Animated.View 
          style={[
            {
              opacity: fadeAnim,
              transform: [{ translateY: slideAnim }]
            }
          ]}
        >
          <TouchableOpacity style={styles.emergencyButton} onPress={handleEmergencyReport}>
            <Ionicons name="warning" size={20} color="#FFFFFF" />
            <Text style={styles.emergencyButtonText}>Acil Durum Bildir</Text>
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
                    <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>Ara</Text>
                  </TouchableOpacity>
                  <TouchableOpacity 
                    style={styles.actionButton}
                    onPress={() => handleLocationRequest(member.name)}
                  >
                    <Ionicons name="location" size={16} color={theme.colors.primary} />
                    <Text style={[styles.actionButtonText, { color: theme.colors.primary }]}>Konum Sor</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
            
            <TouchableOpacity 
              style={[styles.addMemberButton, { backgroundColor: theme.colors.cardBackground }]}
              onPress={handleAddMember}
            >
              <Ionicons name="add" size={20} color={theme.colors.primary} />
              <Text style={[styles.addMemberText, { color: theme.colors.primary }]}>Yeni Aile Üyesi Ekle</Text>
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
        <View style={[styles.modalContainer, { paddingTop: insets.top, backgroundColor: theme.colors.background }]}>
          <View style={[styles.modalHeader, { backgroundColor: theme.colors.cardBackground, borderBottomColor: theme.colors.border }]}>
            <Text style={[styles.modalTitle, { color: theme.colors.text }]}>Profili Düzenle</Text>
            <TouchableOpacity 
              style={styles.modalCloseButton}
              onPress={() => setShowEditProfile(false)}
            >
              <Ionicons name="close" size={24} color={theme.colors.secondaryText} />
            </TouchableOpacity>
          </View>
          
          <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
            {/* Profile Image Section */}
            <View style={[styles.formSection, { backgroundColor: theme.colors.cardBackground }]}>
              <Text style={[styles.formSectionTitle, { color: theme.colors.text }]}>Profil Fotoğrafı</Text>
              <View style={styles.profileImageContainer}>
                <TouchableOpacity style={styles.profileImagePicker} onPress={pickImage}>
                  {profileForm.profileImage ? (
                    <Image source={{ uri: profileForm.profileImage }} style={styles.profileImagePreview} />
                  ) : (
                    <View style={styles.profileImagePlaceholder}>
                      <Ionicons name="camera" size={32} color={theme.colors.secondaryText} />
                      <Text style={[styles.profileImageText, { color: theme.colors.secondaryText }]}>Fotoğraf Seç</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Personal Information */}
            <View style={[styles.formSection, { backgroundColor: theme.colors.cardBackground }]}>
              <Text style={[styles.formSectionTitle, { color: theme.colors.text }]}>Kişisel Bilgiler</Text>
              
              <View style={styles.formRow}>
                <View style={styles.formField}>
                  <Text style={[styles.formLabel, { color: theme.colors.text }]}>Ad</Text>
                  <TextInput
                    style={[styles.formInput, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
                    value={profileForm.firstName}
                    onChangeText={(text) => setProfileForm({ ...profileForm, firstName: text })}
                    placeholder="Adınızı giriniz"
                    placeholderTextColor={theme.colors.secondaryText}
                  />
                </View>
                <View style={styles.formField}>
                  <Text style={[styles.formLabel, { color: theme.colors.text }]}>Soyad</Text>
                  <TextInput
                    style={[styles.formInput, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
                    value={profileForm.lastName}
                    onChangeText={(text) => setProfileForm({ ...profileForm, lastName: text })}
                    placeholder="Soyadınızı giriniz"
                    placeholderTextColor={theme.colors.secondaryText}
                  />
                </View>
              </View>

              <View style={styles.formFieldFull}>
                <Text style={[styles.formLabel, { color: theme.colors.text }]}>E-posta</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
                  value={profileForm.email}
                  onChangeText={(text) => setProfileForm({ ...profileForm, email: text })}
                  placeholder="E-posta adresinizi giriniz"
                  placeholderTextColor={theme.colors.secondaryText}
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>

              <View style={styles.formFieldFull}>
                <Text style={[styles.formLabel, { color: theme.colors.text }]}>Telefon</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
                  value={profileForm.phone}
                  onChangeText={(text) => setProfileForm({ ...profileForm, phone: text })}
                  placeholder="+90 5XX XXX XX XX"
                  placeholderTextColor={theme.colors.secondaryText}
                  keyboardType="phone-pad"
                />
              </View>

              <View style={styles.formFieldFull}>
                <Text style={[styles.formLabel, { color: theme.colors.text }]}>Konum</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
                  value={profileForm.location}
                  onChangeText={(text) => setProfileForm({ ...profileForm, location: text })}
                  placeholder="Şehir, Ülke"
                  placeholderTextColor={theme.colors.secondaryText}
                />
              </View>

              <View style={styles.formFieldFull}>
                <Text style={[styles.formLabel, { color: theme.colors.text }]}>Acil Durum İletişim</Text>
                <TextInput
                  style={[styles.formInput, { backgroundColor: theme.colors.surface, color: theme.colors.text, borderColor: theme.colors.border }]}
                  value={profileForm.emergencyContact}
                  onChangeText={(text) => setProfileForm({ ...profileForm, emergencyContact: text })}
                  placeholder="+90 5XX XXX XX XX"
                  placeholderTextColor={theme.colors.secondaryText}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            {/* Save Button */}
            <View style={styles.formActions}>
              <TouchableOpacity 
                style={[styles.saveButton, { backgroundColor: theme.colors.primary }]}
                onPress={handleSaveProfile}
              >
                <Text style={[styles.saveButtonText, { color: theme.colors.onPrimary }]}>Kaydet</Text>
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
               {editingMember ? 'Aile Üyesini Düzenle' : 'Yeni Aile Üyesi Ekle'}
             </Text>
             <TouchableOpacity 
               style={styles.modalCloseButton}
               onPress={() => {
                 setShowAddMember(false);
                 setEditingMember(null);
                 setMemberForm({ name: '', surname: '', phone: '', relationship: '' });
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
                           backgroundColor: memberForm.relationship === relation 
                             ? theme.colors.primary 
                             : theme.colors.surface,
                           borderColor: theme.colors.border
                         }
                       ]}
                       onPress={() => setMemberForm({ ...memberForm, relationship: relation })}
                     >
                       <Text style={[
                         styles.relationshipButtonText,
                         {
                           color: memberForm.relationship === relation 
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
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
  profileCard: {
    borderRadius: 24,
    marginHorizontal: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 4,
    overflow: 'hidden',
  },
  gradientBackground: {
    padding: 24,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  centeredProfileContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  profileHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  avatarContainer: {
    alignItems: 'center',
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
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
    fontSize: 24,
    fontWeight: '700',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  userLocation: {
    fontSize: 16,
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 24,
    opacity: 0.9,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 22,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 14,
    color: '#FFFFFF',
    fontWeight: '500',
    opacity: 0.8,
  },
  sectionContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000000',
    marginLeft: 8,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  addButtonText: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  familyMemberItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F7',
  },
  memberInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  memberAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E3F2FD',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  memberInitial: {
    fontSize: 16,
    fontWeight: '600',
    color: '#007AFF',
  },
  memberDetails: {
    flex: 1,
  },
  memberName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#000000',
    marginBottom: 2,
  },
  memberLastSeen: {
    fontSize: 12,
    color: '#8E8E93',
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
    alignItems: 'center',
    paddingVertical: 12,
    marginTop: 8,
  },
  viewAllText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '500',
  },
  safetyContainer: {
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 24,
    padding: 24,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
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
    backgroundColor: '#FF3B30',
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 24,
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#FF3B30',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
     shadowRadius: 15,
     elevation: 8,
  },
  emergencyButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 8,
  },
  bottomSpacing: {
    height: 100,
  },
  
  // Modal Styles
  modalContainer: {
    flex: 1,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5EA',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
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
    marginHorizontal: 16,
    marginVertical: 8,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  formSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
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
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 8,
  },
  
  formInput: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 48,
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
  
  // Relationship Buttons
  relationshipButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  
  relationshipButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  
  relationshipButtonText: {
    fontSize: 14,
    fontWeight: '500',
  },
  
  // Form Actions
  formActions: {
    marginHorizontal: 16,
    marginVertical: 16,
  },
  
  saveButton: {
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  
  saveButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default ProfileScreen;