import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  CheckCircle2,
  XCircle,
  AlertCircle,
  CalendarDays,
  IndianRupee,
  User,
  Clock,
  FileText,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { LoadingShimmer } from '../../components/ui/LoadingShimmer';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatPrice, formatDate } from '../../utils/format';
import { useAuthStore } from '../../store/authStore';
import { useMySalon, useSalonBookings, useUpdateBooking } from '../../hooks/useSalon';
import toast from 'react-hot-toast';

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

type StatusTab = 'all' | 'pending' | 'confirmed' | 'completed' | 'cancelled';

const STATUS_TABS: { key: StatusTab; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'confirmed', label: 'Confirmed' },
  { key: 'completed', label: 'Completed' },
  { key: 'cancelled', label: 'Cancelled' },
];

function getStatusBadgeVariant(status: string): 'rose' | 'gold' | 'success' | 'gray' {
  switch (status.toLowerCase()) {
    case 'pending': return 'gold';
    case 'confirmed': return 'success';
    case 'completed': return 'gray';
    case 'cancelled': return 'rose';
    default: return 'gray';
  }
}

function getPaymentBadgeVariant(status?: string): 'gold' | 'success' | 'gray' | 'rose' {
  switch (status?.toLowerCase()) {
    case 'paid': return 'success';
    case 'partial': return 'gold';
    case 'pending': return 'gray';
    case 'refunded': return 'rose';
    default: return 'gray';
  }
}

export default function DashboardBookings() {
  const { user } = useAuthStore();
  const { data: salon } = useMySalon(user?.id);
  const { data: bookings, isLoading } = useSalonBookings(salon?.id);
  const updateBooking = useUpdateBooking();

  const [activeTab, setActiveTab] = useState<StatusTab>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [cancelModal, setCancelModal] = useState<{
    booking: any;
    reason: string;
  } | null>(null);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  // Filter bookings
  const filteredBookings = useMemo(() => {
    if (!bookings) return [];
    let filtered = bookings;

    // Status filter
    if (activeTab !== 'all') {
      filtered = filtered.filter((b: any) => b.status === activeTab);
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter((b: any) =>
        (b.customer_name || 'Customer').toLowerCase().includes(q)
      );
    }

    return filtered;
  }, [bookings, activeTab, searchQuery]);

  // Stats
  const stats = useMemo(() => {
    if (!bookings) return { today: 0, week: 0, pending: 0 };
    const today = new Date().toISOString().split('T')[0];
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    return {
      today: bookings.filter((b: any) => (b.booking_date || b.date) === today).length,
      week: bookings.filter((b: any) => (b.booking_date || b.date) >= weekAgo).length,
      pending: bookings.filter((b: any) => b.status === 'pending').length,
    };
  }, [bookings]);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    setActionLoading(id);
    try {
      await updateBooking.mutateAsync({
        id,
        updates: { status: newStatus },
      });
    } catch {
      toast.error('Failed to update booking');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelBooking = async () => {
    if (!cancelModal) return;
    setActionLoading(cancelModal.booking.id);
    try {
      await updateBooking.mutateAsync({
        id: cancelModal.booking.id,
        updates: {
          status: 'cancelled',
          cancellation_reason: cancelModal.reason || null,
        },
      });
      setCancelModal(null);
    } catch {
      toast.error('Failed to cancel booking');
    } finally {
      setActionLoading(null);
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-5">
            <div className="flex items-start gap-4">
              <LoadingShimmer className="w-10 h-10 rounded-full shrink-0" />
              <div className="flex-1 space-y-2">
                <LoadingShimmer className="h-5 w-40" />
                <LoadingShimmer className="h-4 w-64" />
                <LoadingShimmer className="h-4 w-24" />
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card p-3 text-center">
          <p className="text-2xl font-heading text-rose-800">{stats.today}</p>
          <p className="text-xs text-ivory-600 mt-1">Today</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-2xl font-heading text-rose-800">{stats.week}</p>
          <p className="text-xs text-ivory-600 mt-1">This Week</p>
        </div>
        <div className="card p-3 text-center">
          <p className="text-2xl font-heading text-rose-800">{stats.pending}</p>
          <p className="text-xs text-ivory-600 mt-1">Pending</p>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex gap-1 bg-ivory-100 rounded-xl p-1 overflow-x-auto">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={cn(
                'px-3 py-1.5 text-xs font-medium rounded-lg transition-all whitespace-nowrap cursor-pointer',
                activeTab === tab.key
                  ? 'bg-white text-rose-800 shadow-sm'
                  : 'text-ivory-600 hover:text-ivory-900'
              )}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-ivory-400" />
          <input
            className="input-field pl-9 w-full"
            placeholder="Search by customer name..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Bookings list */}
      {filteredBookings.length === 0 ? (
        <EmptyState
          icon={CalendarDays}
          title={searchQuery ? 'No matching bookings' : 'No bookings yet'}
          description={
            searchQuery
              ? 'Try a different search term'
              : 'Bookings from customers will appear here'
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredBookings.map((booking: any, i: number) => {
            const bDate = booking.booking_date || booking.date;
            const bTime = booking.start_time || booking.time;
            const customerName = booking.customer_name || 'Customer';
            const amount = booking.total_amount || booking.totalAmount || 0;
            const paymentStatus = booking.payment_status || booking.paymentStatus;
            const isReadOnly = booking.status === 'completed' || booking.status === 'cancelled';

            return (
              <motion.div
                key={booking.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="card p-4 sm:p-5"
              >
                <div className="flex items-start justify-between gap-4">
                  {/* Left: Customer info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full bg-rose-50 border border-rose-100 flex items-center justify-center shrink-0">
                        <User className="w-4 h-4 text-rose-400" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-ivory-900">{customerName}</h3>
                        <div className="flex items-center gap-2 text-xs text-ivory-600 mt-0.5">
                          <span className="flex items-center gap-1">
                            <CalendarDays className="w-3 h-3" />
                            {bDate ? formatDate(bDate) : '—'}
                          </span>
                          {bTime && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {bTime}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Details row */}
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3 text-xs text-ivory-600">
                      {amount > 0 && (
                        <span className="font-medium text-ivory-900">
                          {formatPrice(amount)}
                        </span>
                      )}
                      {paymentStatus && (
                        <Badge variant={getPaymentBadgeVariant(paymentStatus)} className="text-[10px]">
                          {paymentStatus}
                        </Badge>
                      )}
                      {booking.notes && (
                        <span className="flex items-center gap-1 max-w-[200px] truncate" title={booking.notes}>
                          <FileText className="w-3 h-3 shrink-0" />
                          {booking.notes}
                        </span>
                      )}
                    </div>

                    {booking.cancellation_reason && (
                      <div className="mt-2 p-2 bg-rose-50 rounded-lg">
                        <p className="text-xs text-rose-700">
                          <span className="font-medium">Reason: </span>
                          {booking.cancellation_reason}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Right: Status & Actions */}
                  <div className="flex flex-col items-end gap-2 shrink-0">
                    <Badge variant={getStatusBadgeVariant(booking.status)}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Badge>

                    {!isReadOnly && (
                      <div className="flex gap-1.5">
                        {booking.status === 'pending' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                              disabled={actionLoading === booking.id}
                              className="p-1.5 rounded-lg bg-green-50 hover:bg-green-100 transition-colors cursor-pointer disabled:opacity-50"
                              title="Confirm booking"
                            >
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            </button>
                            <button
                              onClick={() => setCancelModal({ booking, reason: '' })}
                              disabled={actionLoading === booking.id}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer disabled:opacity-50"
                              title="Cancel booking"
                            >
                              <XCircle className="w-4 h-4 text-rose-500" />
                            </button>
                          </>
                        )}
                        {booking.status === 'confirmed' && (
                          <>
                            <button
                              onClick={() => handleStatusUpdate(booking.id, 'completed')}
                              disabled={actionLoading === booking.id}
                              className="p-1.5 rounded-lg bg-green-50 hover:bg-green-100 transition-colors cursor-pointer disabled:opacity-50"
                              title="Mark complete"
                            >
                              <CheckCircle2 className="w-4 h-4 text-green-600" />
                            </button>
                            <button
                              onClick={() => setCancelModal({ booking, reason: '' })}
                              disabled={actionLoading === booking.id}
                              className="p-1.5 rounded-lg bg-rose-50 hover:bg-rose-100 transition-colors cursor-pointer disabled:opacity-50"
                              title="Cancel booking"
                            >
                              <XCircle className="w-4 h-4 text-rose-500" />
                            </button>
                          </>
                        )}
                        {actionLoading === booking.id && (
                          <span className="text-xs text-ivory-600 flex items-center">Updating...</span>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Cancel Booking Modal */}
      <Modal
        isOpen={!!cancelModal}
        onClose={() => setCancelModal(null)}
        title="Cancel Booking"
        size="sm"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg">
            <AlertCircle className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="text-sm text-amber-800">
              This will cancel the booking for{' '}
              <strong>{cancelModal?.booking?.customer_name || 'this customer'}</strong>.
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-ivory-900 mb-1.5">
              Cancellation Reason
            </label>
            <textarea
              className="input-field min-h-[80px]"
              placeholder="e.g. Customer requested cancellation, date unavailable..."
              value={cancelModal?.reason || ''}
              onChange={(e) =>
                setCancelModal((prev) =>
                  prev ? { ...prev, reason: e.target.value } : null
                )
              }
            />
          </div>
          <div className="flex gap-3 pt-2">
            <Button
              variant="secondary"
              size="md"
              className="flex-1"
              onClick={() => setCancelModal(null)}
            >
              Keep Booking
            </Button>
            <Button
              variant="primary"
              size="md"
              className="flex-1 bg-rose-600 hover:bg-rose-800"
              onClick={handleCancelBooking}
              disabled={actionLoading === cancelModal?.booking?.id}
            >
              {actionLoading === cancelModal?.booking?.id ? 'Cancelling...' : 'Cancel Booking'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
