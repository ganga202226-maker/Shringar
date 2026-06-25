import React from 'react';
import { Link, useLocation, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  CalendarCheck,
  Image,
  Users,
  Package,
  BarChart3,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  Sparkles,
  Menu,
  X,
  ClipboardList,
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
  { path: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { path: '/dashboard/calendar', label: 'Calendar & Slots', icon: CalendarCheck },
  { path: '/dashboard/portfolio', label: 'Portfolio', icon: Image },
  { path: '/dashboard/services', label: 'Services', icon: Sparkles },
  { path: '/dashboard/bookings', label: 'Bookings', icon: ClipboardList },
  { path: '/dashboard/packages', label: 'Packages', icon: Package },
  { path: '/dashboard/artists', label: 'Artists', icon: Users },
  { path: '/dashboard/analytics', label: 'Analytics', icon: BarChart3 },
  { path: '/dashboard/settings', label: 'Settings', icon: Settings },
];

export function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const currentItem = sidebarItems.find(
    (item) =>
      item.path === location.pathname ||
      (item.path !== '/dashboard' && location.pathname.startsWith(item.path))
  );

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen pt-16 md:pt-20 bg-ivory-50">
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
            <span className="font-heading text-base text-rose-800 font-semibold">Dashboard</span>
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
              (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
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

        {/* User info & logout */}
        <div className="border-t border-ivory-100 p-3">
          {sidebarOpen && user && (
            <div className="flex items-center gap-3 mb-3 px-1">
              <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-200 flex items-center justify-center shrink-0">
                <span className="text-xs font-medium text-rose-600">
                  {user.name?.charAt(0) || 'S'}
                </span>
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

      {/* Main content */}
      <main
        className={cn(
          'transition-all duration-300 min-h-screen pb-24 md:pb-8',
          sidebarOpen ? 'md:ml-60' : 'md:ml-16'
        )}
      >
        {/* Top bar mobile */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-ivory-200">
          <button
            onClick={() => setMobileOpen(true)}
            className="p-1.5 rounded-lg hover:bg-ivory-100 transition-colors cursor-pointer"
          >
            <Menu className="w-5 h-5 text-ivory-600" />
          </button>
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-rose-400" />
            <span className="font-heading text-sm text-rose-800 font-semibold">Shringar</span>
          </div>
          <div className="w-8" />
        </div>

        {/* Page header */}
        <div className="px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-heading text-2xl text-rose-800">
                {currentItem?.label || 'Dashboard'}
              </h1>
              <p className="text-sm text-ivory-600 mt-1">
                Manage your salon, artists, bookings & more
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