import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  CalendarCheck,
  TrendingUp,
  Star,
  Eye,
  DollarSign,
  ChevronRight,
  CheckCircle2,
  Users,
  ShoppingBag,
  Image,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { LoadingShimmer } from '../../components/ui/LoadingShimmer';
import { formatPrice, formatDate } from '../../utils/format';
import { useAuthStore } from '../../store/authStore';
import { useMySalon, useOverviewStats, useSalonBookings } from '../../hooks/useSalon';
import type { Tables } from '../../types/database';

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { label: string; variant: 'rose' | 'gold' | 'success' | 'gray' }> = {
    pending: { label: 'Pending', variant: 'gold' },
    PENDING: { label: 'Pending', variant: 'gold' },
    confirmed: { label: 'Confirmed', variant: 'success' },
    CONFIRMED: { label: 'Confirmed', variant: 'success' },
    completed: { label: 'Completed', variant: 'gray' },
    COMPLETED: { label: 'Completed', variant: 'gray' },
    cancelled: { label: 'Cancelled', variant: 'gray' },
    CANCELLED: { label: 'Cancelled', variant: 'gray' },
  };
  const s = map[status] || { label: status, variant: 'gray' as const };
  return <Badge variant={s.variant} className="text-[10px]">{s.label}</Badge>;
}

const quickActions = [
  { label: 'Add Portfolio Image', path: '/dashboard/portfolio', icon: Image },
  { label: 'Manage Artists', path: '/dashboard/artists', icon: Users },
  { label: 'Create Package', path: '/dashboard/packages', icon: ShoppingBag },
  { label: 'View Analytics', path: '/dashboard/analytics', icon: TrendingUp },
];

export default function DashboardOverview() {
  const { user } = useAuthStore();
  const { data: salon, isLoading: salonLoading } = useMySalon(user?.id);
  const { data: stats, isLoading: statsLoading } = useOverviewStats(salon?.id);
  const { data: bookings, isLoading: bookingsLoading } = useSalonBookings(salon?.id);

  const today = new Date().toISOString().split('T')[0];
  const todayBookings = (bookings || []).filter(
    (b: any) => b.booking_date === today || b.date === today
  );
  const upcomingBookings = (bookings || []).slice(0, 5);

  const loading = salonLoading || statsLoading;

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-5">
              <LoadingShimmer className="h-10 w-24" />
              <LoadingShimmer className="h-4 w-32 mt-3" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const statsCards = [
    { icon: CalendarCheck, label: "Today's Bookings", value: stats?.todayBookings ?? 0, change: `${todayBookings.length} today`, color: 'rose' },
    { icon: DollarSign, label: 'This Week Revenue', value: formatPrice(stats?.thisWeekRevenue ?? 0), change: 'Last 7 days', color: 'green' },
    { icon: Star, label: 'Avg. Rating', value: stats?.avgRating ?? '—', change: 'From customer reviews', color: 'gold' },
    { icon: Eye, label: 'Profile Views', value: (stats?.profileViews ?? 0).toLocaleString(), change: 'Portfolio views', color: 'rose' },
  ];

  return (
    <div className="space-y-8">
      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="card p-5"
          >
            <div className="flex items-start justify-between mb-3">
              <div className={cn(
                'w-10 h-10 rounded-xl flex items-center justify-center',
                stat.color === 'rose' && 'bg-rose-50',
                stat.color === 'green' && 'bg-green-50',
                stat.color === 'gold' && 'bg-gold-50',
              )}>
                <stat.icon className={cn(
                  'w-5 h-5',
                  stat.color === 'rose' && 'text-rose-400',
                  stat.color === 'green' && 'text-green-500',
                  stat.color === 'gold' && 'text-gold-300',
                )} />
              </div>
              <Badge variant="success" className="text-[10px]">{stat.change}</Badge>
            </div>
            <p className="text-2xl font-heading text-ivory-900">{stat.value}</p>
            <p className="text-xs text-ivory-600 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Upcoming Bookings */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 card p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading text-lg text-ivory-900">Upcoming Bookings</h2>
            <Link
              to="/dashboard/calendar"
              className="text-xs text-rose-400 hover:text-rose-600 font-medium flex items-center gap-1"
            >
              View all <ChevronRight className="w-3 h-3" />
            </Link>
          </div>

          {bookingsLoading ? (
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <LoadingShimmer key={i} className="h-16 w-full rounded-xl" />
              ))}
            </div>
          ) : upcomingBookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center">
              <CalendarCheck className="w-10 h-10 text-ivory-400 mb-3" />
              <p className="text-sm text-ivory-600">No upcoming bookings</p>
              <p className="text-xs text-ivory-400 mt-1">Bookings will appear here once customers book</p>
            </div>
          ) : (
            <div className="space-y-3">
              {upcomingBookings.map((booking: any) => (
                <div
                  key={booking.id}
                  className="flex items-center gap-4 p-3 rounded-xl bg-ivory-50 hover:bg-rose-50 transition-colors"
                >
                  <div className="w-12 h-12 rounded-full bg-rose-100 flex items-center justify-center shrink-0">
                    <CalendarCheck className="w-5 h-5 text-rose-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-medium text-ivory-900">
                        {booking.customer_name || 'Customer'}
                      </p>
                      <StatusBadge status={booking.status} />
                    </div>
                    <p className="text-xs text-ivory-600 mt-0.5">
                      {formatDate(booking.booking_date || booking.date)} at {booking.start_time || booking.time} · {formatPrice(booking.total_amount || booking.totalAmount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Quick Actions & Profile Preview */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {/* Profile Card */}
          <div className="card p-5">
            {salonLoading ? (
              <div className="space-y-3">
                <LoadingShimmer className="h-14 w-14 rounded-xl" />
                <LoadingShimmer className="h-5 w-40" />
                <LoadingShimmer className="h-4 w-28" />
              </div>
            ) : salon ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-rose-200 to-rose-400 flex items-center justify-center text-white font-heading text-xl">
                    {salon.name.charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <h3 className="font-heading text-base text-rose-800 truncate">{salon.name}</h3>
                    <p className="text-xs text-ivory-600">{salon.area}, {salon.city}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-xs text-ivory-600 border-t border-ivory-100 pt-3">
                  <div className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 text-gold-200" />
                    <span>{salon.rating || '—'}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />
                    <span>{salon.is_active ? 'Active' : 'Inactive'}</span>
                  </div>
                  <Badge variant="gold">{salon.tier}</Badge>
                </div>
                <Link to="/dashboard/settings">
                  <Button variant="secondary" size="sm" className="w-full mt-4 text-xs">
                    Edit Profile
                  </Button>
                </Link>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-sm text-ivory-600">No salon yet</p>
                <p className="text-xs text-ivory-400 mt-1">Create your salon to get started</p>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          <div className="card p-5">
            <h3 className="font-heading text-sm text-ivory-900 mb-3">Quick Actions</h3>
            <div className="space-y-1">
              {quickActions.map((action) => (
                <Link
                  key={action.label}
                  to={action.path}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-ivory-100 transition-colors text-sm text-ivory-600 hover:text-ivory-900"
                >
                  <action.icon className="w-4 h-4 text-rose-400" />
                  <span>{action.label}</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-auto text-ivory-400" />
                </Link>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}