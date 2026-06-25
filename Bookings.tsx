import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Building2,
  Search,
  CheckCircle2,
  XCircle,
  Eye,
  ChevronRight,
  Shield,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface SalonRow {
  id: string;
  name: string;
  slug: string;
  area: string;
  city: string;
  is_active: boolean;
  subscription_tier: string;
  created_at: string;
  email: string;
  phone: string;
}

export default function AdminSalons() {
  const [salons, setSalons] = React.useState<SalonRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [filter, setFilter] = React.useState<'all' | 'active' | 'inactive'>('all');

  React.useEffect(() => { loadSalons(); }, []);

  async function loadSalons() {
    try {
      const { data, error } = await supabase
        .from('salons')
        .select('id, name, slug, area, city, is_active, subscription_tier, created_at, email, phone')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setSalons(data || []);
    } catch (err: any) {
      toast.error('Failed to load salons');
    } finally {
      setLoading(false);
    }
  }

  async function toggleSalonStatus(id: string, currentStatus: boolean) {
    try {
      const { error } = await supabase
        .from('salons')
        .update({ is_active: !currentStatus })
        .eq('id', id);
      if (error) throw error;
      setSalons(prev => prev.map(s => s.id === id ? { ...s, is_active: !currentStatus } : s));
      toast.success(currentStatus ? 'Salon deactivated' : 'Salon activated');
    } catch (err: any) {
      toast.error('Failed to update salon');
    }
  }

  const filtered = salons.filter(s => {
    if (filter === 'active' && !s.is_active) return false;
    if (filter === 'inactive' && s.is_active) return false;
    if (search && !s.name.toLowerCase().includes(search.toLowerCase()) && !s.area?.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="space-y-4 animate-pulse">
        {[1,2,3,4,5].map(i => <div key={i} className="card p-5 h-16" />)}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ivory-400" />
          <input
            type="text"
            placeholder="Search salons..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10 text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          {(['all', 'active', 'inactive'] as const).map(f => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                filter === f ? 'bg-rose-400 text-white' : 'bg-ivory-100 text-ivory-600 hover:bg-ivory-200'
              }`}
            >
              {f === 'all' ? 'All' : f === 'active' ? 'Active' : 'Inactive'}
            </button>
          ))}
        </div>
      </div>

      {/* Salon list */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={<Building2 className="w-12 h-12" />}
          title={search ? 'No salons match your search' : 'No salons yet'}
          description={search ? 'Try a different search term' : 'Salons will appear here once registered'}
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((salon, i) => (
            <motion.div
              key={salon.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
            >
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-200 to-rose-400 flex items-center justify-center text-white font-heading text-lg shrink-0">
                {salon.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-ivory-900 truncate">{salon.name}</p>
                  {salon.is_active ? (
                    <Badge variant="success" className="text-[10px]">Active</Badge>
                  ) : (
                    <Badge variant="gray" className="text-[10px]">Inactive</Badge>
                  )}
                  <Badge variant="gold" className="text-[10px] uppercase">{salon.subscription_tier}</Badge>
                </div>
                <p className="text-xs text-ivory-600 mt-0.5">{salon.area}, {salon.city}</p>
              </div>
              <div className="hidden sm:block text-xs text-ivory-600 text-right">
                <p>{salon.email}</p>
                <p>{salon.phone}</p>
              </div>
              <div className="flex items-center gap-2">
                <Link to={`/salon/${salon.slug}`} className="p-2 rounded-lg hover:bg-ivory-100 transition-colors">
                  <Eye className="w-4 h-4 text-ivory-600" />
                </Link>
                <button
                  onClick={() => toggleSalonStatus(salon.id, salon.is_active)}
                  className={`p-2 rounded-lg transition-colors cursor-pointer ${
                    salon.is_active ? 'hover:bg-red-50' : 'hover:bg-green-50'
                  }`}
                  title={salon.is_active ? 'Deactivate' : 'Activate'}
                >
                  {salon.is_active ? (
                    <XCircle className="w-4 h-4 text-red-400" />
                  ) : (
                    <CheckCircle2 className="w-4 h-4 text-green-500" />
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}