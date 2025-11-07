import { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabaseClient';
import { authService } from '../services/authService';

const AuthContext = createContext({});

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check active session
    checkUser();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          await loadProfile(session.user.id);
        } else {
          setProfile(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const checkUser = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      setUser(session?.user ?? null);
      
      if (session?.user) {
        await loadProfile(session.user.id);
      }
    } catch (error) {
      console.error('Error checking user:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProfile = async (userId) => {
    const { data, error } = await authService.getUserProfile(userId);
    if (!error && data) {
      setProfile(data);
      // Update last login
      await authService.updateLastLogin(userId);
    }
  };

  const signIn = async (email, password) => {
    const { data, error } = await authService.signIn(email, password);
    return { data, error };
  };

  const signUp = async (email, password) => {
    const { data, error } = await authService.signUp(email, password);
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await authService.signOut();
    if (!error) {
      setUser(null);
      setProfile(null);
    }
    return { error };
  };

  const updateProfile = async (updates) => {
    if (!user) return { error: 'No user logged in' };
    
    const { data, error } = await authService.updateUserProfile(user.id, updates);
    if (!error && data) {
      setProfile(data);
    }
    return { data, error };
  };

  const createProfile = async (username, displayName) => {
    if (!user) return { error: 'No user logged in' };
    
    const { data, error } = await authService.createUserProfile(
      user.id,
      username,
      displayName
    );
    if (!error && data) {
      setProfile(data);
    }
    return { data, error };
  };

  const value = {
    user,
    profile,
    loading,
    signIn,
    signUp,
    signOut,
    updateProfile,
    createProfile,
    checkUsernameAvailability: authService.checkUsernameAvailability,
    updatePassword: authService.updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};