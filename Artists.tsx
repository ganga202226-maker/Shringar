import React from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  LayoutDashboard,
  Building2,
  Users,
  Star,
  Settings,
  LogOut,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Shield,
  AlertTriangle,
} from 'lucide-react';
import { cn } from '../../utils/cn';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { useAuthStore } from '../../store/authStore';

interface SidebarItem {
  path: string;
  label: string;
  icon: React.ElementType;
  badge?: string;
}

const sidebarItems: SidebarItem[] = [
  { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/admin/salons', label: 'Salons', icon: Building2, badge: '10' },
  { path: '/admin/users', label: 'Users', icon: Users },
  { path: '/admin/reviews', label: 'Reviews', icon: Star },
  { path: '/admin/settings', label: 'Settings', icon: Settings },
];

export function AdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const currentItem = sidebarItems.find(
    (item) =>
      item.path === location.pathname ||
      (item.path !== '/admin' && location.pathname.startsWith(item.path))
  );

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  // Redirect non-admin users
  React.useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/');
    }
  }, [user, navigate]);

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-rose-300 mx-auto mb-4" />
          <h1 className="font-heading text-2xl text-rose-800 mb-2">Access Restricted</h1>
          <p className="text-ivory-600 mb-6">Only administrators can access this panel.</p>
          <Link to="/">
            <Button variant="primary" size="md">Go Home</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pt-16 md:pt-20 bg-ivory-50">
      <Helmet>
        <title>Admin Panel — Shringar</title>
      </Helmet>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-30 bg-black/40 md:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed left-0 top-16 md:top-20 z-40 h-[calc(100vh-4rem)] md:h-[calc(100vh-5rem)]',
          'bg-white border-r border-ivory-200 transition-all duration-300 flex flex-col',
          sidebarOpen ? 'w-60' : 'w-16',
          mobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        )}
      >
        {/* Toggle */}
        <div className="flex items-center justify-between px-3 py-4 border-b border-ivory-100">
          {sidebarOpen && (
            <div className="flex items-center gap-2">
              <Shield className="w-4 h-4 text-rose-400" />
              <span className="font-heading text-sm text-rose-800 font-semibold">Admin Panel</span>
            </div>
          )}
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="hidden md:flex p-1.5 rounded-lg hover:bg-ivory-100 transition-colors cursor-pointer"
          >
            {sidebarOpen ? (
              <ChevronLeft className="w-4 h-4 text-ivory-600" />
            ) : (
              <ChevronRight className="w-4 h-4 text-ivory-600" />
            )}
          </button>
          <button
            onClick={() => setMobileOpen(false)}
            className="md:hidden p-1.5 rounded-lg hover:bg-ivory-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4 text-ivory-600" />
          </button>
        </div>

        {/* Nav items */}
        <nav className="flex-1 overflow-y-auto px-2 py-4 space-y-1">
          {sidebarItems.map((item) => {
            const isActive =
              item.path === location.pathname ||
              (item.path !== '/admin' && location.pathname.startsWith(item.path));
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group',
                  isActive
                    ? 'bg-rose-50 text-rose-800 font-medium'
                    : 'text-ivory-600 hover:bg-ivory-100 hover:text-ivory-900'
                )}
              >
                <item.icon className={cn(
                  'w-5 h-5 shrink-0',
                  isActive ? 'text-rose-400' : 'text-ivory-600 group-hover:text-rose-400 transition-colors'
                )} />
                {sidebarOpen && (
                  <span className="text-sm truncate flex-1">{item.label}</span>
                )}
                {sidebarOpen && item.badge && (
                  <Badge variant="rose" className="text-[10px] px-1.5 py-0.5">{item.badge}</Badge>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="border-t border-ivory-100 p-3">
          {sidebarOpen && user && (
            <div className="flex items-center gap-3 mb-3 px-1">
              <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                <span className="text-xs font-medium text-rose-600">A</span>
              </div>
              <div className="truncate min-w-0">
                <p className="text-sm font-medium text-ivory-900 truncate">{user.name}</p>
                <p className="text-xs text-ivory-600 truncate">{user.email}</p>
              </div>
            </div>
          )}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-ivory-600 hover:bg-rose-50 hover:text-rose-600 transition-all duration-200 text-sm cursor-pointer"
          >
            <LogOut className="w-5 h-5 shrink-0" />
            {sidebarOpen && <span>Log out</span>}
          </button>
        </div>
      </aside>

      {/* Mobile hamburger */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-ivory-200">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-1.5 rounded-lg hover:bg-ivory-100 transition-colors cursor-pointer"
        >
          <Menu className="w-5 h-5 text-ivory-600" />
        </button>
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-rose-400" />
          <span className="font-heading text-sm text-rose-800 font-semibold">Admin</span>
        </div>
        <div className="w-8" />
      </div>

      {/* Main */}
      <main
        className={cn(
          'transition-all duration-300 min-h-screen pb-24 md:pb-8',
          sidebarOpen ? 'md:ml-60' : 'md:ml-16'
        )}
      >
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-2xl text-rose-800">
                {currentItem?.label || 'Admin Dashboard'}
              </h1>
              <p className="text-sm text-ivory-600 mt-1">
                Manage salons, users, reviews & platform settings
              </p>
            </div>
          </div>
        </div>

        <div className="px-4 sm:px-6 lg:px-8 pb-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}