'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { insforge, AVATARS_BUCKET, STORAGE_URL } from '@/lib/insforge';
import { User } from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signUp: (email: string, password: string, name: string) => Promise<{ error: string | null; needsVerification?: boolean }>;
  signIn: (email: string, password: string) => Promise<{ error: string | null }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error: string | null }>;
  verifyEmail: (email: string, code: string) => Promise<{ error: string | null }>;
  resendVerificationEmail: (email: string) => Promise<{ error: string | null }>;
  updateProfile: (name: string, avatarUrl?: string) => Promise<{ error: string | null }>;
  uploadAvatar: (file: File) => Promise<{ error: string | null; avatarUrl?: string }>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

async function fetchUserFromDb(userId: string): Promise<User | null> {
  const { data, error } = await insforge.database
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error || !data) return null;
  return data;
}

async function createUserInDb(userId: string, email: string, name: string, avatarUrl?: string): Promise<void> {
  await insforge.database.from('users').insert([{
    id: userId,
    email,
    name,
    password_hash: 'managed_by_insforge',
    avatar_url: avatarUrl || null,
  }]);
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const checkAndSetUser = async () => {
    let sessionUser = null;
    let googleAvatarUrl = null;
    
    try {
      const { data } = await insforge.auth.getCurrentSession();
      if (data?.session?.user) {
        sessionUser = data.session.user;
        
        // Try to get Google avatar from the user object
        const userWithMetadata = sessionUser as unknown as {
          profile?: { avatar_url?: string; name?: string };
          metadata?: Record<string, unknown>;
          providers?: string[];
        };
        
        // First check profile
        googleAvatarUrl = userWithMetadata.profile?.avatar_url;
        
        // Then check user_oauth_providers view for Google avatar
        if (!googleAvatarUrl) {
          const { data: providerData } = await insforge.database
            .from('user_oauth_providers')
            .select('avatar_url, avatar_url2')
            .eq('user_id', sessionUser.id)
            .eq('provider', 'google')
            .maybeSingle();
          
          if (providerData) {
            googleAvatarUrl = providerData.avatar_url || providerData.avatar_url2;
          }
        }
      }
    } catch (err) {
      // Silent fail - will use localStorage fallback
    }
    
    try {
      if (sessionUser) {
        let dbUser = await fetchUserFromDb(sessionUser.id);
        
        if (!dbUser) {
          // Create new user with Google avatar if available
          await createUserInDb(
            sessionUser.id, 
            sessionUser.email || '', 
            sessionUser.profile?.name || '',
            googleAvatarUrl || undefined
          );
          dbUser = await fetchUserFromDb(sessionUser.id);
        } else if (!dbUser.avatar_url && googleAvatarUrl) {
          // Update existing user with Google avatar if they don't have one
          await insforge.database
            .from('users')
            .update({ avatar_url: googleAvatarUrl })
            .eq('id', sessionUser.id);
          
          dbUser = { ...dbUser, avatar_url: googleAvatarUrl };
        }
        
        if (dbUser) {
          localStorage.setItem('gamingzone_user', JSON.stringify(dbUser));
        }
        setUser(dbUser);
      } else {
        const storedUser = localStorage.getItem('gamingzone_user');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
          } catch (e) {
            localStorage.removeItem('gamingzone_user');
          }
        }
      }
    } catch (err) {
      const storedUser = localStorage.getItem('gamingzone_user');
      if (storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          setUser(parsedUser);
        } catch (e) {
          localStorage.removeItem('gamingzone_user');
        }
      }
    }
    setLoading(false);
    setInitialLoadDone(true);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      checkAndSetUser();
    }, 100);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    const handleFocus = () => {
      checkAndSetUser();
    };
    
    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);

  const refreshSession = async () => {
    await checkAndSetUser();
  };

  const signUp = async (email: string, password: string, name: string) => {
    const redirectUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/auth/callback`
      : '';

    const { data, error } = await insforge.auth.signUp({
      email,
      password,
      name,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) {
      return { error: error.message, needsVerification: false };
    }

    if (data?.requireEmailVerification) {
      return { error: null, needsVerification: true };
    }

    if (data?.user) {
      await createUserInDb(data.user.id, email, name);
      const dbUser = await fetchUserFromDb(data.user.id);
      if (dbUser) {
        localStorage.setItem('gamingzone_user', JSON.stringify(dbUser));
      }
      setUser(dbUser);
    }

    return { error: null, needsVerification: false };
  };

  const verifyEmail = async (email: string, code: string) => {
    const { data, error } = await insforge.auth.verifyEmail({
      email,
      otp: code,
    });

    if (error) {
      return { error: error.message };
    }

    if (data?.user) {
      const existingUser = await fetchUserFromDb(data.user.id);
      if (!existingUser) {
        await createUserInDb(data.user.id, email, data.user.profile?.name || '');
      }
      const dbUser = await fetchUserFromDb(data.user.id);
      setUser(dbUser);
    }

    return { error: null };
  };

  const resendVerificationEmail = async (email: string) => {
    const redirectUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/auth/callback`
      : '';

    const { error } = await insforge.auth.resendVerificationEmail({
      email,
      options: {
        emailRedirectTo: redirectUrl,
      },
    });

    if (error) {
      return { error: error.message };
    }

    return { error: null };
  };

  const signIn = async (email: string, password: string) => {
    const { data, error } = await insforge.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      return { error: error.message };
    }

    if (data?.user) {
      let dbUser = await fetchUserFromDb(data.user.id);
      if (!dbUser) {
        await createUserInDb(data.user.id, email, data.user.profile?.name || '');
        dbUser = await fetchUserFromDb(data.user.id);
      }
      if (dbUser) {
        localStorage.setItem('gamingzone_user', JSON.stringify(dbUser));
      }
      setUser(dbUser);
    }

    return { error: null };
  };

  const signInWithGoogle = async () => {
    const redirectUrl = typeof window !== 'undefined'
      ? `${window.location.origin}/auth/callback`
      : '';

    const { error } = await insforge.auth.signInWithOAuth({
      provider: 'google',
      redirectTo: redirectUrl,
    });

    return { error: error?.message || null };
  };

  const refreshUserData = async () => {
    await checkAndSetUser();
  };

  const uploadAvatar = async (file: File): Promise<{ error: string | null; avatarUrl?: string }> => {
    if (!user) {
      return { error: 'Not authenticated' };
    }

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}.${fileExt}`;

      const { data, error: uploadError } = await insforge.storage
        .from(AVATARS_BUCKET)
        .upload(fileName, file);

      if (uploadError) {
        return { error: uploadError.message };
      }

      const avatarUrl = data?.url || `${STORAGE_URL}/${AVATARS_BUCKET}/${fileName}`;
      
      await insforge.database.from('users').update({
        avatar_url: avatarUrl,
      }).eq('id', user.id);

      setUser({ ...user, avatar_url: avatarUrl });

      return { error: null, avatarUrl };
    } catch (err) {
      return { error: 'Failed to upload avatar' };
    }
  };

  const updateProfile = async (name: string, avatarUrl?: string) => {
    if (!user) {
      return { error: 'Not authenticated' };
    }

    try {
      const updates: { name: string; avatar_url?: string } = { name };
      if (avatarUrl) {
        updates.avatar_url = avatarUrl;
      }

      await insforge.database.from('users').update(updates).eq('id', user.id);

      setUser({ ...user, ...updates });

      return { error: null };
    } catch (err) {
      return { error: 'Failed to update profile' };
    }
  };

  const signOut = async () => {
    await insforge.auth.signOut();
    localStorage.removeItem('gamingzone_user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      signUp,
      signIn,
      signOut,
      signInWithGoogle,
      verifyEmail,
      resendVerificationEmail,
      updateProfile,
      uploadAvatar,
      refreshUserData,
    }}>
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
