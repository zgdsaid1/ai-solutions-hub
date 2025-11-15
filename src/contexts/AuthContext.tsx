import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase, Profile } from '@/lib/supabase';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  loading: boolean;
  authLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, fullName: string, companyName?: string) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  // Load user on mount
  useEffect(() => {
    async function loadUser() {
      setLoading(true);
      try {
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error) {
          console.error('Error getting user:', error);
          setUser(null);
          setProfile(null);
          setLoading(false);
          return;
        }
        
        setUser(user);
        
        if (user) {
          // Load profile but don't wait for it to complete loading state
          loadProfile(user.id).finally(() => {
            setLoading(false);
          });
        } else {
          setLoading(false);
        }
      } catch (error) {
        console.error('Unexpected error in loadUser:', error);
        setUser(null);
        setProfile(null);
        setLoading(false);
      }
    }
    loadUser();

    // Set up auth listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email || 'no user');
        setUser(session?.user || null);
        
        if (session?.user) {
          // Load profile but don't block the auth state change
          loadProfile(session.user.id).catch(error => {
            console.error('Profile loading failed in auth listener:', error);
          });
        } else {
          setProfile(null);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [authLoading]);

  async function loadProfile(userId: string) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) {
        console.error('Error loading profile:', error);
        // Don't set profile to null - allow app to continue without profile
        setProfile(null);
        return;
      }

      // If no profile exists, create a basic one
      if (!data) {
        console.log('No profile found, creating basic profile...');
        const { data: userData } = await supabase.auth.getUser();
        
        if (userData.user) {
          const basicProfile = {
            id: userId,
            email: userData.user.email || '',
            full_name: userData.user.user_metadata?.full_name || 'User',
            company_name: userData.user.user_metadata?.company_name || null,
            role: 'user',
            subscription_tier: 'free'
          };

          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert(basicProfile)
            .select()
            .single();

          if (createError) {
            console.error('Error creating basic profile:', createError);
            setProfile(null);
          } else {
            setProfile(newProfile);
          }
        } else {
          setProfile(null);
        }
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Unexpected error loading profile:', error);
      // Don't throw error - allow app to continue without profile
      setProfile(null);
    }
  }

  async function signIn(email: string, password: string) {
    try {
      setAuthLoading(true);
      
      // Create a timeout promise
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Authentication timeout - please try again')), 10000);
      });

      // Race between authentication and timeout
      const { error } = await Promise.race([
        supabase.auth.signInWithPassword({ email, password }),
        timeoutPromise
      ]);
      
      if (error) throw error;
      
      console.log('Authentication successful');
      
    } catch (error: any) {
      console.error('Sign in error:', error);
      throw error;
    } finally {
      // Ensure authLoading is always reset
      setAuthLoading(false);
    }
  }

  async function signUp(email: string, password: string, fullName: string, companyName?: string) {
    try {
      setAuthLoading(true);
      
      // Create a timeout promise for signup
      const timeoutPromise = new Promise<never>((_, reject) => {
        setTimeout(() => reject(new Error('Registration timeout - please try again')), 15000);
      });

      // Race between signup and timeout
      const { data, error } = await Promise.race([
        supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
              company_name: companyName
            }
          }
        }),
        timeoutPromise
      ]);
      
      if (error) throw error;
    
    // With mailer_autoconfirm=true, user should be automatically confirmed
    // The session might not be immediately available, so we'll create profile anyway
    if (data.user) {
      try {
        // Check if profile already exists to avoid duplicate key errors
        const { data: existingProfile } = await supabase
          .from('profiles')
          .select('id')
          .eq('id', data.user.id)
          .maybeSingle();

        if (!existingProfile) {
          const { error: profileError } = await supabase
            .from('profiles')
            .insert({
              id: data.user.id,
              email: data.user.email!,
              full_name: fullName,
              company_name: companyName || null,
              role: 'user',
              subscription_tier: 'free'
            });
          
          if (profileError) {
            console.error('Error creating profile:', profileError);
          }
          
          // Create initial subscription
          const { error: subError } = await supabase
            .from('subscriptions')
            .insert({
              user_id: data.user.id,
              plan_name: 'free',
              status: 'active'
            });
            
          if (subError) {
            console.error('Error creating subscription:', subError);
          }
        }
      } catch (err) {
        console.error('Profile creation error:', err);
        // Continue even if profile creation fails - user should still be able to sign in
      }
    }
    
    // Ensure session is properly handled
    if (data.session) {
      console.log('User signed up and session established');
      // Wait for auth state change to propagate
      await new Promise(resolve => setTimeout(resolve, 1000));
    } else if (data.user && !data.session) {
      console.log('User signed up, session will be established by auth listener');
    }
    } catch (error: any) {
      console.error('Sign up error:', error);
      throw error;
    } finally {
      // Ensure authLoading is always reset
      setAuthLoading(false);
    }
  }

  async function signOut() {
    console.log('signOut function called');
    try {
      setAuthLoading(true);
      
      const { error } = await supabase.auth.signOut();
      console.log('Supabase signOut error:', error);
      
      if (error) {
        console.error('Supabase signOut error:', error);
        throw error;
      }
      
      console.log('SignOut successful, clearing states');
      // Clear both user and profile states immediately
      setUser(null);
      setProfile(null);
      
    } catch (error) {
      console.error('SignOut function error:', error);
      // Even if there's an error, clear local state
      setUser(null);
      setProfile(null);
      throw error;
    } finally {
      setAuthLoading(false);
    }
  }

  async function refreshProfile() {
    if (user) {
      await loadProfile(user.id);
    }
  }

  return (
    <AuthContext.Provider value={{ user, profile, loading, authLoading, signIn, signUp, signOut, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
