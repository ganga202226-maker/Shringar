import { supabase } from '../lib/supabase';
import type { Tables, TablesInsert, TablesUpdate } from '../types/database';
import type { Salon, Artist, Service, Package, Review, Booking } from '../types';

// ============== HELPERS ==============

function mapSalon(row: Tables<'salons'>): Salon {
  return {
    id: row.id,
    slug: row.slug,
    name: row.name,
    ownerName: row.name,
    owner_id: row.owner_id,
    description: row.description || '',
    city: row.city,
    area: row.area || '',
    latitude: row.latitude,
    longitude: row.longitude,
    phone: row.phone || '',
    email: row.email || '',
    rating: 0,
    reviewCount: 0,
    review_count: 0,
    startingPrice: 0,
    tier: row.subscription_tier as Salon['tier'],
    subscription_tier: row.subscription_tier as Salon['subscription_tier'],
    isVerified: row.is_active,
    is_active: row.is_active,
    isAvailableThisWeek: true,
    amenities: (row.amenities as string[]) || [],
    coverImage: row.cover_url || '',
    cover_url: row.cover_url || '',
    logo_url: row.logo_url || '',
    createdAt: row.created_at,
  };
}

function mapArtist(row: Tables<'artists'>): Artist {
  return {
    id: row.id,
    salonId: row.salon_id,
    salon_id: row.salon_id,
    name: row.name,
    photo: row.photo_url || '',
    photo_url: row.photo_url || '',
    specialty: row.specialty || '',
    experience: row.experience_years || 0,
    experience_years: row.experience_years,
    languages: row.languages || [],
    bio: row.bio || '',
    isAvailable: row.is_active,
    is_active: row.is_active,
  };
}

function mapService(row: Tables<'services'>): Service {
  return {
    id: row.id,
    salonId: row.salon_id,
    salon_id: row.salon_id,
    name: row.name,
    category: row.category as Service['category'],
    description: row.description || '',
    price: row.price,
    duration: row.duration_minutes,
    duration_minutes: row.duration_minutes,
    isPopular: row.is_active,
    is_active: row.is_active,
  };
}

function mapPackage(row: Tables<'packages'>): Package {
  const originalPrice = row.original_price;
  const discountedPrice = row.discounted_price || row.original_price;
  return {
    id: row.id,
    salonId: row.salon_id,
    salon_id: row.salon_id,
    name: row.name,
    description: row.description || '',
    services_included: row.services_included || [],
    whatIncludes: row.services_included || [],
    originalPrice,
    original_price: row.original_price,
    discountedPrice,
    discounted_price: row.discounted_price,
    savings: originalPrice - discountedPrice,
    duration_days: row.duration_days,
    is_active: row.is_active,
  };
}

function mapBooking(row: Tables<'bookings'>): Booking {
  return {
    id: row.id,
    userId: row.customer_id,
    customer_id: row.customer_id,
    salonId: row.salon_id,
    salon_id: row.salon_id,
    artistId: row.artist_id || undefined,
    artist_id: row.artist_id || undefined,
    packageId: row.package_id || undefined,
    package_id: row.package_id || undefined,
    bookingType: (row.booking_type as Booking['bookingType']) || 'FINAL',
    booking_type: (row.booking_type as Booking['booking_type']) || 'FINAL',
    status: row.status as Booking['status'],
    date: row.booking_date,
    booking_date: row.booking_date,
    time: row.start_time,
    start_time: row.start_time,
    end_time: row.end_time,
    totalAmount: row.total_amount,
    total_amount: row.total_amount,
    amountPaid: row.amount_paid || 0,
    amount_paid: row.amount_paid || 0,
    paymentStatus: (row.payment_status as Booking['paymentStatus']) || 'pending',
    payment_status: (row.payment_status as Booking['payment_status']) || 'pending',
    cancellationReason: row.cancellation_reason || undefined,
    cancellation_reason: row.cancellation_reason || undefined,
    notes: row.notes || '',
    createdAt: row.created_at,
  };
}

function mapReview(row: Tables<'reviews'>): Review {
  return {
    id: row.id,
    userId: row.customer_id,
    customer_id: row.customer_id,
    userName: '',
    salonId: row.salon_id,
    salon_id: row.salon_id,
    bookingId: row.booking_id,
    booking_id: row.booking_id,
    rating: row.rating,
    comment: row.comment || '',
    createdAt: row.created_at,
  };
}

// ============== SALON SERVICES ==============

async function fetchSalonStats(salonId: string) {
  const { data, error } = await supabase
    .rpc('get_salon_stats', { p_salon_id: salonId });
  if (error) {
    console.warn('Failed to fetch salon stats:', error.message);
    return { avg_rating: 0, review_count: 0, starting_price: 0 };
  }
  return (data && data[0]) || { avg_rating: 0, review_count: 0, starting_price: 0 };
}

async function fetchSalonBookingCounts(): Promise<Record<string, number>> {
  const { data, error } = await supabase
    .rpc('get_salon_booking_counts');
  if (error) {
    console.warn('Failed to fetch booking counts:', error.message);
    return {};
  }
  const map: Record<string, number> = {};
  (data || []).forEach((row: any) => {
    map[row.salon_id] = Number(row.booking_count);
  });
  return map;
}

async function enrichSalon(salon: ReturnType<typeof mapSalon>) {
  const stats = await fetchSalonStats(salon.id);
  return {
    ...salon,
    rating: Math.round(stats.avg_rating * 10) / 10,
    reviewCount: stats.review_count,
    startingPrice: stats.starting_price,
  };
}

export interface SalonQueryParams {
  city?: string;
  area?: string;
  search?: string;
  amenities?: string[];
  minRating?: number;
  maxBudget?: number;
  sortBy?: 'best_match' | 'top_rated' | 'price_low' | 'most_booked' | 'nearest';
}

export const salonService = {
  // GET ALL SALONS
  getSalons: async (params?: SalonQueryParams) => {
    let query = supabase
      .from('salons')
      .select('*', { count: 'exact' })
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (params?.city) query = query.eq('city', params.city);
    if (params?.area) query = query.ilike('area', `%${params.area}%`);
    if (params?.search) {
      query = query.or(`name.ilike.%${params.search}%,description.ilike.%${params.search}%,area.ilike.%${params.search}%`);
    }

    const { data, error, count } = await query;
    if (error) throw error;
    let salons = data.map(mapSalon);

    // Filter by amenities (local filter since amenities is JSONB)
    if (params?.amenities && params.amenities.length > 0) {
      salons = salons.filter((s) =>
        params.amenities!.every((a) => (s.amenities || []).includes(a))
      );
    }

    // Enrich with stats
    const enriched = await Promise.all(salons.map(enrichSalon));

    // Local filters
    let filtered = enriched;
    if (params?.minRating && params.minRating > 0) {
      filtered = filtered.filter((s) => s.rating >= params.minRating!);
    }
    if (params?.maxBudget && params.maxBudget > 0) {
      filtered = filtered.filter((s) => s.startingPrice <= params.maxBudget!);
    }

    // Sorting
    if (params?.sortBy === 'top_rated') {
      filtered.sort((a, b) => b.rating - a.rating);
    } else if (params?.sortBy === 'price_low') {
      filtered.sort((a, b) => a.startingPrice - b.startingPrice);
    } else if (params?.sortBy === 'most_booked') {
      const bookingCounts = await fetchSalonBookingCounts();
      filtered.sort((a, b) => (bookingCounts[b.id] || 0) - (bookingCounts[a.id] || 0));
    }

    return { data: filtered, total: count || 0 };
  },

  // GET SALON BY SLUG
  getSalonBySlug: async (slug: string) => {
    const { data, error } = await supabase
      .from('salons')
      .select('*, reviews!reviews_salon_id_fkey(rating)')
      .eq('slug', slug)
      .single();
    if (error) throw error;

    const salon = mapSalon(data);
    // Calculate rating from inline reviews
    const reviews = (data as any).reviews || [];
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum: number, r: any) => sum + r.rating, 0);
      salon.rating = Math.round((totalRating / reviews.length) * 10) / 10;
      salon.reviewCount = reviews.length;
    }
    // Fetch stats for startingPrice
    const stats = await fetchSalonStats(salon.id);
    salon.startingPrice = stats.starting_price || salon.startingPrice;
    if (reviews.length === 0 && stats.avg_rating) {
      salon.rating = Math.round(stats.avg_rating * 10) / 10;
      salon.reviewCount = stats.review_count;
    }
    return salon;
  },

  // GET OWNER'S SALON
  getMySalon: async (ownerId: string) => {
    const { data, error } = await supabase
      .from('salons')
      .select('*')
      .eq('owner_id', ownerId)
      .single();
    if (error) throw error;
    const salon = mapSalon(data);
    const stats = await fetchSalonStats(salon.id);
    salon.startingPrice = stats.starting_price || salon.startingPrice;
    salon.rating = Math.round(stats.avg_rating * 10) / 10;
    salon.reviewCount = stats.review_count;
    return salon;
  },

  // CREATE SALON
  createSalon: async (salon: TablesInsert<'salons'>) => {
    const { data, error } = await supabase
      .from('salons')
      .insert(salon)
      .select()
      .single();
    if (error) throw error;
    return mapSalon(data);
  },

  // UPDATE SALON
  updateSalon: async (id: string, updates: TablesUpdate<'salons'>) => {
    const { data, error } = await supabase
      .from('salons')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return mapSalon(data);
  },

  // GET SALON SERVICES
  getSalonServices: async (salonId: string) => {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('salon_id', salonId)
      .eq('is_active', true)
      .order('name');
    if (error) throw error;
    return data.map(mapService);
  },

  // CREATE SERVICE
  createService: async (service: TablesInsert<'services'>) => {
    const { data, error } = await supabase
      .from('services')
      .insert(service)
      .select()
      .single();
    if (error) throw error;
    return mapService(data);
  },

  // UPDATE SERVICE
  updateService: async (id: string, updates: TablesUpdate<'services'>) => {
    const { data, error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return mapService(data);
  },

  // DELETE SERVICE
  deleteService: async (id: string) => {
    const { error } = await supabase.from('services').delete().eq('id', id);
    if (error) throw error;
  },

  // GET SALON ARTISTS
  getSalonArtists: async (salonId: string) => {
    const { data, error } = await supabase
      .from('artists')
      .select('*')
      .eq('salon_id', salonId)
      .order('name');
    if (error) throw error;
    return data.map(mapArtist);
  },

  // CREATE ARTIST
  createArtist: async (artist: TablesInsert<'artists'>) => {
    const { data, error } = await supabase
      .from('artists')
      .insert(artist)
      .select()
      .single();
    if (error) throw error;
    return mapArtist(data);
  },

  // UPDATE ARTIST
  updateArtist: async (id: string, updates: TablesUpdate<'artists'>) => {
    const { data, error } = await supabase
      .from('artists')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return mapArtist(data);
  },

  // DELETE ARTIST
  deleteArtist: async (id: string) => {
    const { error } = await supabase.from('artists').delete().eq('id', id);
    if (error) throw error;
  },

  // GET SALON PACKAGES
  getSalonPackages: async (salonId: string) => {
    const { data, error } = await supabase
      .from('packages')
      .select('*')
      .eq('salon_id', salonId)
      .eq('is_active', true)
      .order('name');
    if (error) throw error;
    return data.map(mapPackage);
  },

  // CREATE PACKAGE
  createPackage: async (pkg: TablesInsert<'packages'>) => {
    const { data, error } = await supabase
      .from('packages')
      .insert(pkg)
      .select()
      .single();
    if (error) throw error;
    return mapPackage(data);
  },

  // UPDATE PACKAGE
  updatePackage: async (id: string, updates: TablesUpdate<'packages'>) => {
    const { data, error } = await supabase
      .from('packages')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return mapPackage(data);
  },

  // DELETE PACKAGE
  deletePackage: async (id: string) => {
    const { error } = await supabase.from('packages').delete().eq('id', id);
    if (error) throw error;
  },

  // GET SALON REVIEWS
  getSalonReviews: async (salonId: string) => {
    const { data, error } = await supabase
      .from('reviews')
      .select('*, profiles!reviews_customer_id_fkey(name, avatar_url)')
      .eq('salon_id', salonId)
      .order('created_at', { ascending: false });
    if (error) throw error;

    return data.map((row) => {
      const review = mapReview(row);
      const profile = (row as any).profiles;
      review.userName = profile?.name || 'Anonymous';
      review.userPhoto = profile?.avatar_url || '';
      return review;
    });
  },

  // CREATE REVIEW
  createReview: async (review: TablesInsert<'reviews'>) => {
    const { data, error } = await supabase
      .from('reviews')
      .insert(review)
      .select()
      .single();
    if (error) throw error;
    return mapReview(data);
  },

  // GET PORTFOLIO IMAGES
  getPortfolioImages: async (salonId: string) => {
    const { data, error } = await supabase
      .from('portfolio_images')
      .select('*')
      .eq('salon_id', salonId)
      .order('created_at', { ascending: false });
    if (error) throw error;
    return data;
  },

  // CREATE PORTFOLIO IMAGE
  createPortfolioImage: async (image: TablesInsert<'portfolio_images'>) => {
    const { data, error } = await supabase
      .from('portfolio_images')
      .insert(image)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // DELETE PORTFOLIO IMAGE
  deletePortfolioImage: async (id: string) => {
    const { error } = await supabase.from('portfolio_images').delete().eq('id', id);
    if (error) throw error;
  },

  // WORKING HOURS
  getWorkingHours: async (salonId: string) => {
    const { data, error } = await supabase
      .from('working_hours')
      .select('*')
      .eq('salon_id', salonId)
      .order('day_of_week');
    if (error) throw error;
    return data;
  },

  upsertWorkingHours: async (hours: TablesInsert<'working_hours'>) => {
    const { data, error } = await supabase
      .from('working_hours')
      .upsert(hours)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  // TIME SLOTS
  getTimeSlots: async (salonId: string, date: string) => {
    const { data, error } = await supabase
      .from('time_slots')
      .select('*')
      .eq('salon_id', salonId)
      .eq('date', date)
      .order('start_time');
    if (error) throw error;
    return data;
  },

  createTimeSlot: async (slot: TablesInsert<'time_slots'>) => {
    const { data, error } = await supabase
      .from('time_slots')
      .insert(slot)
      .select()
      .single();
    if (error) throw error;
    return data;
  },

  deleteTimeSlot: async (id: string) => {
    const { error } = await supabase.from('time_slots').delete().eq('id', id);
    if (error) throw error;
  },
};

// ============== BOOKING SERVICES ==============

export const bookingService = {
  getMyBookings: async (userId: string) => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, salons!bookings_salon_id_fkey(name, slug)')
      .eq('customer_id', userId)
      .order('booking_date', { ascending: false });
    if (error) throw error;

    return data.map((row) => {
      const booking = mapBooking(row);
      const salon = (row as any).salons;
      booking.salon_name = salon?.name || '';
      booking.salon_slug = salon?.slug || '';
      return booking;
    });
  },

  getSalonBookings: async (salonId: string) => {
    const { data, error } = await supabase
      .from('bookings')
      .select('*, profiles!bookings_customer_id_fkey(name)')
      .eq('salon_id', salonId)
      .order('booking_date', { ascending: false });
    if (error) throw error;

    return data.map((row) => {
      const booking = mapBooking(row);
      const profile = (row as any).profiles;
      booking.customer_name = profile?.name || '';
      return booking;
    });
  },

  createBooking: async (booking: TablesInsert<'bookings'>) => {
    const { data, error } = await supabase
      .from('bookings')
      .insert(booking)
      .select()
      .single();
    if (error) throw error;
    return mapBooking(data);
  },

  updateBooking: async (id: string, updates: TablesUpdate<'bookings'>) => {
    const { data, error } = await supabase
      .from('bookings')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return mapBooking(data);
  },

  cancelBooking: async (id: string) => {
    const { data, error } = await supabase
      .from('bookings')
      .update({ status: 'cancelled' })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return mapBooking(data);
  },
};

// ============== DASHBOARD STATS ==============

export const dashboardService = {
  getOverviewStats: async (salonId: string) => {
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const [todayBookings, weekBookings, reviewsResult, portfolioCount] = await Promise.all([
      supabase
        .from('bookings')
        .select('id', { count: 'exact' })
        .eq('salon_id', salonId)
        .eq('booking_date', today),
      supabase
        .from('bookings')
        .select('total_amount')
        .eq('salon_id', salonId)
        .gte('booking_date', weekAgo)
        .lte('booking_date', today),
      supabase
        .from('reviews')
        .select('rating')
        .eq('salon_id', salonId),
      supabase
        .from('portfolio_images')
        .select('id', { count: 'exact' })
        .eq('salon_id', salonId),
    ]);

    const weeklyRevenue = (weekBookings.data || []).reduce(
      (sum, b) => sum + (b.total_amount || 0),
      0
    );

    const avgRating = (reviewsResult.data || []).length > 0
      ? (reviewsResult.data || []).reduce((sum, r) => sum + r.rating, 0) / (reviewsResult.data || []).length
      : 0;

    return {
      todayBookings: todayBookings.count || 0,
      thisWeekRevenue: weeklyRevenue,
      avgRating: Math.round(avgRating * 10) / 10,
      profileViews: portfolioCount.count || 0,
    };
  },

  getAnalytics: async (salonId: string, period: 'week' | '6months' = 'week') => {
    const now = new Date();
    const startDate = period === 'week'
      ? new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      : new Date(now.getTime() - 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    const today = now.toISOString().split('T')[0];

    const { data: bookings } = await supabase
      .from('bookings')
      .select('booking_date, total_amount, status')
      .eq('salon_id', salonId)
      .gte('booking_date', startDate)
      .lte('booking_date', today)
      .order('booking_date');

    const { data: services } = await supabase
      .from('services')
      .select('category')
      .eq('salon_id', salonId);

    return { bookings: bookings || [], services: services || [] };
  },
};