import { create } from 'zustand';
import { supabase } from '../lib/supabase';
import { ensureProfileExists } from '../services/api';
import type { User } from '../types';
import type { Tables } from '../types/database';
interface AuthStore {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  initialize: () => Promise<void>;
}

function mapProfileToUser(profile: Tables<'profiles'>): User {
  return {
    id: profile.id,
    email: profile.email,
    name: profile.name || '',
    phone: profile.phone || '',
    role: profile.role as User['role'],
    avatar: profile.avatar_url || '',
    avatar_url: profile.avatar_url || '',
    city: (profile as any).city || '',
    weddingDate: (profile as any).wedding_date || '',
    skinTone: (profile as any).skin_tone || '',
    createdAt: profile.created_at,
  };
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),
  setLoading: (isLoading) => set({ isLoading }),

  logout: async () => {
    console.log('[Auth] Logging out');
    await supabase.auth.signOut();
    set({ user: null, isAuthenticated: false });
  },

  refreshUser: async () => {
    console.log('[Auth] Refreshing user');
    const { data } = await supabase.auth.getUser();
    const authUser = data?.user ?? null;
    if (authUser) {
      try {
        const profile = await ensureProfileExists(authUser.id);
        set({ user: mapProfileToUser(profile), isAuthenticated: true });
      } catch (err) {
        console.error('[Auth] Failed to refresh user profile:', err);
        set({ user: null, isAuthenticated: false });
      }
    } else {
      set({ user: null, isAuthenticated: false });
    }
  },

  initialize: async () => {
    set({ isLoading: true });
    try {
      const { data } = await supabase.auth.getSession();
      const session = data?.session ?? null;
      if (session?.user) {
        try {
          const profile = await ensureProfileExists(session.user.id);
          set({ user: mapProfileToUser(profile), isAuthenticated: true });
          console.log('[Auth] User initialized from session:', session.user.email);
        } catch (err) {
          console.error('[Auth] Failed to load profile during init:', err);
          set({ isAuthenticated: false });
        }
      } else {
        console.log('[Auth] No session found on init');
      }
    } catch (err) {
      console.error('[Auth] Error checking session:', err);
    } finally {
      set({ isLoading: false });
    }

    // Listen for auth changes
    try {
      supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('[Auth] State change:', event, session?.user?.email);

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          if (session?.user) {
            try {
              const profile = await ensureProfileExists(session.user.id);
              set({ user: mapProfileToUser(profile), isAuthenticated: true });
              console.log('[Auth] User set from auth state change:', session.user.email);
            } catch (err) {
              console.error('[Auth] Failed to load profile after auth change:', err);
              set({ user: null, isAuthenticated: false });
            }
          }
        } else if (event === 'SIGNED_OUT') {
          console.log('[Auth] User signed out');
          set({ user: null, isAuthenticated: false });
        }
      });
    } catch (err) {
      console.error('[Auth] Error setting up auth listener:', err);
    }
  },
}));