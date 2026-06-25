import { supabase } from '../lib/supabase';
import type { Review } from '../types';

function mapReview(row: any): Review {
  return {
    id: row.id,
    userId: row.customer_id,
    customer_id: row.customer_id,
    userName: row.customer_name || 'Anonymous',
    userPhoto: row.avatar_url || '',
    salonId: row.salon_id,
    salon_id: row.salon_id,
    bookingId: row.booking_id || '',
    booking_id: row.booking_id || '',
    rating: row.rating,
    comment: row.comment || '',
    createdAt: row.created_at,
    salonName: row.salon_name,
    salonSlug: row.salon_slug,
  };
}

export const homeService = {
  // Get category counts for the services section
  getCategoryCounts: async () => {
    const { data, error } = await supabase
      .from('services')
      .select('category')
      .eq('is_active', true);
    if (error) throw error;

    const counts: Record<string, number> = {};
    (data || []).forEach((svc) => {
      const cat = svc.category;
      counts[cat] = (counts[cat] || 0) + 1;
    });

    // Map category keys to service labels used on the home page
    const labelMap: Record<string, { label: string; icon: string }> = {
      'Bridal makeup': { label: 'Bridal Makeup', icon: 'makeup' },
      'Hair styling': { label: 'Hair & Styling', icon: 'hair' },
      'Mehendi': { label: 'Mehendi', icon: 'mehendi' },
      'Pre-bridal care': { label: 'Pre-bridal Care', icon: 'prebridal' },
      'Home service': { label: 'Home Service', icon: 'home' },
      'Bridal party package': { label: 'Bridal Party Package', icon: 'party' },
      'Bridal party': { label: 'Bridal Party Package', icon: 'party' },
      'Skin prep': { label: 'Pre-bridal Care', icon: 'prebridal' },
    };

    const aggregated: Record<string, { label: string; count: number }> = {};
    Object.entries(counts).forEach(([cat, count]) => {
      const mapped = labelMap[cat] || { label: cat, icon: 'other' };
      if (aggregated[mapped.label]) {
        aggregated[mapped.label].count += count;
      } else {
        aggregated[mapped.label] = { label: mapped.label, count };
      }
    });

    // Count distinct salons offering each service type
    const { data: salonServices } = await supabase
      .from('services')
      .select('salon_id, category')
      .eq('is_active', true);

    const salonCounts: Record<string, Set<string>> = {};
    (salonServices || []).forEach((svc) => {
      const cat = svc.category;
      const mapped = labelMap[cat] || { label: cat, icon: 'other' };
      if (!salonCounts[mapped.label]) salonCounts[mapped.label] = new Set();
      salonCounts[mapped.label].add(svc.salon_id);
    });

    return Object.fromEntries(
      Object.entries(salonCounts).map(([label, ids]) => [label, ids.size])
    );
  },

  // Get latest reviews for testimonials
  getLatestReviews: async (limit: number = 6) => {
    const { data, error } = await supabase
      .from('reviews')
      .select(`
        *,
        profiles!reviews_customer_id_fkey(name, avatar_url),
        salons!reviews_salon_id_fkey(name, slug)
      `)
      .not('comment', 'is', null)
      .order('created_at', { ascending: false })
      .limit(limit);
    if (error) throw error;

    return (data || []).map((row: any) => ({
      id: row.id,
      rating: row.rating,
      comment: row.comment,
      customer_name: row.profiles?.name || 'Anonymous',
      avatar_url: row.profiles?.avatar_url || '',
      salon_name: row.salons?.name || '',
      salon_slug: row.salons?.slug || '',
    }));
  },

  // Get aggregate stats for hero
  getHeroStats: async () => {
    const [artistResult, bookingResult, salonResult] = await Promise.all([
      supabase
        .from('artists')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true),
      supabase
        .from('bookings')
        .select('id', { count: 'exact', head: true })
        .in('status', ['confirmed', 'completed']),
      supabase
        .from('salons')
        .select('id', { count: 'exact', head: true })
        .eq('is_active', true),
    ]);

    return {
      artistCount: artistResult.count || 30,
      bookingCount: bookingResult.count || 10,
      salonCount: salonResult.count || 10,
    };
  },
};
