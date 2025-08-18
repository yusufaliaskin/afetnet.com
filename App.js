import React, { useState, useEffect } from 'react';
import { View } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';

import { ThemeProvider } from './src/contexts/ThemeContext';
import { LanguageProvider } from './src/contexts/LanguageContext';
import { NotificationProvider } from './src/contexts/NotificationContext';
import NotificationContainer from './src/components/NotificationContainer';
import HomeScreen from './src/screens/HomeScreen';
import RasathaneScreen from './src/screens/RasathaneScreen';
import MapScreen from './src/screens/MapScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import EmergencyScreen from './src/screens/EmergencyScreen';
import SplashScreen from './src/screens/SplashScreen';
import HelpCenterScreen from './src/screens/HelpCenterScreen';
import AboutScreen from './src/screens/AboutScreen';
import PrivacyPolicyScreen from './src/screens/PrivacyPolicyScreen';
import TermsOfUseScreen from './src/screens/TermsOfUseScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import PostDetailScreen from './src/screens/PostDetailScreen';
import EarthquakeDetailScreen from './src/screens/EarthquakeDetailScreen';

import { useTheme } from './src/contexts/ThemeContext';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabNavigator() {
  const { theme } = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          let iconSize = 24;

          if (route.name === 'Anasayfa') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Rasathane') {
            iconName = focused ? 'compass' : 'compass-outline';
          } else if (route.name === 'Harita') {
            // Ortadaki yeşil buton için özel tasarım
            return (
              <View style={{
                width: 56,
                height: 56,
                borderRadius: 28,
                backgroundColor: '#FF8C00',
                justifyContent: 'center',
                alignItems: 'center',
                marginBottom: -7,
                shadowColor: '#FF8C00',
                shadowOffset: {
                  width: 0,
                  height: 4,
                },
                shadowOpacity: 0.3,
                shadowRadius: 8,
                elevation: 8,
              }}>
                <Ionicons name="map" size={28} color="#FFFFFF" />
              </View>
            );
          } else if (route.name === 'Aile') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Ayarlar') {
            iconName = focused ? 'settings' : 'settings-outline';
          }

          return <Ionicons name={iconName} size={iconSize} color={color} />;
        },
        tabBarActiveTintColor: '#1F2937',
        tabBarInactiveTintColor: '#9CA3AF',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          height: 80,
          paddingBottom: 20,
          paddingTop: 12,
          paddingHorizontal: 20,
          shadowColor: '#000',
          shadowOffset: {
            width: 0,
            height: -2,
          },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          elevation: 8,
          position: 'absolute',
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 4,
        },
        tabBarItemStyle: {
          paddingVertical: 4,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Anasayfa" 
        component={HomeScreen}
        options={{
          tabBarLabel: 'Anasayfa',
        }}
      />
      <Tab.Screen 
        name="Rasathane" 
        component={RasathaneScreen}
        options={{
          tabBarLabel: 'Rasathane',
        }}
      />
      <Tab.Screen 
        name="Harita" 
        component={MapScreen}
        options={{
          tabBarLabel: '',
          tabBarShowLabel: false,
        }}
      />
      <Tab.Screen 
        name="Aile" 
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Aile',
        }}
      />
      <Tab.Screen 
        name="Ayarlar" 
        component={SettingsScreen}
        options={{
          tabBarLabel: 'Ayarlar',
        }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const { isDarkMode } = useTheme();

  return (
    <NavigationContainer>
      <StatusBar 
        style={isDarkMode ? "light" : "dark"} 
        backgroundColor={isDarkMode ? "#1a1a1a" : "#ffffff"}
        translucent={false}
      />
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen name="Emergency" component={EmergencyScreen} />
        <Stack.Screen name="Notifications" component={NotificationsScreen} />
        <Stack.Screen name="PostDetail" component={PostDetailScreen} />
        <Stack.Screen name="EarthquakeDetail" component={EarthquakeDetailScreen} />
        <Stack.Screen name="HelpCenter" component={HelpCenterScreen} />
        <Stack.Screen name="About" component={AboutScreen} />
        <Stack.Screen name="PrivacyPolicy" component={PrivacyPolicyScreen} />
        <Stack.Screen name="TermsOfUse" component={TermsOfUseScreen} />
      </Stack.Navigator>
      {/* <NotificationContainer /> */}
    </NavigationContainer>
  );
}

export default function App() {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  return (
    <ThemeProvider>
      <LanguageProvider>
        <NotificationProvider>
          {showSplash ? (
            <SplashScreen onFinish={handleSplashFinish} />
          ) : (
            <AppNavigator />
          )}
        </NotificationProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}