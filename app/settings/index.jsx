import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Switch,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useTheme } from '../../contexts/ThemeContext';

const STORAGE_KEYS = {
  NOTIFICATIONS: '@spoton:notifications',
  LOCATION_SERVICES: '@spoton:locationServices',
};

export default function SettingsScreen() {
  const router = useRouter();
  const { isDarkMode, toggleTheme, colors } = useTheme();
  const [notifications, setNotifications] = useState(true);
  const [locationServices, setLocationServices] = useState(true);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPreferences();
  }, []);

  const loadPreferences = async () => {
    try {
      const [notificationsValue, locationValue] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.NOTIFICATIONS),
        AsyncStorage.getItem(STORAGE_KEYS.LOCATION_SERVICES),
      ]);

      if (notificationsValue !== null) {
        setNotifications(JSON.parse(notificationsValue));
      }
      if (locationValue !== null) {
        setLocationServices(JSON.parse(locationValue));
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationsChange = async (value) => {
    setNotifications(value);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving notifications preference:', error);
    }
  };

  const handleLocationChange = async (value) => {
    setLocationServices(value);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.LOCATION_SERVICES, JSON.stringify(value));
    } catch (error) {
      console.error('Error saving location preference:', error);
    }
  };

  const handleDarkModeChange = (value) => {
    toggleTheme(value);
  };

  const handleLogout = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: () => {
            router.replace('/auth/login');
          },
        },
      ]
    );
  };

  const handleDeleteAccount = () => {
    Alert.alert(
      'Delete Account',
      'This action cannot be undone. All your data, events, and tickets will be permanently deleted. Are you sure you want to delete your account?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            Alert.alert(
              'Confirm Deletion',
              'Please type "DELETE" to confirm account deletion',
              [
                { text: 'Cancel', style: 'cancel' },
                {
                  text: 'Delete Account',
                  style: 'destructive',
                  onPress: async () => {
                    try {
                      await AsyncStorage.multiRemove([
                        STORAGE_KEYS.NOTIFICATIONS,
                        STORAGE_KEYS.LOCATION_SERVICES,
                      ]);
                      toggleTheme(false);
                      
                      Alert.alert(
                        'Account Deleted',
                        'Your account has been permanently deleted. You will be signed out.',
                        [
                          {
                            text: 'OK',
                            onPress: () => {
                              router.replace('/auth/login');
                            },
                          },
                        ]
                      );
                    } catch (error) {
                      console.error('Error deleting account:', error);
                      Alert.alert('Error', 'Failed to delete account. Please try again.');
                    }
                  },
                },
              ]
            );
          },
        },
      ]
    );
  };

  const SettingItem = ({
    icon,
    title,
    subtitle,
    onPress,
    rightComponent,
    isDestructive = false,
  }) => (
    <TouchableOpacity style={[styles.settingItem, { backgroundColor: colors.card }]} onPress={onPress}>
      <View style={styles.settingLeft}>
        <View style={[
          styles.iconContainer,
          { backgroundColor: isDestructive ? (isDarkMode ? '#3a1f1f' : '#fff5f5') : (isDarkMode ? '#1a2a3a' : '#f0f8ff') }
        ]}>
          <Ionicons 
            name={icon} 
            size={24} 
            color={isDestructive ? '#ff4444' : colors.primary} 
          />
        </View>
        <View style={styles.settingText}>
          <Text style={[
            styles.settingTitle,
            { color: isDestructive ? '#ff4444' : colors.text }
          ]}>
            {title}
          </Text>
          {subtitle && <Text style={[styles.settingSubtitle, { color: colors.textSecondary }]}>{subtitle}</Text>}
        </View>
      </View>
      {rightComponent || (
        <Ionicons name="chevron-forward" size={20} color={colors.textSecondary} />
      )}
    </TouchableOpacity>
  );

  const dynamicStyles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    loadingText: {
      fontSize: 16,
      color: colors.textSecondary,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 30,
      paddingTop: 10,
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      color: colors.text,
    },
    sectionTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: colors.text,
      marginBottom: 16,
      marginLeft: 4,
    },
  });

  if (loading) {
    return (
      <SafeAreaView style={dynamicStyles.container}>
        <View style={styles.loadingContainer}>
          <Text style={dynamicStyles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={dynamicStyles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={dynamicStyles.header}>
          <TouchableOpacity onPress={() => {
            // Navigate directly to account page, clearing any intermediate screens
            router.push('/(tabs)/account');
          }}>
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <Text style={dynamicStyles.title}>Settings</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.section}>
          <Text style={dynamicStyles.sectionTitle}>Preferences</Text>
          
          <SettingItem
            icon="notifications-outline"
            title="Push Notifications"
            subtitle="Get notified about new events and updates"
            rightComponent={
              <Switch
                value={notifications}
                onValueChange={handleNotificationsChange}
                trackColor={{ false: '#f0f0f0', true: '#0a7ea4' }}
                thumbColor={notifications ? '#fff' : '#f4f3f4'}
              />
            }
          />

          <SettingItem
            icon="location-outline"
            title="Location Services"
            subtitle="Find events near you"
            rightComponent={
              <Switch
                value={locationServices}
                onValueChange={handleLocationChange}
                trackColor={{ false: '#f0f0f0', true: '#0a7ea4' }}
                thumbColor={locationServices ? '#fff' : '#f4f3f4'}
              />
            }
          />

          <SettingItem
            icon="moon-outline"
            title="Dark Mode"
            subtitle="Switch to dark theme"
            rightComponent={
              <Switch
                value={isDarkMode}
                onValueChange={handleDarkModeChange}
                trackColor={{ false: '#f0f0f0', true: colors.primary }}
                thumbColor={isDarkMode ? '#fff' : '#f4f3f4'}
              />
            }
          />
        </View>

        <View style={styles.section}>
          <Text style={dynamicStyles.sectionTitle}>Account</Text>
          
          <SettingItem
            icon="person-outline"
            title="Edit Profile"
            subtitle="Update your personal information"
            onPress={() => router.push('/settings/edit-profile')}
          />

          <SettingItem
            icon="lock-closed-outline"
            title="Change Password"
            subtitle="Update your account password"
            onPress={() => router.push('/settings/change-password')}
          />

          <SettingItem
            icon="card-outline"
            title="Payment Methods"
            subtitle="Manage your payment options"
            onPress={() => router.push('/settings/payment-methods')}
          />
        </View>

        <View style={styles.section}>
          <Text style={dynamicStyles.sectionTitle}>Support</Text>
          
          <SettingItem
            icon="help-circle-outline"
            title="Help Center"
            subtitle="Get help and support"
            onPress={() => router.push('/settings/help-center')}
          />

          <SettingItem
            icon="chatbubble-outline"
            title="Contact Us"
            subtitle="Send us feedback or report issues"
            onPress={() => router.push('/settings/contact-us')}
          />

          <SettingItem
            icon="document-text-outline"
            title="Terms of Service"
            subtitle="Read our terms and conditions"
            onPress={() => router.push('/settings/terms')}
          />

          <SettingItem
            icon="shield-checkmark-outline"
            title="Privacy Policy"
            subtitle="Learn how we protect your data"
            onPress={() => router.push('/settings/privacy')}
          />
        </View>

        <View style={styles.section}>
          <Text style={dynamicStyles.sectionTitle}>About</Text>
          
          <SettingItem
            icon="information-circle-outline"
            title="App Version"
            subtitle="1.0.0"
            onPress={() => Alert.alert('SpotOn', 'Version 1.0.0\nBuilt with React Native & Expo')}
          />
        </View>

        <View style={styles.section}>
          <SettingItem
            icon="log-out-outline"
            title="Sign Out"
            onPress={handleLogout}
            isDestructive={true}
          />

          <SettingItem
            icon="trash-outline"
            title="Delete Account"
            subtitle="Permanently delete your account"
            onPress={handleDeleteAccount}
            isDestructive={true}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  section: {
    marginBottom: 30,
  },
  settingItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    marginBottom: 2,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  settingText: {
    flex: 1,
  },
  settingTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 2,
  },
  settingSubtitle: {
    fontSize: 14,
  },
});