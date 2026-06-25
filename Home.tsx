import React from 'react';
import { motion } from 'framer-motion';
import {
  Users,
  Search,
  Shield,
  Ban,
  CheckCircle2,
  Mail,
  UserCheck,
  UserX,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { EmptyState } from '../../components/ui/EmptyState';
import { supabase } from '../../lib/supabase';
import toast from 'react-hot-toast';

interface UserRow {
  id: string;
  email: string;
  name: string | null;
  phone: string | null;
  role: string;
  created_at: string;
}

export default function AdminUsers() {
  const [users, setUsers] = React.useState<UserRow[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [search, setSearch] = React.useState('');
  const [roleFilter, setRoleFilter] = React.useState<'all' | 'customer' | 'salon_owner' | 'admin'>('all');

  React.useEffect(() => { loadUsers(); }, []);

  async function loadUsers() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id, email, name, phone, role, created_at')
        .order('created_at', { ascending: false });
      if (error) throw error;
      setUsers(data || []);
    } catch (err: any) {
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  }

  const filtered = users.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (search && !u.name?.toLowerCase().includes(search.toLowerCase()) && !u.email.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const roleBadge = (role: string) => {
    switch (role) {
      case 'admin': return <Badge variant="rose" className="text-[10px]">Admin</Badge>;
      case 'salon_owner': return <Badge variant="gold" className="text-[10px]">Owner</Badge>;
      default: return <Badge variant="gray" className="text-[10px]">Customer</Badge>;
    }
  };

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
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input-field pl-10 text-sm"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {(['all', 'customer', 'salon_owner', 'admin'] as const).map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors cursor-pointer ${
                roleFilter === r ? 'bg-rose-400 text-white' : 'bg-ivory-100 text-ivory-600 hover:bg-ivory-200'
              }`}
            >
              {r === 'all' ? 'All' : r === 'salon_owner' ? 'Salon Owners' : r.charAt(0).toUpperCase() + r.slice(1) + 's'}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<Users className="w-12 h-12" />}
          title={search ? 'No users match your search' : 'No users found'}
          description="Users will appear here once they register"
        />
      ) : (
        <div className="space-y-3">
          {filtered.map((user, i) => (
            <motion.div
              key={user.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.02 }}
              className="card p-4 flex items-center gap-4 hover:shadow-md transition-shadow"
            >
              <div className="w-10 h-10 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                <span className="text-sm font-medium text-rose-600">
                  {user.name?.charAt(0) || user.email.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-medium text-ivory-900 truncate">
                    {user.name || 'Unnamed'}
                  </p>
                  {roleBadge(user.role)}
                </div>
                <div className="flex items-center gap-3 text-xs text-ivory-600 mt-0.5">
                  <span className="flex items-center gap-1"><Mail className="w-3 h-3" /> {user.email}</span>
                  {user.phone && <span>{user.phone}</span>}
                </div>
              </div>
              <div className="text-xs text-ivory-600 text-right shrink-0">
                {new Date(user.created_at).toLocaleDateString()}
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}