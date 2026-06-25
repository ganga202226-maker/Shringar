import { supabase } from '../lib/supabase';
import type { Tables, TablesInsert, TablesUpdate } from '../types/database';

// ============== AUTH HELPERS ==============

export async function signUpWithEmail(email: string, password: string, userProfile: {
  name: string;
  phone?: string;
  role: 'customer' | 'salon_owner';
}) {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name: userProfile.name, phone: userProfile.phone, role: userProfile.role },
      emailRedirectTo: `${window.location.origin}/login`,
    },
  });
  if (error) throw error;

  // The DB trigger (on_auth_user_created -> handle_new_user) automatically
  // creates the profile in public.profiles within the same transaction.
  // The auth store's onAuthStateChange listener will pick up SIGNED_IN
  // and load the profile from there, so no need to call ensureProfileExists here.

  return data;
}

export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

export async function signInWithGoogle() {
  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/login`,
    },
  });
  if (error) throw error;
  return data;
}

export async function sendPasswordResetEmail(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/login`,
  });
  if (error) throw error;
}

// ============== PROFILES ==============

export async function getProfile(userId: string) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .single();
  if (error) throw error;
  return data;
}

export async function updateProfile(userId: string, updates: TablesUpdate<'profiles'>) {
  const { data, error } = await supabase
    .from('profiles')
    .update(updates)
    .eq('id', userId)
    .select()
    .single();
  if (error) throw error;
  return data;
}

/**
 * Ensures a profile exists for the given auth user.
 * Uses UPSERT so it gracefully handles both:
 *  - The DB trigger already created the profile (common case)
 *  - The trigger hasn't propagated yet (fallback)
 */
export async function ensureProfileExists(
  authUserId: string,
  metadata?: {
    email: string;
    name: string;
    phone: string;
    role: 'customer' | 'salon_owner' | 'admin';
  },
): Promise<Tables<'profiles'>> {
  console.log('[Auth] ensureProfileExists for user', authUserId);

  // First try to fetch existing profile (wait a tiny moment for the trigger)
  await new Promise((r) => setTimeout(r, 300));

  const { data: existingProfile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUserId)
    .single();

  if (existingProfile) {
    console.log('[Auth] Profile found for user', authUserId);
    return existingProfile;
  }

  // Profile doesn't exist — upsert instead of insert to avoid FK race conditions
  console.log('[Auth] Profile not found — upserting fallback profile for', authUserId);

  let profileData: TablesInsert<'profiles'>;

  if (metadata) {
    profileData = {
      id: authUserId,
      email: metadata.email,
      name: metadata.name,
      phone: metadata.phone || null,
      role: metadata.role || 'customer',
    };
  } else {
    const { data: sessionData } = await supabase.auth.getSession();
    const user = sessionData?.session?.user ?? null;
    if (!user) {
      throw new Error('No authenticated user found — cannot create fallback profile');
    }
    const m = user.user_metadata || {};
    profileData = {
      id: authUserId,
      email: user.email || '',
      name: (m.name as string) || '',
      phone: (m.phone as string) || null,
      role: (m.role as 'customer' | 'salon_owner') || 'customer',
    };
  }

  const { data: newProfile, error: upsertError } = await supabase
    .from('profiles')
    .upsert(profileData, { onConflict: 'id', ignoreDuplicates: false })
    .select()
    .single();

  if (upsertError) {
    console.error('[Auth] Failed to upsert profile:', upsertError);
    throw upsertError;
  }

  console.log('[Auth] Profile created via upsert fallback');
  return newProfile;
}