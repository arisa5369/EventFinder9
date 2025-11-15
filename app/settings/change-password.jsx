import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
    Alert,
    SafeAreaView,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
    ActivityIndicator,
} from 'react-native';
import { 
  reauthenticateWithCredential, 
  EmailAuthProvider, 
  updatePassword 
} from 'firebase/auth';
import { auth } from '../firebase';

export default function ChangePasswordScreen() {
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!currentPassword || !newPassword || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    // Validate new password: at least 8 characters, 1 number, 1 uppercase letter
    if (newPassword.length < 8) {
      Alert.alert('Error', 'Password must be at least 8 characters long');
      return;
    }

    if (!/\d/.test(newPassword)) {
      Alert.alert('Error', 'Password must contain at least one number');
      return;
    }

    if (!/[A-Z]/.test(newPassword)) {
      Alert.alert('Error', 'Password must contain at least one uppercase letter');
      return;
    }

    if (newPassword !== confirmPassword) {
      Alert.alert('Error', 'New passwords do not match');
      return;
    }

    if (currentPassword === newPassword) {
      Alert.alert('Error', 'New password must be different from current password');
      return;
    }

    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.email) {
      Alert.alert('Error', 'No user logged in');
      return;
    }

    setLoading(true);
    try {
      // Step 1: Re-authenticate the user with their current password
      const credential = EmailAuthProvider.credential(
        currentUser.email,
        currentPassword
      );
      await reauthenticateWithCredential(currentUser, credential);

      // Step 2: Update the password
      await updatePassword(currentUser, newPassword);

      Alert.alert(
        'Success',
        'Your password has been changed successfully',
        [
          {
            text: 'OK',
            onPress: () => {
              setCurrentPassword('');
              setNewPassword('');
              setConfirmPassword('');
              router.back();
            },
          },
        ]
      );
    } catch (error) {
      console.error('Error changing password:', error);
      let errorMessage = 'Failed to change password. Please try again.';
      
      if (error.code === 'auth/wrong-password') {
        errorMessage = 'Current password is incorrect. Please try again.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'New password is too weak. Please choose a stronger password.';
      } else if (error.code === 'auth/requires-recent-login') {
        errorMessage = 'For security, please log out and log back in before changing your password.';
      } else if (error.code === 'auth/network-request-failed') {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      } else if (error.message) {
        errorMessage = `Failed to change password: ${error.message}`;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.title}>Change Password</Text>
        <View style={{ width: 24 }} />
      </View>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Current Password"
            placeholderTextColor="#999"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry={!showCurrentPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            onPress={() => setShowCurrentPassword(!showCurrentPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showCurrentPassword ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color="#999"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="New Password"
            placeholderTextColor="#999"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry={!showNewPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            onPress={() => setShowNewPassword(!showNewPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showNewPassword ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color="#999"
            />
          </TouchableOpacity>
        </View>

        <View style={styles.inputContainer}>
          <Ionicons name="lock-closed-outline" size={20} color="#999" style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Confirm New Password"
            placeholderTextColor="#999"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry={!showConfirmPassword}
            autoCapitalize="none"
          />
          <TouchableOpacity
            onPress={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.eyeIcon}
          >
            <Ionicons
              name={showConfirmPassword ? 'eye-outline' : 'eye-off-outline'}
              size={20}
              color="#999"
            />
          </TouchableOpacity>
        </View>

        <Text style={styles.hint}>
          Password must be at least 8 characters long, contain 1 number, and 1 uppercase letter
        </Text>

        <TouchableOpacity 
          style={[styles.saveButton, loading && styles.saveButtonDisabled]} 
          onPress={handleChangePassword}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.saveButtonText}>Change Password</Text>
          )}
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f2f4f8',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#222',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginBottom: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  eyeIcon: {
    padding: 4,
  },
  hint: {
    fontSize: 14,
    color: '#666',
    marginBottom: 24,
    marginLeft: 4,
  },
  saveButton: {
    backgroundColor: '#0a7ea4',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 40,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
});
