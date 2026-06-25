import React, { Suspense, lazy, useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { HelmetProvider } from 'react-helmet-async';

import { Navbar } from './components/layout/Navbar';
import { BottomNav } from './components/layout/BottomNav';
import { LoadingShimmer } from './components/ui/LoadingShimmer';
import { useAuthStore } from './store/authStore';

// Lazy load pages
const HomePage = lazy(() => import('./pages/Home'));
const SearchPage = lazy(() => import('./pages/Search'));
const SalonProfilePage = lazy(() => import('./pages/SalonProfile'));
const PackagePlannerPage = lazy(() => import('./pages/PackagePlanner'));
const AIStudioPage = lazy(() => import('./pages/AIStudio'));
const MyBookingsPage = lazy(() => import('./pages/MyBookings'));
const ProfilePage = lazy(() => import('./pages/Profile'));

// Dashboard layout & pages
const DashboardLayout = lazy(() => import('./pages/dashboard/DashboardLayout').then(m => ({ default: m.DashboardLayout })));
const DashboardOverview = lazy(() => import('./pages/dashboard/Overview'));
const DashboardCalendar = lazy(() => import('./pages/dashboard/Calendar'));
const DashboardPortfolio = lazy(() => import('./pages/dashboard/Portfolio'));
const DashboardArtists = lazy(() => import('./pages/dashboard/Artists'));
const DashboardPackages = lazy(() => import('./pages/dashboard/Packages'));
const DashboardServices = lazy(() => import('./pages/dashboard/Services'));
const DashboardBookings = lazy(() => import('./pages/dashboard/Bookings'));
const DashboardAnalytics = lazy(() => import('./pages/dashboard/Analytics'));
const DashboardSettings = lazy(() => import('./pages/dashboard/Settings'));

// Auth pages
const LoginPage = lazy(() => import('./pages/auth/AuthPages').then(m => ({ default: m.LoginPage })));
const RegisterPage = lazy(() => import('./pages/auth/AuthPages').then(m => ({ default: m.RegisterPage })));
const ForgotPasswordPage = lazy(() => import('./pages/auth/AuthPages').then(m => ({ default: m.ForgotPasswordPage })));

// Admin pages
const AdminLayout = lazy(() => import('./pages/admin/AdminLayout').then(m => ({ default: m.AdminLayout })));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminSalons = lazy(() => import('./pages/admin/AdminSalons'));
const AdminUsers = lazy(() => import('./pages/admin/AdminUsers'));
const AdminReviews = lazy(() => import('./pages/admin/AdminReviews'));
const AdminSettings = lazy(() => import('./pages/admin/AdminSettings'));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
});

function PageLoader() {
  return (
    <div className="min-h-screen pt-24 px-4">
      <div className="max-w-7xl mx-auto space-y-4">
        <LoadingShimmer className="h-10 w-64" />
        <LoadingShimmer className="h-6 w-96" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="card overflow-hidden">
              <LoadingShimmer className="h-48 w-full" />
              <div className="p-4 space-y-3">
                <LoadingShimmer className="h-5 w-3/4" />
                <LoadingShimmer className="h-4 w-1/2" />
                <LoadingShimmer className="h-6 w-24" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
export default function App() {
  const initialize = useAuthStore((s) => s.initialize);
  const isLoading = useAuthStore((s) => s.isLoading);
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Debug: log auth state on every change
  useEffect(() => {
    console.log('🔐 Auth Store State:', {
      user: user ? { id: user.id, email: user.email, name: user.name, role: user.role } : null,
      isLoading,
    });
  }, [user, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="animate-pulse">
            <svg className="w-12 h-12 text-rose-400 mx-auto" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
          <p className="text-ivory-600 text-sm">Loading Shringar...</p>
        </div>
      </div>
    );
  }

  return (
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <BrowserRouter>
          <Toaster
            position="top-center"
            toastOptions={{
              duration: 4000,
              style: {
                background: '#fff',
                color: '#2C2C2A',
                border: '1px solid #E8DDD9',
                borderRadius: '10px',
                boxShadow: '0 1px 3px rgba(180,120,120,0.08), 0 4px 16px rgba(180,120,120,0.06)',
              },
              success: { iconTheme: { primary: '#D4537E', secondary: '#fff' } },
              error: { iconTheme: { primary: '#D4537E', secondary: '#fff' } },
            }}
          />
          
          <div className="min-h-screen bg-bg">
            <Navbar />
            
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/" element={<HomePage />} />
                <Route path="/search" element={<SearchPage />} />
                <Route path="/salon/:slug" element={<SalonProfilePage />} />
                <Route path="/plan" element={<PackagePlannerPage />} />
                <Route path="/ai-studio" element={<AIStudioPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/forgot-password" element={<ForgotPasswordPage />} />
                <Route path="/my-bookings" element={<MyBookingsPage />} />
                <Route path="/profile" element={<ProfilePage />} />
                
                <Route path="/dashboard" element={<DashboardLayout />}>
                  <Route index element={<DashboardOverview />} />
                  <Route path="calendar" element={<DashboardCalendar />} />
                  <Route path="portfolio" element={<DashboardPortfolio />} />
                  <Route path="artists" element={<DashboardArtists />} />
                  <Route path="services" element={<DashboardServices />} />
                  <Route path="bookings" element={<DashboardBookings />} />
                  <Route path="packages" element={<DashboardPackages />} />
                  <Route path="analytics" element={<DashboardAnalytics />} />
                  <Route path="settings" element={<DashboardSettings />} />
                </Route>

                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="salons" element={<AdminSalons />} />
                  <Route path="users" element={<AdminUsers />} />
                  <Route path="reviews" element={<AdminReviews />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>

                <Route path="*" element={
                  <div className="min-h-screen pt-24 flex items-center justify-center">
                    <div className="text-center">
                      <h1 className="font-heading text-4xl text-rose-800 mb-2">Page not found</h1>
                      <p className="text-ivory-600">The page you&#39;re looking for doesn&#39;t exist.</p>
                    </div>
                  </div>
                } />
              </Routes>
            </Suspense>

            <BottomNav />
          </div>
        </BrowserRouter>
      </QueryClientProvider>
    </HelmetProvider>
  );
}
