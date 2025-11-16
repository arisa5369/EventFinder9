import { useFocusEffect } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    Image,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from 'react-native';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import { signOut } from 'firebase/auth';

export default function AccountScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState({
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+383 44 123 456',
    profileImage: null,
  });

  const loadProfile = useCallback(async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) {
        console.log('No user logged in');
        setLoading(false);
        return;
      }

      const userDocRef = doc(db, 'users', currentUser.uid);
      const userDocSnap = await getDoc(userDocRef);

      if (userDocSnap.exists()) {
        const userDataFromFirestore = userDocSnap.data();
        setUserData({
          name: userDataFromFirestore.name || currentUser.email?.split('@')[0] || 'User',
          email: userDataFromFirestore.email || currentUser.email || '',
          phone: userDataFromFirestore.phone || '',
          profileImage: userDataFromFirestore.profileImage || null,
        });
      } else {
        setUserData({
          name: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
          email: currentUser.email || '',
          phone: '',
          profileImage: null,
        });
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      const currentUser = auth.currentUser;
      if (currentUser) {
        setUserData({
          name: currentUser.displayName || currentUser.email?.split('@')[0] || 'User',
          email: currentUser.email || '',
          phone: '',
          profileImage: null,
        });
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadProfile();
    }, [loadProfile])
  );


  const handleEditProfile = () => {
    router.push('/settings/edit-profile');
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      router.replace('/auth/login');
    } catch (error) {
      console.error('Error signing out:', error);
      router.replace('/auth/login');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0a7ea4" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.header}>
          <Text style={styles.title}>My Profile</Text>
          <TouchableOpacity onPress={handleEditProfile}>
            <Ionicons name="create-outline" size={24} color="#0a7ea4" />
          </TouchableOpacity>
        </View>

        <View style={styles.profileCard}>
          <View style={styles.profileImageContainer}>
            {userData.profileImage ? (
              <Image
                source={{ uri: userData.profileImage }}
                style={styles.profileImage}
              />
            ) : (
              <View style={styles.placeholderImage}>
                <Ionicons name="person" size={40} color="#ccc" />
              </View>
            )}
          </View>

          <View style={styles.profileInfo}>
            <Text style={styles.profileName}>{userData.name}</Text>
            <Text style={styles.profileEmail}>{userData.email}</Text>
            <Text style={styles.profilePhone}>{userData.phone}</Text>
          </View>
        </View>

        <View style={styles.menuSection} >
          <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/(tabs)/Mytickets")}>
            <Ionicons name="ticket-outline" size={24} color="#0a7ea4" />
            <Text style={styles.menuItemText}>My Tickets</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={() => router.push("/(tabs)/saved")} >
            <Ionicons name="heart-outline" size={24} color="#0a7ea4" />
              <Text style={styles.menuItemText}>Saved Events</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.menuItem}
            onPress={() => router.push('/settings')}
          >
            <Ionicons name="settings-outline" size={24} color="#0a7ea4" />
            <Text style={styles.menuItemText}>Settings</Text>
            <Ionicons name="chevron-forward" size={20} color="#ccc" />
          </TouchableOpacity>

          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <Ionicons name="log-out-outline" size={24} color="#ff4444" />
            <Text style={[styles.menuItemText, { color: '#ff4444' }]}>Sign Out</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f8',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
  },
  profileCard: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 24,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  profileImageContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
  },
  placeholderImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileInfo: {
    alignItems: 'center',
  },
  profileName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 8,
  },
  profileEmail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 4,
  },
  profilePhone: {
    fontSize: 16,
    color: '#666',
  },
  menuSection: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  menuItemText: {
    flex: 1,
    fontSize: 16,
    color: '#333',
    marginLeft: 16,
  },
});


