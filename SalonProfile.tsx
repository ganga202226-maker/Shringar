import React, { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  CalendarCheck,
  Star,
  Download,
} from 'lucide-react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import { Button } from '../../components/ui/Button';
import { LoadingShimmer } from '../../components/ui/LoadingShimmer';
import { formatPrice } from '../../utils/format';
import { useAuthStore } from '../../store/authStore';
import { useMySalon, useAnalytics } from '../../hooks/useSalon';

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const SERVICE_COLORS: Record<string, string> = {
  'Bridal Makeup': '#D4537E',
  'Bridal makeup': '#D4537E',
  Mehendi: '#EF9F27',
  'Hair Styling': '#993556',
  'Hair styling': '#993556',
  'Skin Prep': '#FAC775',
  'Skin prep': '#FAC775',
  'Bridal Party': '#C484A0',
  'Bridal party': '#C484A0',
};

const DEFAULT_COLOR = '#D4537E';

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload?.length) {
    return (
      <div className="bg-white border border-ivory-200 rounded-xl shadow-dropdown p-3">
        <p className="text-sm font-medium text-ivory-900">{label}</p>
        {payload.map((entry: any) => (
          <p key={entry.name} className="text-xs text-ivory-600 mt-1">
            {entry.name === 'revenue' ? formatPrice(entry.value) : entry.value}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

export default function DashboardAnalytics() {
  const { user } = useAuthStore();
  const { data: salon, isLoading: salonLoading } = useMySalon(user?.id);
  const [period, setPeriod] = useState<'week' | '6months'>('week');
  const { data: rawData, isLoading: dataLoading } = useAnalytics(salon?.id, period);

  const isLoading = salonLoading || dataLoading;

  const { revenueData, serviceBreakdown, stats } = useMemo(() => {
    if (!rawData) {
      return { revenueData: [], serviceBreakdown: [], stats: null };
    }

    const bookings = rawData.bookings || [];
    const services = rawData.services || [];

    // Build revenue data grouped by day or month
    const revenueMap: Record<string, { revenue: number; bookings: number }> = {};

    if (period === 'week') {
      DAYS.forEach(d => { revenueMap[d] = { revenue: 0, bookings: 0 }; });
      bookings.forEach((b: any) => {
        const d = new Date(b.booking_date);
        const dayName = DAYS[d.getDay()];
        if (revenueMap[dayName]) {
          revenueMap[dayName].revenue += b.total_amount || 0;
          revenueMap[dayName].bookings += 1;
        }
      });
    } else {
      // 6 months: build monthly buckets
      const now = new Date();
      for (let i = 5; i >= 0; i--) {
        const m = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = MONTHS[m.getMonth()];
        revenueMap[key] = { revenue: 0, bookings: 0 };
      }
      bookings.forEach((b: any) => {
        const d = new Date(b.booking_date);
        const key = MONTHS[d.getMonth()];
        if (revenueMap[key]) {
          revenueMap[key].revenue += b.total_amount || 0;
          revenueMap[key].bookings += 1;
        }
      });
    }

    const revenueData = Object.entries(revenueMap).map(([key, val]) => ({
      [period === 'week' ? 'day' : 'month']: key,
      revenue: val.revenue,
      bookings: val.bookings,
    }));

    // Service breakdown
    const serviceCount: Record<string, number> = {};
    services.forEach((s: any) => {
      const cat = s.category || 'Other';
      serviceCount[cat] = (serviceCount[cat] || 0) + 1;
    });
    const totalServices = Object.values(serviceCount).reduce((a: number, b: number) => a + b, 0);
    const serviceBreakdown = Object.entries(serviceCount).map(([name, count]) => ({
      name,
      value: Math.round((count / totalServices) * 100),
      color: SERVICE_COLORS[name] || DEFAULT_COLOR,
    }));

    // Stats
    const totalRevenue = bookings.reduce((sum: number, b: any) => sum + (b.total_amount || 0), 0);
    const completedBookings = bookings.filter((b: any) =>
      ['completed', 'COMPLETED', 'confirmed', 'CONFIRMED'].includes(b.status)
    );
    const avgBookingValue = completedBookings.length > 0
      ? totalRevenue / completedBookings.length
      : 0;
    const totalBookings = bookings.length;

    const stats = {
      totalRevenue,
      totalBookings,
      avgBookingValue,
      // Placeholder for conversion rate (future feature)
      conversionRate: '—',
    };

    return { revenueData, serviceBreakdown, stats };
  }, [rawData, period]);

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="card p-4">
              <LoadingShimmer className="h-8 w-20" />
              <LoadingShimmer className="h-4 w-28 mt-2" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  const statsCards = [
    {
      label: period === 'week' ? 'Total Revenue (This Week)' : 'Total Revenue (6 Months)',
      value: formatPrice(stats?.totalRevenue || 0),
      icon: DollarSign,
      color: 'rose',
    },
    {
      label: period === 'week' ? 'Total Bookings' : 'Total Bookings (6 Months)',
      value: String(stats?.totalBookings || 0),
      icon: CalendarCheck,
      color: 'green',
    },
    {
      label: 'Avg. Booking Value',
      value: formatPrice(stats?.avgBookingValue || 0),
      icon: DollarSign,
      color: 'gold',
    },
    {
      label: 'Conversion Rate',
      value: stats?.conversionRate || '—',
      icon: TrendingUp,
      color: 'rose',
    },
  ];

  const dataKey = period === 'week' ? 'day' : 'month';

  return (
    <div className="space-y-6">
      {/* Period selector */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setPeriod('week')}
            className={cn(
              'px-4 py-2 rounded-full text-sm transition-all cursor-pointer',
              period === 'week' ? 'bg-rose-400 text-white' : 'bg-white text-ivory-600 hover:bg-ivory-100 border border-ivory-200'
            )}
          >
            This Week
          </button>
          <button
            onClick={() => setPeriod('6months')}
            className={cn(
              'px-4 py-2 rounded-full text-sm transition-all cursor-pointer',
              period === '6months' ? 'bg-rose-400 text-white' : 'bg-white text-ivory-600 hover:bg-ivory-100 border border-ivory-200'
            )}
          >
            Last 6 Months
          </button>
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="card p-4"
          >
            <div className="flex items-start justify-between mb-2">
              <div className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center',
                stat.color === 'rose' && 'bg-rose-50',
                stat.color === 'green' && 'bg-green-50',
                stat.color === 'gold' && 'bg-gold-50',
              )}>
                <stat.icon className={cn(
                  'w-4 h-4',
                  stat.color === 'rose' && 'text-rose-400',
                  stat.color === 'green' && 'text-green-500',
                  stat.color === 'gold' && 'text-gold-300',
                )} />
              </div>
            </div>
            <p className="text-xl font-heading text-ivory-900">{stat.value}</p>
            <p className="text-xs text-ivory-600 mt-0.5">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Revenue Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="lg:col-span-2 card p-5"
        >
          <h2 className="font-heading text-lg text-ivory-900 mb-5">Revenue & Bookings</h2>
          <div className="h-72">
            {revenueData.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-ivory-600">
                No data available for this period
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={revenueData} barGap={4}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F2EDE9" />
                  <XAxis dataKey={dataKey} tick={{ fontSize: 12, fill: '#888780' }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 12, fill: '#888780' }} axisLine={false} tickLine={false} tickFormatter={(v) => v >= 1000 ? `₹${(v / 1000).toFixed(0)}k` : v} />
                  <Tooltip content={<CustomTooltip />} />
                  <Bar dataKey="revenue" fill="#D4537E" radius={[6, 6, 0, 0]} name="revenue" />
                  <Bar dataKey="bookings" fill="#F4C0D1" radius={[6, 6, 0, 0]} name="bookings" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>

        {/* Service Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card p-5"
        >
          <h2 className="font-heading text-lg text-ivory-900 mb-5">Service Breakdown</h2>
          <div className="h-64">
            {serviceBreakdown.length === 0 ? (
              <div className="flex items-center justify-center h-full text-sm text-ivory-600">
                No service data yet
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {serviceBreakdown.map((entry) => (
                      <Cell key={entry.name} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    verticalAlign="bottom"
                    iconType="circle"
                    iconSize={8}
                    formatter={(value) => <span className="text-xs text-ivory-600">{value}</span>}
                  />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </motion.div>
      </div>

      {/* Key Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="card p-5"
      >
        <h2 className="font-heading text-lg text-ivory-900 mb-4">Key Insights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              title: 'Best Performing Service',
              value: serviceBreakdown.sort((a, b) => b.value - a.value)[0]?.name || '—',
              detail: serviceBreakdown.length > 0 ? `${serviceBreakdown.sort((a, b) => b.value - a.value)[0].value}% of services` : 'No data',
              icon: Star,
              color: 'rose',
            },
            {
              title: 'Total Bookings',
              value: String(stats?.totalBookings || 0),
              detail: `In ${period === 'week' ? 'the past week' : '6 months'}`,
              icon: CalendarCheck,
              color: 'gold',
            },
            {
              title: 'Avg. Customer Rating',
              value: '—',
              detail: 'Enable reviews to see ratings',
              icon: Star,
              color: 'green',
            },
          ].map((insight) => (
            <div key={insight.title} className="bg-ivory-50 rounded-xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <div className={cn(
                  'w-8 h-8 rounded-lg flex items-center justify-center',
                  insight.color === 'rose' && 'bg-rose-100',
                  insight.color === 'gold' && 'bg-gold-50',
                  insight.color === 'green' && 'bg-green-50',
                )}>
                  <insight.icon className={cn(
                    'w-4 h-4',
                    insight.color === 'rose' && 'text-rose-400',
                    insight.color === 'gold' && 'text-gold-200',
                    insight.color === 'green' && 'text-green-500',
                  )} />
                </div>
                <p className="text-xs text-ivory-600">{insight.title}</p>
              </div>
              <p className="font-heading text-lg text-ivory-900">{insight.value}</p>
              <p className="text-xs text-ivory-600 mt-1">{insight.detail}</p>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}