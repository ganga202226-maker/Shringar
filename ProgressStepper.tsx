import { supabase } from '../lib/supabase';
import type { BridalStyle } from '../types';

export interface GeneratedLook {
  id: string;
  imageUrl: string;
  style: string;
  features: string[];
  makeupDescription?: string;
  colorScheme?: string;
}

export interface GenerateLooksResponse {
  looks: GeneratedLook[];
}

/**
 * Call the AI Studio Edge Function to generate bridal looks.
 */
export async function generateBridalLooks(
  photoFile: File,
  style: BridalStyle,
  skinTone?: string,
): Promise<GenerateLooksResponse> {
  // 1. Upload photo to Supabase Storage
  const fileName = `${crypto.randomUUID()}-${photoFile.name}`;
  const storagePath = `uploads/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('ai-studio')
    .upload(storagePath, photoFile, {
      cacheControl: '3600',
      upsert: false,
    });

  if (uploadError) {
    throw new Error(`Upload failed: ${uploadError.message}`);
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('ai-studio')
    .getPublicUrl(storagePath);

  const photoUrl = urlData.publicUrl;

  // 2. Call Edge Function — pass skinTone if available
  const { data, error } = await supabase.functions.invoke('ai-studio', {
    body: { photoUrl, style, skinTone },
  });

  if (error) {
    throw new Error(`AI generation failed: ${error.message}`);
  }

  return data as GenerateLooksResponse;
}