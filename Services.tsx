import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useQuery } from '@tanstack/react-query';
import {
  Sparkles, Search, Calendar, ChevronRight, Shield, CreditCard,
  Headphones, Sparkle, Palette, Scissors, Flower2, Mail, MapPin,
  HomeIcon, Sun, ArrowRight, Camera, CheckCircle, Store, Users,
  Clock, MessageCircle, Star,
} from 'lucide-react';
import { LoadingShimmer } from '../components/ui/LoadingShimmer';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { SalonCard } from '../components/shared/SalonCard';
import { SearchBar } from '../components/shared/SearchBar';
import { ProgressStepper } from '../components/ui/ProgressStepper';
import { useFeaturedSalons } from '../hooks/useSalon';
import { homeService } from '../services/home';
import { ImageWithFallback } from '../components/ui/ImageWithFallback';
import { HERO_BG, CATEGORY_IMAGES, AI_LOOKS, BANNER_WEDDING, SECTION_BGS, HOW_IT_WORKS } from '../utils/images';

const serviceIcons: Record<string, { icon: React.ElementType }> = {
  'Bridal Makeup': { icon: Sparkle },
  'Mehendi': { icon: Flower2 },
  'Hair & Styling': { icon: Scissors },
  'Bridal Party Package': { icon: Users },
  'Home Service': { icon: HomeIcon },
  'Pre-bridal Care': { icon: Sun },
};

function App() {
  const { data: salonsData, isLoading } = useFeaturedSalons();
  const featuredSalons = salonsData?.data || [];

  const { data: heroStats, isLoading: statsLoading } = useQuery({
    queryKey: ['home-stats'],
    queryFn: () => homeService.getHeroStats(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: categoryCounts } = useQuery({
    queryKey: ['home-category-counts'],
    queryFn: () => homeService.getCategoryCounts(),
    staleTime: 5 * 60 * 1000,
  });

  const { data: liveReviews, isLoading: reviewsLoading } = useQuery({
    queryKey: ['home-reviews'],
    queryFn: () => homeService.getLatestReviews(6),
    staleTime: 2 * 60 * 1000,
  });

  const artistCount = heroStats?.artistCount ?? 30;
  const bookingCount = heroStats?.bookingCount ?? 10;

  return (
    <div className="min-h-screen">

      {/* ═══ SECTION 1 — Hero ═══ */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback
            src={HERO_BG}
            alt="Bridal beauty"
            className="w-full h-full object-cover"
            fallbackBg="bg-gradient-to-br from-rose-800 to-rose-900"
            showFallbackIcon={false}
          />
          <div className="absolute inset-0 bg-gradient-to-r from-rose-900/80 via-rose-900/60 to-ivory-900/50" />
        </div>

        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-gold-200/10 blur-3xl" />
          <div className="absolute bottom-20 right-10 w-80 h-80 rounded-full bg-rose-300/10 blur-3xl" />
        </div>

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-4xl mx-auto"
          >
            <Badge variant="rose" className="mb-6 inline-block text-sm px-4 py-1.5 border-white/30 text-white bg-white/20 backdrop-blur-sm">
              India's #1 Bridal Beauty Platform
            </Badge>

            <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl text-white leading-tight mb-6 drop-shadow-lg">
              Delhi's most trusted
              <br />
              <span className="text-gold-200">bridal beauty</span> platform
            </h1>

            <p className="text-lg text-white/80 max-w-2xl mx-auto mb-10 drop-shadow">
              Book verified makeup artists, stylists &amp; salons — all in one place.
              From mehendi to wedding day, we've got your bridal look covered.
            </p>

            <div className="mb-10">
              <SearchBar variant="hero" />
            </div>

            <div className="flex items-center justify-center flex-wrap gap-x-8 gap-y-3 text-sm text-white/80">
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-gold-200" />
                {statsLoading ? 'Loading...' : `${artistCount.toLocaleString()}+ verified artists`}
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-gold-200" />
                {statsLoading ? 'Loading...' : `${bookingCount.toLocaleString()}+ brides served`}
              </span>
              <span className="flex items-center gap-1.5">
                <CheckCircle className="w-4 h-4 text-gold-200" />
                Secure payments
              </span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ═══ SECTION 2 — AI Bridal Studio Teaser ═══ */}
      <section className="bg-rose-50 border-y border-rose-100 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-1 text-center md:text-left"
            >
              <Badge variant="gold" className="mb-4">New Feature</Badge>
              <h2 className="font-heading text-2xl md:text-3xl text-rose-800 mb-3">
                See yourself as a bride — before the booking
              </h2>
              <p className="text-ivory-600 mb-6 max-w-lg">
                Upload your photo and our AI generates 3 personalised bridal looks in seconds.
                Try different styles until you find "the one."
              </p>
              <Link to="/ai-studio">
                <Button variant="primary" size="md">
                  Try AI Look Studio <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex gap-3 md:gap-4"
            >
              {[
                { label: 'Traditional', img: AI_LOOKS.traditional },
                { label: 'Fusion', img: AI_LOOKS.fusion },
                { label: 'Minimalist', img: AI_LOOKS.minimalist },
              ].map((style) => (
                <div
                  key={style.label}
                  className="w-24 h-32 md:w-32 md:h-44 rounded-xl overflow-hidden relative shadow-lg"
                >
                  <ImageWithFallback
                    src={style.img}
                    alt={style.label}
                    className="w-full h-full object-cover"
                    fallbackBg="bg-rose-100"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                  <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-white text-xs font-medium bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full whitespace-nowrap">
                    {style.label}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 3 — Browse by Service ═══ */}
      <section id="services" className="py-16 md:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-heading text-3xl md:text-4xl text-rose-800 mb-3">What are you looking for?</h2>
            <p className="text-ivory-600 max-w-xl mx-auto">Browse thousands of services curated for your perfect wedding day</p>
          </motion.div>

          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {Object.entries(serviceIcons).map(([label, { icon: Icon }], index) => {
              const salonCount = categoryCounts?.[label];
              const catImg = CATEGORY_IMAGES[label];
              return (
                <motion.div
                  key={label}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.08 }}
                >
                  <Link
                    to={`/search?service=${encodeURIComponent(label)}`}
                    className="card p-0 overflow-hidden text-center hover:border-rose-400 transition-all duration-300 group block"
                  >
                    <div className="h-28 relative overflow-hidden">
                      {catImg && (
                        <ImageWithFallback
                          src={catImg}
                          alt={label}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          fallbackBg="bg-rose-50"
                        />
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-rose-900/60 to-transparent" />
                      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center shadow-md">
                        <Icon className="w-5 h-5 text-rose-400" />
                      </div>
                    </div>
                    <div className="p-3">
                      <h3 className="text-sm font-medium text-ivory-900">{label}</h3>
                      <p className="text-xs text-ivory-600">
                        {salonCount ? `${salonCount} salon${salonCount !== 1 ? 's' : ''}` : 'Loading...'}
                      </p>
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ═══ SECTION 4 — Featured Salons ═══ */}
      <section className="py-16 md:py-20 bg-ivory-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-10">
            <div>
              <h2 className="font-heading text-3xl text-rose-800 mb-2">Top-rated bridal salons in Delhi</h2>
              <p className="text-ivory-600">Handpicked for your special day</p>
            </div>
            <Link to="/search" className="hidden sm:flex items-center gap-1 text-rose-400 hover:text-rose-600 font-medium text-sm">
              View all <ChevronRight className="w-4 h-4" />
            </Link>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="card p-0 overflow-hidden">
                  <LoadingShimmer className="w-full h-48" />
                  <div className="p-4 space-y-2">
                    <LoadingShimmer className="h-5 w-40" />
                    <LoadingShimmer className="h-4 w-24" />
                  </div>
                </div>
              ))}
            </div>
          ) : featuredSalons.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredSalons.slice(0, 6).map((salon) => (
                <motion.div
                  key={salon.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                >
                  <SalonCard salon={salon} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-ivory-600">
              <p>No featured salons available yet. Check back soon!</p>
            </div>
          )}

          <div className="sm:hidden mt-6 text-center">
            <Link to="/search">
              <Button variant="secondary" size="md">View all salons <ChevronRight className="ml-1 w-4 h-4" /></Button>
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 5 — How It Works ═══ */}
      <section className="py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback
            src={SECTION_BGS[1]}
            alt=""
            className="w-full h-full object-cover opacity-[0.03]"
            fallbackClassName="w-full h-full opacity-[0.03]"
            fallbackBg="bg-transparent"
            showFallbackIcon={false}
            imgProps={{ 'aria-hidden': 'true' }}
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-heading text-3xl md:text-4xl text-rose-800 mb-3">How Shringar works</h2>
            <p className="text-ivory-600 max-w-xl mx-auto">Three simple steps to your dream bridal look</p>
          </motion.div>

          <ProgressStepper
            steps={[
              { label: 'Search & Compare', description: 'Browse salons, compare packages & read reviews' },
              { label: 'Book a Trial', description: 'Schedule a trial session to finalize your look' },
              { label: 'Confirm Your Package', description: 'Lock in your wedding day package with ease' },
            ]}
            currentStep={-1}
            className="max-w-2xl mx-auto mb-12"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            {[
              { icon: Search, step: '01', title: 'Search & Compare', desc: 'Browse hundreds of verified salons and artists in Delhi. Compare packages, read reviews, and find your perfect match.' },
              { icon: Calendar, step: '02', title: 'Book a Trial', desc: 'Schedule a trial session to see your bridal look come to life. Make changes until everything is perfect.' },
              { icon: Sparkles, step: '03', title: 'Confirm & Celebrate', desc: 'Finalise your package, secure your booking with a payment, and relax — your wedding beauty is sorted!' },
            ].map((item) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-center p-6"
              >
                <div className="w-16 h-16 rounded-full bg-rose-50 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="w-8 h-8 text-rose-400" />
                </div>
                <span className="text-xs font-bold text-rose-400 tracking-widest mb-1 block">Step {item.step}</span>
                <h3 className="font-heading text-lg text-ivory-900 mb-2">{item.title}</h3>
                <p className="text-sm text-ivory-600 leading-relaxed">{item.desc}</p>
              </motion.div>
            ))}
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { img: HOW_IT_WORKS[0], alt: 'Bride searching on phone' },
                { img: HOW_IT_WORKS[1], alt: 'Bridal trial session' },
                { img: HOW_IT_WORKS[2], alt: 'Wedday celebration' },
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.15 }}
                  className="rounded-xl overflow-hidden shadow-md h-40 md:h-52"
                >
                  <ImageWithFallback
                    src={item.img}
                    alt={item.alt}
                    className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
                    fallbackBg="bg-rose-50"
                  />
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 6 — AI Studio Full Promo ═══ */}
      <section className="py-16 md:py-20 bg-gradient-to-br from-rose-50 to-ivory-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col lg:flex-row items-center gap-12">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-1"
            >
              <Badge variant="gold" className="mb-4">AI-Powered</Badge>
              <h2 className="font-heading text-3xl md:text-4xl text-rose-800 mb-4">Try your bridal look before you book</h2>
              <ul className="space-y-4">
                {[
                  { icon: Camera, text: 'Upload a photo of yourself' },
                  { icon: Palette, text: 'Choose from 4 bridal style templates' },
                  { icon: Sparkles, text: 'See 3 AI-generated looks in seconds' },
                  { icon: Store, text: 'Book the artist who created "the one"' },
                ].map((feature) => (
                  <li key={feature.text} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
                      <feature.icon className="w-5 h-5 text-rose-400" />
                    </div>
                    <span className="text-ivory-900">{feature.text}</span>
                  </li>
                ))}
              </ul>
              <div className="mt-8">
                <Link to="/ai-studio">
                  <Button variant="primary" size="md">Try free <ArrowRight className="ml-2 w-4 h-4" /></Button>
                </Link>
                <span className="ml-4 text-xs text-ivory-600">No login required</span>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex-1 max-w-sm"
            >
              <div className="relative mx-auto w-64 h-[28rem] rounded-[2.5rem] border-4 border-ivory-200 bg-white shadow-xl overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-ivory-900 rounded-b-xl z-10" />
                <div className="pt-8 p-4 space-y-4">
                  <div className="bg-rose-50 rounded-xl p-3 text-center">
                    <p className="text-xs text-rose-600 font-medium">AI Bridal Studio</p>
                  </div>
                  <div className="w-full h-32 rounded-xl overflow-hidden">
                    <ImageWithFallback src={AI_LOOKS.traditional} alt="Bridal preview" className="w-full h-full object-cover" fallbackBg="bg-rose-50" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex gap-2">
                      {['Traditional', 'Fusion', 'Minimal'].map((s) => (
                        <div key={s} className="flex-1 h-8 rounded-lg bg-rose-50 text-[10px] flex items-center justify-center text-ivory-600 font-medium">{s}</div>
                      ))}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {[AI_LOOKS.traditional, AI_LOOKS.fusion, AI_LOOKS.minimalist].map((src, i) => (
                        <div key={i} className="h-20 rounded-lg overflow-hidden">
                          <ImageWithFallback src={src} alt="Look preview" className="w-full h-full object-cover" fallbackBg="bg-rose-50" />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ═══ SECTION 7 — Testimonials ═══ */}
      <section className="py-16 md:py-20 relative overflow-hidden">
        <div className="absolute inset-0">
          <ImageWithFallback
            src={BANNER_WEDDING}
            alt=""
            className="w-full h-full object-cover opacity-[0.04]"
            fallbackClassName="w-full h-full opacity-[0.04]"
            fallbackBg="bg-transparent"
            showFallbackIcon={false}
            imgProps={{ 'aria-hidden': 'true' }}
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="font-heading text-3xl md:text-4xl text-rose-800 mb-3">Real brides. Real results.</h2>
            <p className="text-ivory-600">Hear from brides who found their perfect look on Shringar</p>
          </motion.div>

          {reviewsLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="card p-6 border-rose-100 space-y-3">
                  <div className="flex items-center gap-3">
                    <LoadingShimmer className="w-12 h-12 rounded-full" />
                    <div className="space-y-1.5">
                      <LoadingShimmer className="h-4 w-28" />
                      <LoadingShimmer className="h-3 w-20" />
                    </div>
                  </div>
                  <LoadingShimmer className="h-3 w-24" />
                  <LoadingShimmer className="h-16 w-full" />
                </div>
              ))}
            </div>
          ) : liveReviews && liveReviews.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {liveReviews.map((review, i) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.1 }}
                  className="card p-6 border-rose-100"
                >
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden bg-rose-50 flex items-center justify-center">
                      {review.avatar_url ? (
                        <ImageWithFallback src={review.avatar_url} alt={review.customer_name} className="w-full h-full object-cover" fallbackBg="bg-rose-50" />
                      ) : (
                        <Users className="w-5 h-5 text-rose-300" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-medium text-ivory-900 text-sm">{review.customer_name}</h4>
                      <p className="text-xs text-ivory-600">via {review.salon_name}</p>
                    </div>
                  </div>
                  <div className="flex gap-0.5 mb-3">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <Star key={s} className={`w-4 h-4 ${s < review.rating ? 'fill-gold-200 text-gold-200' : 'text-ivory-400'}`} />
                    ))}
                  </div>
                  <blockquote className="text-sm text-ivory-600 leading-relaxed italic">"{review.comment}"</blockquote>
                  <Link to={`/salon/${review.salon_slug}`} className="mt-3 text-xs text-rose-400 hover:text-rose-600 font-medium block">— {review.salon_name}</Link>
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-ivory-600">
              <p>No reviews yet. Be the first to book and share your experience!</p>
            </div>
          )}
        </div>
      </section>

      {/* ═══ SECTION 8 — Trust Banner ═══ */}
      <section className="relative py-12">
        <div className="absolute inset-0">
          <ImageWithFallback
            src={SECTION_BGS[0]}
            alt=""
            className="w-full h-full object-cover opacity-[0.05]"
            fallbackClassName="w-full h-full opacity-[0.05]"
            fallbackBg="bg-transparent"
            showFallbackIcon={false}
            imgProps={{ 'aria-hidden': 'true' }}
          />
        </div>
        <div className="relative bg-ivory-100/80 max-w-full">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { icon: Shield, label: 'Verified Salons', desc: 'Every salon is manually verified' },
                { icon: CreditCard, label: 'Secure Payments', desc: '100% protected transactions' },
                { icon: Clock, label: 'Free Cancellation', desc: 'Cancel up to 48 hours before' },
                { icon: Headphones, label: '24/7 Support', desc: "We're here to help anytime" },
              ].map((item) => (
                <motion.div
                  key={item.label}
                  initial={{ opacity: 0, y: 10 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center mx-auto mb-3 shadow-sm">
                    <item.icon className="w-6 h-6 text-rose-400" />
                  </div>
                  <h4 className="text-sm font-semibold text-ivory-900 mb-1">{item.label}</h4>
                  <p className="text-xs text-ivory-600">{item.desc}</p>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-ivory-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <div>
              <Link to="/" className="flex items-center gap-2 mb-4">
                <Sparkles className="w-6 h-6 text-rose-200" />
                <span className="font-heading text-xl font-bold">Shringar</span>
              </Link>
              <p className="text-ivory-400 text-sm leading-relaxed">
                Delhi's most trusted bridal beauty platform. Connecting brides with the finest makeup artists, stylists, and salons for their perfect day.
              </p>
            </div>
            <div>
              <h4 className="font-heading text-base font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {[
                  { label: 'Browse Salons', path: '/search' },
                  { label: 'AI Bridal Studio', path: '/ai-studio' },
                  { label: 'Plan Your Wedding', path: '/plan' },
                  { label: 'For Salon Owners', path: '/dashboard' },
                ].map((link) => (
                  <li key={link.label}><Link to={link.path} className="text-sm text-ivory-400 hover:text-rose-200 transition-colors">{link.label}</Link></li>
                ))}
              </ul>
            </div>
            <div>
              <h4 className="font-heading text-base font-semibold mb-4">Contact</h4>
              <ul className="space-y-2 text-sm text-ivory-400">
                <li className="flex items-center gap-2"><MessageCircle className="w-4 h-4 text-rose-300" /> +91 98765 43210</li>
                <li className="flex items-center gap-2"><Mail className="w-4 h-4 text-rose-300" /> hello@shringar.in</li>
                <li className="flex items-start gap-2"><MapPin className="w-4 h-4 text-rose-300 shrink-0 mt-0.5" /> Hauz Khas, New Delhi 110016</li>
              </ul>
            </div>
          </div>
          <div className="mt-10 pt-8 border-t border-white/10 text-center">
            <p className="text-sm text-ivory-500">© 2026 Shringar. Made with love for Indian brides.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;