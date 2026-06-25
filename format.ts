import React, { useState, lazy, Suspense } from 'react';
import { motion } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import {
  Star,
  MapPin,
  Check,
  Heart,
  Clock,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
  Calendar,
  Grid3X3,
  List,
  Shield,
  Award,
  Users,
  Sparkles,
  Wifi,
  Car,
  Home,
  Scissors,
  Palette,
  Navigation,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { StarRating } from '../components/ui/StarRating';
import { ReviewCard } from '../components/shared/ReviewCard';
import { ArtistCard } from '../components/shared/ArtistCard';
import { PackageCard } from '../components/shared/PackageCard';
import { Modal } from '../components/ui/Modal';
import { LoadingShimmer } from '../components/ui/LoadingShimmer';
import { BookingFlowModal } from '../components/shared/BookingFlowModal';
import { useWishlistStore } from '../store/wishlistStore';
import { formatPrice, formatRating } from '../utils/format';
import { cn } from '../utils/cn';
import { resolveImage } from '../utils/images';
import { useSalonBySlug, useSalonArtists, useSalonServices, useSalonPackages, useSalonReviews, useWorkingHours, usePortfolioImages } from '../hooks/useSalon';
import type { Review } from '../types';

const MapViewLazy = lazy(() => import('../components/shared/MapView'));

/** A single-marker static map shown in the salon overview sidebar */
function MapViewStatic({ salon }: { salon: import('../types').Salon }) {
  const hasCoords = salon.latitude != null && salon.longitude != null;
  if (!hasCoords) return null;
  return (
    <MapViewLazy
      salons={[salon]}
      height="180px"
      selectedSalonId={salon.id}
    />
  );
}

type Tab = 'overview' | 'services' | 'artists' | 'packages' | 'reviews';

export default function SalonProfilePage() {
  const { slug } = useParams<{ slug: string }>();
  const [activeTab, setActiveTab] = useState<Tab>('overview');
  const { isSaved, toggleSalon } = useWishlistStore();
  const [showLightbox, setShowLightbox] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState(0);
  const [showBookingModal, setShowBookingModal] = useState(false);

  const { data: salon, isLoading: salonLoading } = useSalonBySlug(slug);
  const { data: artists = [] } = useSalonArtists(salon?.id);
  const { data: services = [] } = useSalonServices(salon?.id);
  const { data: packages = [] } = useSalonPackages(salon?.id);
  const { data: reviews = [] } = useSalonReviews(salon?.id);
  const { data: workingHours = [] } = useWorkingHours(salon?.id);
  const { data: portfolioImages = [] } = usePortfolioImages(salon?.id);

  const saved = isSaved(salon?.id || '');

  const DAY_NAMES = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const tabs: { id: Tab; label: string }[] = [
    { id: 'overview', label: 'Overview' },
    { id: 'services', label: 'Services' },
    { id: 'artists', label: 'Artists' },
    { id: 'packages', label: 'Packages' },
    { id: 'reviews', label: 'Reviews' },
  ];

  if (salonLoading) {
    return (
      <div className="min-h-screen pt-16 md:pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
          <LoadingShimmer className="h-72 w-full rounded-xl" />
          <div className="mt-6 space-y-3">
            <LoadingShimmer className="h-8 w-64" />
            <LoadingShimmer className="h-4 w-96" />
          </div>
        </div>
      </div>
    );
  }

  if (!salon) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <h1 className="font-heading text-3xl text-rose-800 mb-2">Salon not found</h1>
          <p className="text-ivory-600">The salon you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  const portfolioUrls = portfolioImages.map((img: any) => img.image_url).filter(Boolean);
  const allImages = [salon.coverImage, ...portfolioUrls].filter(Boolean);
  const allDisplayImages = allImages.length > 0
    ? allImages
    : [resolveImage(null, 'salon', salon.id), ...Array.from({ length: 4 }, (_, i) => `https://images.unsplash.com/photo-${i % 2 === 0 ? '1560066984-138dadb4c035' : '1522337360788-8b13dee7a37e'}?w=600&q=80`)];
  const hasMultipleImages = allDisplayImages.length > 1;
  const tierVariant = salon.tier === 'ELITE' || salon.tier === 'enterprise' ? 'gold' as const : 'rose' as const;

  const ratingDist = [0, 0, 0, 0, 0];
  reviews.forEach((r: Review) => {
    if (r.rating >= 1 && r.rating <= 5) ratingDist[5 - r.rating]++;
  });
  const totalR = reviews.length || 1;

  return (
    <div className="min-h-screen pt-16 md:pt-20">
      <Helmet>
        <title>{salon.name} — Shringar</title>
        <meta name="description" content={salon.description} />
      </Helmet>

      {/* Sticky Booking Bar - Desktop */}
      <div className="hidden md:block fixed top-20 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-b border-ivory-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h2 className="font-heading text-lg text-ivory-900">{salon.name}</h2>
            {salon.isAvailableThisWeek && (
              <Badge variant="success">Available this week</Badge>
            )}
          </div>
          <div className="flex items-center gap-4">
            <span className="text-lg font-semibold text-rose-400">
              From {formatPrice(salon.startingPrice)}
            </span>
            <Button variant="secondary" size="sm" onClick={() => toggleSalon(salon.id)}>
              <Heart className={cn('w-4 h-4 mr-1.5', saved && 'fill-rose-400 text-rose-400')} />
              {saved ? 'Saved' : 'Save'}
            </Button>
            <Button variant="primary" size="sm" onClick={() => setShowBookingModal(true)}>Book Now</Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 lg:pt-6">
        {/* Gallery Hero */}
        <div className="relative rounded-xl overflow-hidden mb-8">
          {hasMultipleImages ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2 md:gap-3">
              <div className="md:col-span-2 md:row-span-2">
                <img
                  src={allDisplayImages[0]}
                  alt={salon.name}
                  className="w-full h-64 md:h-full object-cover cursor-pointer hover:scale-105 transition-transform duration-500"
                  onClick={() => { setShowLightbox(true); setLightboxIndex(0); }}
                  onError={(e) => { (e.target as HTMLImageElement).src = resolveImage(null, 'salon', salon.id); }}
                />
              </div>
              {allDisplayImages.slice(1, 5).map((img, i) => (
                <div key={i} className="hidden md:block">
                  <img
                    src={img}
                    alt={`${salon.name} ${i + 1}`}
                    className="w-full h-32 object-cover cursor-pointer hover:scale-105 transition-transform duration-500"
                    onClick={() => { setShowLightbox(true); setLightboxIndex(i + 1); }}
                    onError={(e) => { (e.target as HTMLImageElement).src = resolveImage(null, 'portfolio'); }}
                  />
                </div>
              ))}
            </div>
          ) : (
            <img
              src={allDisplayImages[0]}
              alt={salon.name}
              className="w-full h-72 md:h-96 object-cover cursor-pointer"
              onClick={() => setShowLightbox(true)}
              onError={(e) => { (e.target as HTMLImageElement).src = resolveImage(null, 'salon', salon.id); }}
            />
          )}
          {allDisplayImages.length > 1 && (
            <button
              onClick={() => setShowLightbox(true)}
              className="hidden md:flex absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-full px-4 py-2 text-sm font-medium text-ivory-900 hover:bg-white transition-colors items-center gap-1"
            >
              <Grid3X3 className="w-4 h-4" /> View all {allDisplayImages.length} photos
            </button>
          )}
        </div>

        {/* Info Row */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 flex-wrap mb-2">
              <h1 className="font-heading text-2xl md:text-3xl text-rose-800">{salon.name}</h1>
              {salon.isVerified && (
                <Badge variant="gold">
                  <Shield className="w-3 h-3 inline mr-0.5" /> Verified
                </Badge>
              )}
              <Badge variant={tierVariant}>
                <Award className="w-3 h-3 inline mr-0.5" /> {salon.tier.charAt(0).toUpperCase() + salon.tier.slice(1).toLowerCase()}
              </Badge>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-sm text-ivory-600">
              <StarRating rating={salon.rating} reviewCount={salon.reviewCount} />
              <span className="text-ivory-200">|</span>
              <MapPin className="w-4 h-4" />
              <span>{salon.area}, {salon.city}</span>
              <a href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(salon.name + ' ' + salon.area + ' ' + salon.city)}`} target="_blank" rel="noopener noreferrer" className="text-rose-400 hover:text-rose-600 text-xs">Get directions</a>
            </div>
          </div>

          <div className="hidden md:flex gap-2">
            <Button variant="secondary" size="sm" onClick={() => toggleSalon(salon.id)}>
              <Heart className={cn('w-4 h-4 mr-1.5', saved && 'fill-rose-400 text-rose-400')} />
              Save
            </Button>
            <Button variant="primary" size="sm" onClick={() => setShowBookingModal(true)}>Book Now</Button>
          </div>
        </div>

        {/* Tabs */}
        <div className="border-b border-ivory-200 mb-8 overflow-x-auto hide-scrollbar">
          <div className="flex gap-6 min-w-max">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={cn(
                  'pb-3 text-sm font-medium transition-colors whitespace-nowrap cursor-pointer',
                  activeTab === tab.id
                    ? 'nav-active'
                    : 'text-ivory-600 hover:text-rose-400'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          {/* ═══ OVERVIEW ═══ */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-8">
                <div>
                  <h3 className="font-heading text-xl text-ivory-900 mb-3">About</h3>
                  <p className="text-ivory-600 leading-relaxed whitespace-pre-line">
                    {salon.longDescription || salon.description}
                  </p>
                </div>

                <div>
                  <h3 className="font-heading text-xl text-ivory-900 mb-3">Amenities</h3>
                  <div className="flex flex-wrap gap-2">
                    {(salon.amenities || []).map((amenity: string) => (
                      <Badge key={amenity} variant="rose">
                        {amenity.toLowerCase().includes('air') || amenity === 'AC' ? <Wifi className="w-3 h-3 inline mr-1" /> : null}
                        {amenity.toLowerCase().includes('parking') ? <Car className="w-3 h-3 inline mr-1" /> : null}
                        {amenity.toLowerCase().includes('home') ? <Home className="w-3 h-3 inline mr-1" /> : null}
                        {amenity.toLowerCase().includes('trial') ? <Calendar className="w-3 h-3 inline mr-1" /> : null}
                        {amenity.toLowerCase().includes('wheelchair') || amenity.toLowerCase().includes('accessible') ? <Users className="w-3 h-3 inline mr-1" /> : null}
                        {amenity}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="font-heading text-xl text-ivory-900 mb-3">Working Hours</h3>
                  <div className="card p-4 max-w-md">
                    {workingHours.length > 0 ? (
                      workingHours.map((wh: any) => (
                        <div key={wh.id} className="flex justify-between py-1.5 border-b border-ivory-100 last:border-none">
                          <span className="text-sm font-medium text-ivory-900 capitalize">
                            {DAY_NAMES[wh.day_of_week]?.slice(0, 3) || 'N/A'}
                          </span>
                          <span className={cn(
                            'text-sm',
                            wh.is_closed ? 'text-rose-400' : 'text-ivory-600'
                          )}>
                            {wh.is_closed ? 'Closed' : `${wh.open_time} — ${wh.close_time}`}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-sm text-ivory-600">Hours not yet configured</p>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="card p-5 text-center">
                  <p className="text-3xl font-bold text-rose-400">{formatRating(salon.rating)}</p>
                  <StarRating rating={salon.rating} size="sm" />
                  <p className="text-xs text-ivory-600 mt-1">{salon.reviewCount} reviews</p>
                </div>
                <div className="card p-4 space-y-3">
                  {salon.phone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="w-4 h-4 text-rose-400" />
                      <span className="text-ivory-900">{salon.phone}</span>
                    </div>
                  )}
                  {salon.email && (
                    <div className="flex items-center gap-2 text-sm">
                      <Mail className="w-4 h-4 text-rose-400" />
                      <span className="text-ivory-900">{salon.email}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-rose-400" />
                    <span className="text-ivory-900">{salon.area}, {salon.city}</span>
                  </div>
                </div>

                {/* Location Map */}
                {(salon.latitude != null && salon.longitude != null) || salon.area ? (
                  <div className="card overflow-hidden">
                    <div className="p-3 flex items-center justify-between border-b border-ivory-100">
                      <h4 className="text-sm font-semibold text-ivory-900 flex items-center gap-1.5">
                        <Navigation className="w-4 h-4 text-rose-400" /> Location
                      </h4>
                      <a
                        href={`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(salon.name + ' ' + salon.area + ' ' + salon.city)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-rose-400 hover:text-rose-600 font-medium"
                      >
                        Get directions
                      </a>
                    </div>
                    <Suspense fallback={<div className="h-40 bg-ivory-50 shimmer" />}>
                      <MapViewStatic salon={salon} />
                    </Suspense>
                  </div>
                ) : null}
              </div>
            </div>
          )}

          {/* ═══ SERVICES ═══ */}
          {activeTab === 'services' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {services.length > 0 ? services.map((service: any) => (
                <div key={service.id} className="card p-4 flex items-start justify-between gap-4 hover:border-rose-400 transition-colors">
                  <div>
                    <h4 className="font-medium text-ivory-900">{service.name}</h4>
                    <p className="text-sm text-ivory-600 mt-1">{service.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-ivory-600">
                      <Clock className="w-3 h-3" /> {service.duration_minutes || service.duration} min
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="font-semibold text-rose-400">{formatPrice(service.price)}</p>
                    <button className="mt-2 text-xs text-rose-400 hover:text-rose-600 font-medium">
                      + Add to package
                    </button>
                  </div>
                </div>
              )) : (
                <div className="col-span-2 text-center py-12 text-ivory-600">
                  <Scissors className="w-12 h-12 mx-auto mb-3 text-ivory-400" />
                  <p>No services listed yet</p>
                </div>
              )}
            </div>
          )}

          {/* ═══ ARTISTS ═══ */}
          {activeTab === 'artists' && (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {artists.length > 0 ? artists.map((artist: any) => (
                <ArtistCard key={artist.id} artist={artist} salonSlug={slug} />
              )) : (
                <div className="col-span-full text-center py-12 text-ivory-600">
                  <Users className="w-12 h-12 mx-auto mb-3 text-ivory-400" />
                  <p>No artists listed yet</p>
                </div>
              )}
            </div>
          )}

          {/* ═══ PACKAGES ═══ */}
          {activeTab === 'packages' && (
            <div className="space-y-6">
              {packages.length > 0 ? packages.map((pkg: any) => (
                <PackageCard key={pkg.id} pkg={pkg} onSelect={() => {}} />
              )) : (
                <div className="text-center py-12 text-ivory-600">
                  <Sparkles className="w-12 h-12 mx-auto mb-3 text-ivory-400" />
                  <p>No packages available yet</p>
                </div>
              )}
            </div>
          )}

          {/* ═══ REVIEWS ═══ */}
          {activeTab === 'reviews' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 space-y-4">
                {reviews.length > 0 ? reviews.map((review: any) => (
                  <ReviewCard key={review.id} review={review} />
                )) : (
                  <div className="text-center py-12 text-ivory-600">
                    <Star className="w-12 h-12 mx-auto mb-3 text-ivory-400" />
                    <p>No reviews yet. Be the first to review!</p>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div className="card p-5 text-center">
                  <p className="text-4xl font-bold text-rose-400">{formatRating(salon.rating)}</p>
                  <StarRating rating={salon.rating} size="md" />
                  <p className="text-sm text-ivory-600 mt-1">{salon.reviewCount} reviews</p>
                </div>

                {reviews.length > 0 && (
                  <div className="card p-5 space-y-3">
                    {[5, 4, 3, 2, 1].map((star) => {
                      const count = ratingDist[5 - star];
                      const pct = Math.round((count / totalR) * 100);
                      return (
                        <div key={star} className="flex items-center gap-2">
                          <span className="text-sm text-ivory-600 w-6">{star}</span>
                          <Star className="w-4 h-4 fill-gold-200 text-gold-200" />
                          <div className="flex-1 h-2 rounded-full bg-ivory-100 overflow-hidden">
                            <div
                              className="h-full rounded-full bg-gold-200 transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                          <span className="text-xs text-ivory-600 w-8 text-right">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </div>

      {/* Mobile Bottom Booking Bar */}
      <div className="md:hidden fixed bottom-16 left-0 right-0 z-30 bg-white border-t border-ivory-200 px-4 py-3 flex items-center justify-between gap-3">
        <div>
          <span className="text-sm text-ivory-600">From</span>
          <span className="text-lg font-bold text-rose-400 ml-1">{formatPrice(salon.startingPrice)}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => toggleSalon(salon.id)}
            className="p-2 rounded-full border border-ivory-200 hover:bg-ivory-50 transition-colors cursor-pointer"
          >
            <Heart className={cn('w-5 h-5', saved ? 'fill-rose-400 text-rose-400' : 'text-ivory-600')} />
          </button>
          <Button variant="primary" size="sm" className="px-8" onClick={() => setShowBookingModal(true)}>Book Now</Button>
        </div>
      </div>

      {/* Booking Flow Modal */}
      {salon && (
        <BookingFlowModal
          isOpen={showBookingModal}
          onClose={() => setShowBookingModal(false)}
          salon={salon}
        />
      )}

      {/* Lightbox Modal */}
      {showLightbox && allDisplayImages.length > 0 && (
        <Modal isOpen={showLightbox} onClose={() => setShowLightbox(false)} size="xl">
          <div className="relative">
            <img
              src={allDisplayImages[lightboxIndex]}
              alt="Salon gallery"
              className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
            />
            <div className="flex items-center justify-between mt-4">
              <button
                onClick={() => setLightboxIndex(prev => prev > 0 ? prev - 1 : allDisplayImages.length - 1)}
                className="p-2 rounded-full hover:bg-ivory-100 cursor-pointer"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <span className="text-sm text-ivory-600">
                {lightboxIndex + 1} / {allDisplayImages.length}
              </span>
              <button
                onClick={() => setLightboxIndex(prev => prev < allDisplayImages.length - 1 ? prev + 1 : 0)}
                className="p-2 rounded-full hover:bg-ivory-100 cursor-pointer"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
