import { useEffect, useCallback, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';
import { notificationService } from '../services/notifications';
import { useAuthStore } from '../store/authStore';
import type { Notification } from '../types';
import type { RealtimePostgresChangesPayload } from '@supabase/supabase-js';
import toast from 'react-hot-toast';

type NotificationPayload = RealtimePostgresChangesPayload<{
  [key: string]: unknown;
}>;

export function useNotifications() {
  const { user } = useAuthStore();
  const userId = user?.id;
  const queryClient = useQueryClient();
  const lastToastRef = useRef<string>('');

  // Fetch notifications
  const { data: notifications = [] } = useQuery({
    queryKey: ['notifications', userId],
    queryFn: () => notificationService.getNotifications(userId!),
    enabled: !!userId,
    staleTime: 30_000,
  });

  // Unread count derived from data
  const unreadCount = notifications.filter((n) => !n.isRead).length;

  // Subscribe to Realtime INSERT events on notifications
  useEffect(() => {
    if (!userId) return;

    const channel = supabase
      .channel('notifications-channel')
      .on<NotificationPayload>(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const newNotif = payload.new as Record<string, unknown>;
          if (!newNotif || !newNotif.id) return;

          // Invalidate query to refetch latest list
          queryClient.invalidateQueries({ queryKey: ['notifications', userId] });

          // Show toast for new notification (debounce same title)
          const title = (newNotif.title as string) || '';
          if (title !== lastToastRef.current) {
            lastToastRef.current = title;
            toast(title, {
              icon: '🔔',
              duration: 4000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [userId, queryClient]);

  // Mark a single notification as read
  const { mutate: markAsRead } = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    },
  });

  // Mark all as read
  const { mutate: markAllAsRead } = useMutation({
    mutationFn: () => notificationService.markAllAsRead(userId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['notifications', userId] });
    },
  });

  return {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
  };
}
