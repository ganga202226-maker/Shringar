import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Building2,
  Users,
  Star,
  IndianRupee,
  TrendingUp,
  ChevronRight,
  CalendarCheck,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Ban,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { formatPrice } from '../../utils/format';
import { supabase } from '../../lib/supabase';

interface AdminStats {
  totalSalons: number;
  activeSalons: number;
  totalUsers: number;
  totalBookings: number;
  totalRevenue: number;
  avgRating: number;
  pendingVerifications: number;
  flaggedReviews: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = React.useState<AdminStats>({
    totalSalons: 0,
    activeSalons: 0,
    totalUsers: 0,
    totalBookings: 0,
    totalRevenue: 0,
    avgRating: 0,
    pendingVerifications: 0,
    flaggedReviews: 0,
  });
  const [recentSalons, setRecentSalons] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const [salons, users, bookings, reviews] = await Promise.all([
        supabase.from('salons').select('id, name, slug, area, city, is_active, created_at, subscription_tier, logo_url', { count: 'exact' }).order('created_at', { ascending: false }).limit(5),
        supabase.from('profiles').select('id', { count: 'exact' }),
        supabase.from('bookings').select('total_amount, status', { count: 'exact' }),
        supabase.from('reviews').select('rating'),
      ]);

      const totalRevenue = (bookings.data || []).reduce((sum, b) => sum + (b.total_amount || 0), 0);
      const totalRatings = (reviews.data || []).reduce((sum, r) => sum + r.rating, 0);
      const avgRating = (reviews.data || []).length > 0 ? totalRatings / (reviews.data || []).length : 0;

      setStats({
        totalSalons: salons.count || 0,
        activeSalons: (salons.data || []).filter((s: any) => s.is_active).length,
        totalUsers: users.count || 0,
        totalBookings: bookings.count || 0,
        totalRevenue,
        avgRating: Math.round(avgRating * 10) / 10,
        pendingVerifications: (salons.data || []).filter((s: any) => !s.is_active).length,
        flaggedReviews: 0,
      });
      setRecentSalons(salons.data || []);
    } catch (err) {
      console.error('Failed to load admin stats:', err);
    } finally {
      setLoading(false);
    }
  }

  const statCards = [
    { icon: Building2, label: 'Total Salons', value: stats.totalSalons.toString(), sub: `${stats.activeSalons} active`, color: 'rose' },
    { icon: Users, label: 'Total Users', value: stats.totalUsers.toString(), sub: 'Registered accounts', color: 'green' },
    { icon: CalendarCheck, label: 'Total Bookings', value: stats.totalBookings.toString(), sub: 'All time', color: 'gold' },
    { icon: IndianRupee, label: 'Platform Revenue', value: formatPrice(stats.totalRevenue), sub: `Avg rating: ${stats.avgRating}`, color: 'rose' },
  ];

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="card p-5 h-28" />
          ))}
        </div>
        <div className="card p-6 h-64" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, i) => (
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
                  stat.color === 'green' && 'text-success',
                  stat.color === 'gold' && 'text-gold-200',
                )} />
              </div>
            </div>
            <p className="text-2xl font-heading text-ivory-900">{stat.value}</p>
            <p className="text-xs text-ivory-600 mt-1">{stat.sub}</p>
          </motion.div>
        ))}
      </div>

      {/* Recent Salons */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="card p-6"
      >
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-heading text-lg text-ivory-900">Recent Salons</h2>
          <Link to="/admin/salons" className="text-xs text-rose-400 hover:text-rose-600 font-medium flex items-center gap-1">
            View all <ChevronRight className="w-3 h-3" />
          </Link>
        </div>

        {recentSalons.length === 0 ? (
          <p className="text-sm text-ivory-600 text-center py-8">No salons registered yet.</p>
        ) : (
          <div className="space-y-3">
            {recentSalons.map((salon: any) => (
              <div key={salon.id} className="flex items-center gap-4 p-3 rounded-xl bg-ivory-50 hover:bg-rose-50 transition-colors">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-200 to-rose-400 flex items-center justify-center text-white font-heading text-lg shrink-0">
                  {salon.name?.charAt(0) || 'S'}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-medium text-ivory-900 truncate">{salon.name}</p>
                    {salon.is_active ? (
                      <Badge variant="success" className="text-[10px]">Active</Badge>
                    ) : (
                      <Badge variant="gray" className="text-[10px]">Inactive</Badge>
                    )}
                  </div>
                  <p className="text-xs text-ivory-600 mt-0.5">{salon.area}, {salon.city}</p>
                </div>
                <Badge variant="gold" className="text-[10px] uppercase">{salon.subscription_tier}</Badge>
              </div>
            ))}
          </div>
        )}
      </motion.div>

      {/* Quick Actions */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
      >
        <Link to="/admin/salons" className="card p-5 hover:shadow-md transition-shadow flex items-center gap-4">
          <Building2 className="w-8 h-8 text-rose-400" />
          <div>
            <p className="font-medium text-ivory-900 text-sm">Manage Salons</p>
            <p className="text-xs text-ivory-600">Verify, approve, or deactivate</p>
          </div>
        </Link>
        <Link to="/admin/users" className="card p-5 hover:shadow-md transition-shadow flex items-center gap-4">
          <Users className="w-8 h-8 text-rose-400" />
          <div>
            <p className="font-medium text-ivory-900 text-sm">Manage Users</p>
            <p className="text-xs text-ivory-600">View, ban, or promote users</p>
          </div>
        </Link>
        <Link to="/admin/reviews" className="card p-5 hover:shadow-md transition-shadow flex items-center gap-4">
          <Star className="w-8 h-8 text-rose-400" />
          <div>
            <p className="font-medium text-ivory-900 text-sm">Moderate Reviews</p>
            <p className="text-xs text-ivory-600">Flagged & reported reviews</p>
          </div>
        </Link>
      </motion.div>
    </div>
  );
}

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}