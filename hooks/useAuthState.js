import { useState, useEffect } from 'react';
import { auth } from '../app/firebase';
import { onAuthStateChanged } from 'firebase/auth';

/**
 * Custom hook to check Firebase authentication state
 * 
 * Returns:
 * - isLoggedIn: boolean - true if user is logged in (not anonymous)
 * - user: User | null - the current user object
 * - isLoading: boolean - true while checking auth state
 * 
 * Usage:
 * const { isLoggedIn, user, isLoading } = useAuthState();
 */
export function useAuthState() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check initial state
    const currentUser = auth.currentUser;
    const loggedIn = currentUser && !currentUser.isAnonymous;
    setIsLoggedIn(loggedIn);
    setUser(currentUser);
    setIsLoading(false);

    // Listen for auth state changes
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      const loggedIn = firebaseUser && !firebaseUser.isAnonymous;
      setIsLoggedIn(loggedIn);
      setUser(firebaseUser);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return { isLoggedIn, user, isLoading };
}

