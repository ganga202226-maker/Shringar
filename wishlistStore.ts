import React, { useState, useMemo, lazy, Suspense } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useSearchParams } from 'react-router-dom';
import {
  SlidersHorizontal,
  X,
  Map,
  Grid3X3,
  ChevronDown,
  Star,
  Wifi,
  Car,
  Home,
  Scissors,
  Check,
  MapPin,
} from 'lucide-react';
import { Helmet } from 'react-helmet-async';
import { SalonCard } from '../components/shared/SalonCard';
import { Button } from '../components/ui/Button';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingShimmer } from '../components/ui/LoadingShimmer';
import { useSalons } from '../hooks/useSalon';
import { cn } from '../utils/cn';
import { DELHI_AREAS } from '../utils/delhiAreas';
import type { SalonQueryParams } from '../services/salons';

const MapView = lazy(() => import('../components/shared/MapView'));

const AMENITY_OPTIONS = [
  { value: 'Air conditioning', label: 'AC', icon: Wifi },
  { value: 'Parking', label: 'Parking', icon: Car },
  { value: 'Home service', label: 'Home Service', icon: Home },
  { value: 'Bridal trial', label: 'Bridal Trial', icon: Scissors },
  { value: 'Wheelchair accessible', label: 'Wheelchair Access', icon: null },
];

const sortOptions = [
  { value: 'best_match', label: 'Best match' },
  { value: 'top_rated', label: 'Top rated' },
  { value: 'price_low', label: 'Price: low–high' },
  { value: 'most_booked', label: 'Most booked' },
  { value: 'nearest', label: 'Nearest' },
];

const ratingOptions = [
  { value: 0, label: 'Any' },
  { value: 3, label: '3+' },
  { value: 4, label: '4+' },
  { value: 4.5, label: '4.5+' },
];

export default function SearchPage() {
  const [searchParams] = useSearchParams();
  const [viewMode, setViewMode] = useState<'grid' | 'map'>('grid');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [sortBy, setSortBy] = useState<string>('best_match');
  const [selectedAmenities, setSelectedAmenities] = useState<string[]>([]);
  const [minRating, setMinRating] = useState<number>(0);
  const [budgetMax, setBudgetMax] = useState<number>(100000);
  const [selectedArea, setSelectedArea] = useState<string>('');
  const searchQuery = searchParams.get('search') || undefined;

  const queryParams: SalonQueryParams = useMemo(() => ({
    search: searchQuery,
    area: selectedArea || undefined,
    amenities: selectedAmenities.length > 0 ? selectedAmenities : undefined,
    minRating: minRating > 0 ? minRating : undefined,
    maxBudget: budgetMax < 100000 ? budgetMax : undefined,
    sortBy: sortBy as SalonQueryParams['sortBy'],
  }), [searchQuery, selectedArea, selectedAmenities, minRating, budgetMax, sortBy]);

  const { data: salonsData, isLoading } = useSalons(queryParams);
  const salons = salonsData?.data || [];
  const totalCount = salonsData?.total || 0;

  const toggleAmenity = (amenity: string) => {
    setSelectedAmenities(prev =>
      prev.includes(amenity) ? prev.filter(a => a !== amenity) : [...prev, amenity]
    );
  };

  const clearFilters = () => {
    setSelectedAmenities([]);
    setMinRating(0);
    setBudgetMax(100000);
    setSelectedArea('');
  };

  const hasActiveFilters = selectedAmenities.length > 0 || minRating > 0 || budgetMax < 100000 || selectedArea !== '';

  const FilterContent = () => (
    <div className="space-y-6">
      {/* Location */}
      <div>
        <h4 className="text-sm font-semibold text-ivory-900 mb-3 flex items-center gap-1.5">
          <MapPin className="w-4 h-4 text-rose-400" /> Location
        </h4>
        <select
          value={selectedArea}
          onChange={(e) => setSelectedArea(e.target.value)}
          className="w-full input-field text-sm"
        >
          <option value="">All areas in Delhi</option>
          {DELHI_AREAS.map(area => (
            <option key={area.name} value={area.name}>{area.name}</option>
          ))}
        </select>
      </div>

      <hr className="border-ivory-200" />

      {/* Budget */}
      <div>
        <h4 className="text-sm font-semibold text-ivory-900 mb-3">Budget Range</h4>
        <input
          type="range"
          min={0}
          max={100000}
          step={5000}
          value={budgetMax}
          onChange={(e) => setBudgetMax(parseInt(e.target.value))}
          className="w-full accent-rose-400"
        />
        <div className="mt-2 flex justify-between text-xs text-ivory-600">
          <span>₹0</span>
          <span className="p-1.5 bg-ivory-50 rounded-lg text-sm font-medium text-rose-400">
            Up to ₹{(budgetMax / 1000).toFixed(0)},000
          </span>
          <span>₹1,00,000</span>
        </div>
      </div>

      <hr className="border-ivory-200" />

      {/* Amenities */}
      <div>
        <h4 className="text-sm font-semibold text-ivory-900 mb-3">Amenities</h4>
        <div className="flex flex-wrap gap-2">
          {AMENITY_OPTIONS.map(({ value, label, icon: Icon }) => (
            <button
              key={value}
              onClick={() => toggleAmenity(value)}
              className={cn(
                'flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer',
                selectedAmenities.includes(value)
                  ? 'border-rose-400 bg-rose-50 text-rose-600'
                  : 'border-ivory-200 text-ivory-600 hover:border-ivory-400'
              )}
            >
              {Icon && <Icon className="w-3 h-3" />}
              {label}
              {selectedAmenities.includes(value) && <Check className="w-3 h-3 ml-0.5" />}
            </button>
          ))}
        </div>
      </div>

      <hr className="border-ivory-200" />

      {/* Rating */}
      <div>
        <h4 className="text-sm font-semibold text-ivory-900 mb-3">Rating</h4>
        <div className="flex gap-2">
          {ratingOptions.map((rating) => (
            <button
              key={rating.value}
              onClick={() => setMinRating(rating.value)}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium border transition-colors cursor-pointer',
                minRating === rating.value
                  ? 'border-rose-400 bg-rose-50 text-rose-600'
                  : 'border-ivory-200 text-ivory-600 hover:border-ivory-400'
              )}
            >
              {rating.value > 0 && <Star className="w-3 h-3 inline mr-0.5 -mt-0.5" />}
              {rating.label}
            </button>
          ))}
        </div>
      </div>

      {hasActiveFilters && (
        <button
          onClick={clearFilters}
          className="w-full text-sm text-ivory-600 hover:text-rose-400 font-medium transition-colors cursor-pointer"
        >
          Clear all filters
        </button>
      )}
    </div>
  );

  return (
    <div className="min-h-screen pt-20 md:pt-24">
      <Helmet>
        <title>Discover Salons — Shringar</title>
        <meta name="description" content="Browse top bridal beauty salons in Delhi. Filter by amenities, budget, rating, area, and more." />
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Top Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <h1 className="text-xl md:text-2xl font-heading text-rose-800">
              Discover Salons
            </h1>
            <span className="text-sm text-ivory-600">
              {isLoading ? '...' : `${totalCount} salons in Delhi`}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Sort */}
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none bg-white border border-ivory-200 rounded-full px-4 py-2 pr-8 text-sm text-ivory-900 focus:outline-none focus:border-rose-400 cursor-pointer"
              >
                {sortOptions.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ivory-600 pointer-events-none" />
            </div>

            {/* View toggle */}
            <div className="bg-white border border-ivory-200 rounded-full overflow-hidden flex">
              <button
                onClick={() => setViewMode('grid')}
                className={cn('p-2 cursor-pointer transition-colors', viewMode === 'grid' ? 'bg-rose-50 text-rose-400' : 'text-ivory-600 hover:text-rose-400')}
                title="Grid view"
              >
                <Grid3X3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={cn('p-2 cursor-pointer transition-colors', viewMode === 'map' ? 'bg-rose-50 text-rose-400' : 'text-ivory-600 hover:text-rose-400')}
                title="Map view"
              >
                <Map className="w-4 h-4" />
              </button>
            </div>

            {/* Mobile filter */}
            <button
              onClick={() => setIsFilterOpen(true)}
              className="md:hidden p-2 bg-white border border-ivory-200 rounded-full text-ivory-600 hover:text-rose-400 cursor-pointer relative"
            >
              <SlidersHorizontal className="w-4 h-4" />
              {hasActiveFilters && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-rose-400 rounded-full border-2 border-white" />
              )}
            </button>
          </div>
        </div>

        <div className="flex gap-8">
          {/* Sidebar Filters (Desktop) */}
          <aside className="hidden md:block w-72 shrink-0">
            <div className="sticky top-24 card p-5 max-h-[calc(100vh-8rem)] overflow-y-auto">
              <FilterContent />
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="card p-0 overflow-hidden">
                    <LoadingShimmer className="w-full h-48" />
                    <div className="p-4 space-y-2">
                      <LoadingShimmer className="h-5 w-40" />
                      <LoadingShimmer className="h-4 w-24" />
                    </div>
                  </div>
                ))}
              </div>
            ) : viewMode === 'grid' ? (
              salons.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {salons.map((salon) => (
                    <motion.div
                      key={salon.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.3 }}
                    >
                      <SalonCard salon={salon} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <EmptyState
                  icon={<Grid3X3 className="w-16 h-16" />}
                  title="No salons found"
                  description={searchQuery ? `No results for "${searchQuery}"` : 'Try adjusting your filters or selecting a different area'}
                  action={
                    hasActiveFilters ? (
                      <Button variant="primary" size="md" onClick={clearFilters}>Clear Filters</Button>
                    ) : undefined
                  }
                />
              )
            ) : (
              /* Map View */
              <div className="rounded-xl overflow-hidden border border-ivory-200">
                {salons.length > 0 ? (
                  <Suspense fallback={<div className="h-[60vh] bg-ivory-50 rounded-xl shimmer" />}>
                    <MapView salons={salons} height="60vh" />
                  </Suspense>
                ) : (
                  <div className="h-[60vh] flex items-center justify-center bg-ivory-50 rounded-xl">
                    <div className="text-center">
                      <Map className="w-12 h-12 text-ivory-400 mx-auto mb-3" />
                      <p className="text-ivory-600">No salons to show on map</p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Salon count summary */}
            {!isLoading && salons.length > 0 && viewMode === 'grid' && (
              <div className="mt-8 text-center">
                <p className="text-sm text-ivory-600">
                  Showing {salons.length} of {totalCount} salons
                </p>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      <AnimatePresence>
        {isFilterOpen && (
          <div className="fixed inset-0 z-50 md:hidden">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/40"
              onClick={() => setIsFilterOpen(false)}
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[85vh] overflow-y-auto p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-heading text-lg text-rose-800">Filters</h3>
                <button
                  onClick={() => setIsFilterOpen(false)}
                  className="p-1 rounded-full hover:bg-ivory-100 cursor-pointer"
                >
                  <X className="w-5 h-5 text-ivory-600" />
                </button>
              </div>
              <FilterContent />
              <div className="mt-6 flex gap-3">
                {hasActiveFilters && (
                  <Button variant="ghost" className="flex-1" onClick={clearFilters}>Clear</Button>
                )}
                <Button variant="primary" className="flex-1" onClick={() => setIsFilterOpen(false)}>
                  Show Results
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}