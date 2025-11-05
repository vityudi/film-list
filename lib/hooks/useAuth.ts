import { useEffect } from 'react';
import {
  signUp,
  signIn,
  signOut,
  getCurrentUser,
  onAuthStateChange,
  type SignUpCredentials,
  type SignInCredentials,
} from '@/lib/services/authService';
import { useAuthStore } from '@/lib/utils/store';

export function useAuth() {
  const { user, loading, setUser, setLoading } = useAuthStore();

  // Initialize auth state on mount
  useEffect(() => {
    let mounted = true;

    const initializeAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        if (mounted) {
          setUser(currentUser);
          setLoading(false);
        }
      } catch (error) {
        if (mounted) {
          setLoading(false);
        }
      }
    };

    // Always set up the subscription first
    const subscription = onAuthStateChange((authUser) => {
      if (mounted) {
        setUser(authUser);
        setLoading(false);
      }
    });

    // Then try to get current user
    initializeAuth();

    return () => {
      mounted = false;
      subscription?.unsubscribe?.();
    };
  }, [setUser, setLoading]);

  const handleSignUp = async (credentials: SignUpCredentials) => {
    setLoading(true);
    const response = await signUp(credentials);
    if (response.success && response.user) {
      setUser(response.user);
    }
    setLoading(false);
    return response;
  };

  const handleSignIn = async (credentials: SignInCredentials) => {
    setLoading(true);
    const response = await signIn(credentials);
    if (response.success && response.user) {
      setUser(response.user);
    }
    setLoading(false);
    return response;
  };

  const handleSignOut = async () => {
    setLoading(true);
    const response = await signOut();
    if (response.success) {
      setUser(null);
    }
    setLoading(false);
    return response;
  };

  return {
    user,
    loading,
    signUp: handleSignUp,
    signIn: handleSignIn,
    signOut: handleSignOut,
  };
}
