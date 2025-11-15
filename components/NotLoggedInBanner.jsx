import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { auth } from '../app/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { useTheme } from '../contexts/ThemeContext';

/**
 * NotLoggedInBanner Component
 * 
 * Displays a banner/button when user is not logged in (anonymous or no user).
 * Tapping it redirects to login/registration page.
 * 
 * Usage:
 * <NotLoggedInBanner />
 * 
 * Props:
 * - style: Additional styles for the container
 * - variant: 'banner' (default) or 'button' - different display styles
 * - position: 'top' (default) or 'bottom' - where to show the banner
 */
export default function NotLoggedInBanner({ 
  style, 
  variant = 'banner',
  position = 'top' 
}) {
  const router = useRouter();
  const { colors } = useTheme();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    // Check initial auth state
    const checkAuthState = () => {
      const user = auth.currentUser;
      // User is considered "logged in" if they exist and are NOT anonymous
      const loggedIn = user && !user.isAnonymous;
      setIsLoggedIn(loggedIn);
      setIsLoading(false);
    };

    checkAuthState();

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      const loggedIn = user && !user.isAnonymous;
      setIsLoggedIn(loggedIn);
      setIsLoading(false);

      // Animate banner appearance/disappearance
      Animated.timing(fadeAnim, {
        toValue: loggedIn ? 0 : 1,
        duration: 300,
        useNativeDriver: true,
      }).start();
    });

    return () => unsubscribe();
  }, [fadeAnim]);

  const handlePress = () => {
    router.push('/auth/login');
  };

  // Don't show banner if user is logged in or still loading
  if (isLoading || isLoggedIn) {
    return null;
  }

  const dynamicStyles = StyleSheet.create({
    container: {
      backgroundColor: variant === 'banner' ? colors.primary : colors.card,
      padding: variant === 'banner' ? 12 : 16,
      marginHorizontal: variant === 'banner' ? 0 : 16,
      marginVertical: variant === 'banner' ? 0 : 8,
      borderRadius: variant === 'banner' ? 0 : 12,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: variant === 'banner' ? 0 : 0.1,
      shadowRadius: 4,
      elevation: variant === 'banner' ? 0 : 3,
      borderBottomWidth: variant === 'banner' ? 1 : 0,
      borderBottomColor: colors.border,
    },
    content: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    icon: {
      marginRight: 12,
    },
    textContainer: {
      flex: 1,
    },
    title: {
      fontSize: variant === 'banner' ? 14 : 16,
      fontWeight: '600',
      color: variant === 'banner' ? '#fff' : colors.text,
      marginBottom: variant === 'banner' ? 2 : 0,
    },
    subtitle: {
      fontSize: variant === 'banner' ? 12 : 14,
      color: variant === 'banner' ? 'rgba(255,255,255,0.9)' : colors.textSecondary,
    },
    button: {
      backgroundColor: variant === 'banner' ? 'rgba(255,255,255,0.2)' : colors.primary,
      paddingHorizontal: 16,
      paddingVertical: 8,
      borderRadius: 8,
      marginLeft: 12,
    },
    buttonText: {
      color: variant === 'banner' ? '#fff' : '#fff',
      fontSize: 14,
      fontWeight: '600',
    },
  });

  return (
    <Animated.View
      style={[
        dynamicStyles.container,
        style,
        {
          opacity: fadeAnim,
          transform: [
            {
              translateY: fadeAnim.interpolate({
                inputRange: [0, 1],
                outputRange: position === 'top' ? [-50, 0] : [50, 0],
              }),
            },
          ],
        },
      ]}
    >
      <TouchableOpacity
        style={dynamicStyles.content}
        onPress={handlePress}
        activeOpacity={0.7}
      >
        <Ionicons
          name="person-circle-outline"
          size={variant === 'banner' ? 24 : 28}
          color={variant === 'banner' ? '#fff' : colors.primary}
          style={dynamicStyles.icon}
        />
        <View style={dynamicStyles.textContainer}>
          <Text style={dynamicStyles.title}>
            {variant === 'banner' ? 'Sign in to access all features' : 'Not signed in'}
          </Text>
          {variant === 'banner' && (
            <Text style={dynamicStyles.subtitle}>
              Create an account or sign in to save events and more
            </Text>
          )}
        </View>
      </TouchableOpacity>
      <TouchableOpacity
        style={dynamicStyles.button}
        onPress={handlePress}
        activeOpacity={0.8}
      >
        <Text style={dynamicStyles.buttonText}>
          {variant === 'banner' ? 'Sign In' : 'Login'}
        </Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

