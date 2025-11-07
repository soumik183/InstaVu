import { supabase } from './supabaseClient';

export const authService = {
  // Sign up with email and password
  async signUp(email, password) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Sign in with email and password
  async signIn(email, password) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Sign out
  async signOut() {
    try {
      const { error } = await supabase.auth.signOut();
      // Clear localStorage
      localStorage.removeItem('remembered_email');
      localStorage.removeItem('remembered_password');
      return { error };
    } catch (error) {
      return { error };
    }
  },

  // Get current user
  async getCurrentUser() {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      return { data: user, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update password
  async updatePassword(newPassword) {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });
      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Check if username is available
  async checkUsernameAvailability(username) {
    try {
      const { data, error } = await supabase
        .from('users_profile')
        .select('username')
        .eq('username', username.toLowerCase())
        .single();

      if (error && error.code === 'PGRST116') {
        // No rows returned - username is available
        return { available: true, error: null };
      }

      return { available: false, error };
    } catch (error) {
      return { available: false, error };
    }
  },

  // Create user profile
  async createUserProfile(userId, username, displayName = null) {
    try {
      const { data, error } = await supabase
        .from('users_profile')
        .insert({
          user_id: userId,
          username: username.toLowerCase(),
          display_name: displayName || username,
          last_login: new Date().toISOString(),
        })
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Get user profile
  async getUserProfile(userId) {
    try {
      const { data, error } = await supabase
        .from('users_profile')
        .select('*')
        .eq('user_id', userId)
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update user profile
  async updateUserProfile(userId, updates) {
    try {
      const { data, error } = await supabase
        .from('users_profile')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('user_id', userId)
        .select()
        .single();

      return { data, error };
    } catch (error) {
      return { data: null, error };
    }
  },

  // Update last login
  async updateLastLogin(userId) {
    try {
      const { error } = await supabase
        .from('users_profile')
        .update({ last_login: new Date().toISOString() })
        .eq('user_id', userId);

      return { error };
    } catch (error) {
      return { error };
    }
  },
};