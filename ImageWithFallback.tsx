import { supabase } from '../lib/supabase';
import type { AIGeneratedLook } from '../types';

export interface SavedLook {
  id: string;
  userId: string;
  imageUrl: string;
  style: string;
  features: string[];
  makeupDescription?: string;
  colorScheme?: string;
  sourcePhotoUrl?: string;
  createdAt: string;
}

export const savedLooksService = {
  /** Get all saved looks for current user */
  getMyLooks: async (userId: string): Promise<SavedLook[]> => {
    const { data, error } = await supabase
      .from('saved_looks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map((row: any) => ({
      id: row.id,
      userId: row.user_id,
      imageUrl: row.image_url,
      style: row.style,
      features: row.features || [],
      makeupDescription: row.makeup_description || '',
      colorScheme: row.color_scheme || '',
      sourcePhotoUrl: row.source_photo_url || '',
      createdAt: row.created_at,
    }));
  },

  /** Save an AI-generated look */
  saveLook: async (look: {
    userId: string;
    imageUrl: string;
    style: string;
    features: string[];
    makeupDescription?: string;
    colorScheme?: string;
    sourcePhotoUrl?: string;
  }): Promise<SavedLook> => {
    const { data, error } = await supabase
      .from('saved_looks')
      .insert({
        user_id: look.userId,
        image_url: look.imageUrl,
        style: look.style,
        features: look.features,
        makeup_description: look.makeupDescription || null,
        color_scheme: look.colorScheme || null,
        source_photo_url: look.sourcePhotoUrl || null,
      })
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      userId: data.user_id,
      imageUrl: data.image_url,
      style: data.style,
      features: data.features || [],
      makeupDescription: data.makeup_description || '',
      colorScheme: data.color_scheme || '',
      sourcePhotoUrl: data.source_photo_url || '',
      createdAt: data.created_at,
    };
  },

  /** Delete a saved look */
  deleteLook: async (id: string): Promise<void> => {
    const { error } = await supabase
      .from('saved_looks')
      .delete()
      .eq('id', id);

    if (error) throw error;
  },
};