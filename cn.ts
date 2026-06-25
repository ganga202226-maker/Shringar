import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  Clock3,
  Camera,
  Star,
  Upload,
  Loader2,
  ImageIcon,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { BookingCard } from '../components/shared/BookingCard';
import { EmptyState } from '../components/ui/EmptyState';
import { LoadingShimmer } from '../components/ui/LoadingShimmer';
import { cn } from '../utils/cn';
import { useAuthStore } from '../store/authStore';
import { useMyBookings } from '../hooks/useSalon';
import { uploadTrialPhoto } from '../services/storage';
import toast from 'react-hot-toast';

import type { Booking } from '../types';

type Tab = 'upcoming' | 'trials' | 'past';

export default function MyBookingsPage() {
  const [activeTab, setActiveTab] = useState<Tab>('upcoming');
  const [uploadingFor, setUploadingFor] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user } = useAuthStore();
  const { data: bookings, isLoading } = useMyBookings(user?.id);

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'upcoming', label: 'Upcoming', icon: <Calendar className="w-4 h-4" /> },
    { id: 'trials', label: 'Trials', icon: <Clock3 className="w-4 h-4" /> },
    { id: 'past', label: 'Past', icon: <CheckCircle className="w-4 h-4" /> },
  ];

  const allBookings: any[] = bookings || [];

  // Filter by tab using the correct DB column: booking_type
  const filteredBookings = allBookings.filter((b: any) => {
    const status = (b.status || '').toUpperCase();
    if (activeTab === 'upcoming') return status === 'CONFIRMED' || status === 'PENDING';
    if (activeTab === 'trials') {
      const bookingType = (b.booking_type || b.type || '').toUpperCase();
      return bookingType === 'TRIAL';
    }
    return status === 'COMPLETED' || status === 'CANCELLED';
  });

  // Trial bookings for the trial tracker (subset of filtered)
  const trialBookings = filteredBookings.filter(
    (b: any) => (b.booking_type || b.type || '').toUpperCase() === 'TRIAL'
  );

  // Handle file upload for trial photos
  const handleUploadTrialPhoto = async (bookingId: string, file: File) => {
    if (!file) return;
    setUploadingFor(bookingId);
    try {
      const url = await uploadTrialPhoto(bookingId, file);
      toast.success('Trial photo uploaded!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload photo');
    } finally {
      setUploadingFor(null);
    }
  };

  const handleFileSelected = (bookingId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUploadTrialPhoto(bookingId, file);
    }
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-20">
      <Helmet>
        <title>My Bookings — Shringar</title>
        <meta name="description" content="View and manage your bridal beauty bookings." />
      </Helmet>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-heading text-3xl text-rose-800 mb-6">My Bookings</h1>

        {/* Tabs */}
        <div className="flex gap-2 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium transition-all cursor-pointer',
                activeTab === tab.id
                  ? 'bg-rose-400 text-white shadow-sm'
                  : 'bg-white text-ivory-600 border border-ivory-200 hover:border-rose-400'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Bookings List */}
        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 2 }).map((_, i) => (
              <div key={i} className="card p-4">
                <LoadingShimmer className="h-6 w-48" />
                <LoadingShimmer className="h-4 w-32 mt-2" />
              </div>
            ))}
          </div>
        ) : filteredBookings.length === 0 ? (
          <EmptyState
            icon={<Calendar className="w-16 h-16" />}
            title="No bookings yet"
            description={
              activeTab === 'upcoming'
                ? "Your upcoming bookings will appear here. Start planning your bridal look!"
                : activeTab === 'trials'
                ? "You haven't booked any trials yet. Book a trial to test your look before the big day!"
                : "No past bookings found."
            }
            action={
              <Link to="/search">
                <Button variant="primary" size="md">
                  Browse Salons
                </Button>
              </Link>
            }
          />
        ) : (
          <div className="space-y-4">
            {filteredBookings.map((booking: any) => (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <BookingCard booking={booking} />
              </motion.div>
            ))}
          </div>
        )}

        {/* Trial Tracker Section — only for trial bookings */}
        {activeTab === 'trials' && trialBookings.length > 0 && (
          <div className="mt-10">
            <h2 className="font-heading text-xl text-rose-800 mb-4">Trial Tracker</h2>
            {trialBookings.map((booking: any) => (
              <div key={booking.id} className="card p-6 mb-4">
                <div className="flex items-center justify-between flex-wrap gap-4">
                  {[
                    { label: 'Booked', done: true },
                    { label: 'Trial Done', done: false },
                    { label: 'Feedback', done: false },
                    { label: 'Confirmed', done: false },
                  ].map((step, i) => (
                    <div key={step.label} className="flex items-center gap-2">
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium',
                          step.done ? 'bg-rose-400 text-white' : 'bg-ivory-100 text-ivory-600'
                        )}
                      >
                        {step.done ? <CheckCircle className="w-4 h-4" /> : i + 1}
                      </div>
                      <span
                        className={cn(
                          'text-xs font-medium',
                          step.done ? 'text-ivory-900' : 'text-ivory-600'
                        )}
                      >
                        {step.label}
                      </span>
                      {i < 3 && <div className="hidden sm:block w-8 h-0.5 bg-ivory-200" />}
                    </div>
                  ))}
                </div>

                {/* Upload trial photos */}
                <div className="mt-6 p-4 bg-ivory-50 rounded-lg">
                  <p className="text-sm font-medium text-ivory-900 mb-3">
                    Upload Trial Photos
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileSelected(booking.id, e)}
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingFor === booking.id}
                      className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-ivory-200 text-sm text-ivory-700 hover:border-rose-400 hover:text-rose-600 transition-all cursor-pointer disabled:opacity-50"
                    >
                      {uploadingFor === booking.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Camera className="w-4 h-4" />
                      )}
                      {uploadingFor === booking.id ? 'Uploading...' : 'Upload Photo'}
                    </button>
                    <button className="flex items-center gap-2 px-4 py-2.5 bg-white rounded-xl border border-ivory-200 text-sm text-ivory-700 hover:border-rose-400 hover:text-rose-600 transition-all cursor-pointer">
                      <Star className="w-4 h-4" /> Rate Trial
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}