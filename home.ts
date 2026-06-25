// ============== USER & AUTH ==============
export type UserRole = 'customer' | 'salon_owner' | 'admin';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  role: UserRole;
  avatar?: string;
  avatar_url?: string;
  weddingDate?: string;
  city?: string;
  skinTone?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
}

// ============== SALONS ==============
export type SubscriptionTier = 'free' | 'basic' | 'pro' | 'enterprise' | 'ELITE' | 'GROWTH' | 'STARTER';

export interface Salon {
  id: string;
  slug: string;
  name: string;
  latitude?: number | null;
  longitude?: number | null;
  owner_name?: string;
  ownerName?: string;
  owner_id?: string;
  description: string;
  longDescription?: string;
  city: string;
  area: string;
  address?: string;
  logo_url?: string;
  cover_url?: string;
  coverImage?: string;
  images?: string[];
  phone: string;
  email: string;
  rating: number;
  reviewCount: number;
  review_count?: number;
  startingPrice: number;
  tier: SubscriptionTier;
  subscription_tier?: SubscriptionTier;
  isVerified: boolean;
  status?: string;
  isAvailableThisWeek: boolean;
  amenities: string[];
  workingHours?: WorkingHours;
  is_active?: boolean;
  createdAt: string;
}

export interface WorkingHours {
  mon?: string;
  tue?: string;
  wed?: string;
  thu?: string;
  fri?: string;
  sat?: string;
  sun?: string;
}

// ============== ARTISTS ==============
export interface Artist {
  id: string;
  salonId: string;
  salon_id?: string;
  name: string;
  photo: string;
  photo_url?: string;
  specialty: string;
  experience: number;
  experience_years?: number;
  languages: string[];
  bio?: string;
  portfolioImages?: string[];
  isAvailable: boolean;
  is_active?: boolean;
}

// ============== SERVICES ==============
export interface Service {
  id: string;
  salonId: string;
  salon_id?: string;
  name: string;
  category: ServiceCategory;
  description: string;
  price: number;
  duration: number;
  duration_minutes?: number;
  is_popular?: boolean;
  isPopular?: boolean;
  is_active?: boolean;
}

export type ServiceCategory =
  | 'bridal'
  | 'mehendi'
  | 'hair'
  | 'makeup'
  | 'skincare'
  | 'party'
  | 'other'
  | 'Bridal makeup'
  | 'Hair styling'
  | 'Mehendi'
  | 'Pre-bridal care'
  | 'Home service'
  | 'Bridal party package'
  | 'Skin prep'
  | 'Bridal party';

// ============== PACKAGES ==============
export interface Package {
  id: string;
  salonId: string;
  salon_id?: string;
  name: string;
  description: string;
  whatIncludes?: string[];
  services_included?: string[];
  originalPrice: number;
  original_price?: number;
  discountedPrice: number;
  discounted_price?: number;
  savings: number;
  duration_days?: number;
  days?: PackageDay[];
  is_active?: boolean;
}

export interface PackageDay {
  day: string;
  label: string;
  services: string[];
}

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type BookingType = 'TRIAL' | 'FINAL';
export type PaymentStatus = 'pending' | 'partial' | 'paid' | 'refunded';

export interface Booking {
  id: string;
  userId: string;
  customer_id?: string;
  salonId: string;
  salon_id?: string;
  artistId?: string;
  artist_id?: string;
  packageId?: string;
  package_id?: string;
  bookingType?: BookingType;
  booking_type?: BookingType;
  status: BookingStatus;
  date: string;
  booking_date?: string;
  time: string;
  start_time?: string;
  end_time?: string;
  services?: Service[];
  totalAmount: number;
  total_amount?: number;
  amountPaid?: number;
  amount_paid?: number;
  paymentStatus?: PaymentStatus;
  payment_status?: PaymentStatus;
  cancellationReason?: string;
  cancellation_reason?: string;
  notes?: string;
  partyMembers?: PartyMember[];
  createdAt: string;
  customer_name?: string;
  salon_name?: string;
}

export interface PartyMember {
  name: string;
  relation: string;
  services: string[];
}

// ============== REVIEWS ==============
export interface Review {
  id: string;
  userId: string;
  customer_id?: string;
  userName: string;
  userPhoto?: string;
  salonId: string;
  salon_id?: string;
  bookingId: string;
  booking_id?: string;
  rating: number;
  comment: string;
  images?: string[];
  salonReply?: string;
  isFlagged?: boolean;
  is_flagged?: boolean;
  createdAt: string;
  salonName?: string;
  salonSlug?: string;
  salon_name?: string;
  salon_slug?: string;
}

// ============== AI STUDIO ==============

export type BridalStyle = 'Traditional North Indian' | 'Fusion modern' | 'Minimalist chic' | 'Heavy bridal';

export interface AIGeneratedLook {
  id: string;
  imageUrl: string;
  style: BridalStyle;
  features: string[];
}

// ============== SUBSCRIPTION ==============
export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  maxListings: number;
  maxPhotos: number;
  maxBookingsMonth?: number;
  maxArtists: number;
  aiLook: boolean;
  priorityPlacement: boolean;
  homepageFeatured: boolean;
  accountManager: boolean;
  commission: number;
  sameDayPayout: boolean;
}

// ============== DASHBOARD STATS ==============
export interface DashboardStats {
  todayBookings: number;
  thisWeekRevenue: number;
  avgRating: number;
  profileViews: number;
}

export interface AdminStats {
  totalSalons: number;
  totalBookingsToday: number;
  platformRevenue: number;
  pendingVerifications: number;
  flaggedReviews: number;
}

// ============== NOTIFICATION ==============
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'booking' | 'offer' | 'review' | 'system';
  isRead: boolean;
  createdAt: string;
}