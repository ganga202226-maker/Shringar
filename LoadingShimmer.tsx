import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

/**
 * Upload a trial photo to Supabase Storage.
 * Returns the public URL of the uploaded image.
 */
export async function uploadTrialPhoto(
  bookingId: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<string> {
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `${bookingId}/${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('trial-photos')
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Upload failed:', error);
    throw new Error(error.message || 'Failed to upload photo');
  }

  // Get public URL
  const { data: urlData } = supabase.storage
    .from('trial-photos')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}

/**
 * Upload a profile/avatar photo to Supabase Storage.
 */
export async function uploadAvatar(
  userId: string,
  file: File
): Promise<string> {
  const fileExt = file.name.split('.').pop()?.toLowerCase() || 'jpg';
  const fileName = `avatars/${userId}/${Date.now()}.${fileExt}`;

  const { data, error } = await supabase.storage
    .from('avatars') // use dedicated avatars bucket
    .upload(fileName, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) {
    console.error('Avatar upload failed:', error);
    throw new Error(error.message || 'Failed to upload avatar');
  }

  const { data: urlData } = supabase.storage
    .from('avatars')
    .getPublicUrl(data.path);

  return urlData.publicUrl;
}