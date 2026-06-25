import { supabase } from '../lib/supabase';
import type { Tables } from '../types/database';
import type { Notification } from '../types';

function mapNotification(row: Tables<'notifications'>): Notification {
  return {
    id: row.id,
    userId: row.user_id,
    title: row.title,
    message: row.message,
    type: row.type as Notification['type'],
    isRead: row.is_read,
    createdAt: row.created_at,
  };
}

export const notificationService = {
  /**
   * Fetch all notifications for a user, newest first.
   */
  getNotifications: async (userId: string): Promise<Notification[]> => {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(mapNotification);
  },

  /**
   * Mark a single notification as read.
   */
  markAsRead: async (notificationId: string): Promise<void> => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) throw error;
  },

  /**
   * Mark all notifications for a user as read.
   */
  markAllAsRead: async (userId: string): Promise<void> => {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
  },
};
