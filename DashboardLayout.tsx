import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  Plus,
  X,
  Calendar as CalendarIcon,
  CheckCircle2,
  Trash2,
} from 'lucide-react';
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  isSameMonth,
  isSameDay,
  isToday,
  addMonths,
  subMonths,
  startOfWeek,
  endOfWeek,
} from 'date-fns';
import { Button } from '../../components/ui/Button';
import { LoadingShimmer } from '../../components/ui/LoadingShimmer';
import { Modal } from '../../components/ui/Modal';
import { useAuthStore } from '../../store/authStore';
import { useMySalon, useSalonBookings, useTimeSlots, useCreateTimeSlot, useDeleteTimeSlot } from '../../hooks/useSalon';
import toast from 'react-hot-toast';

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function DashboardCalendar() {
  const { user } = useAuthStore();
  const { data: salon, isLoading: salonLoading } = useMySalon(user?.id);
  const { data: bookings } = useSalonBookings(salon?.id);

  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today);
  const [selectedDate, setSelectedDate] = useState(today);
  const [isAddSlotOpen, setIsAddSlotOpen] = useState(false);
  const [newSlotTime, setNewSlotTime] = useState('10:00');
  const [newSlotDuration, setNewSlotDuration] = useState('60');
  const [formSubmitting, setFormSubmitting] = useState(false);

  const selectedDateStr = format(selectedDate, 'yyyy-MM-dd');
  const { data: timeSlots, isLoading: slotsLoading } = useTimeSlots(salon?.id, selectedDateStr);
  const createSlot = useCreateTimeSlot();
  const deleteSlot = useDeleteTimeSlot();

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const calStart = startOfWeek(monthStart);
  const calEnd = endOfWeek(monthEnd);
  const daysInMonth = eachDayOfInterval({ start: calStart, end: calEnd });

  // Build a set of dates that have bookings from the real data
  const bookedDatesSet = new Set<string>();
  (bookings || []).forEach((b: any) => {
    const d = b.booking_date || b.date;
    if (d) bookedDatesSet.add(d);
  });
  // Also mark dates with time slots that are booked
  if (timeSlots) {
    timeSlots.forEach((s: any) => {
      if (s.is_booked) bookedDatesSet.add(s.date);
    });
  }

  const hasBookingsOnDate = (date: Date) =>
    bookedDatesSet.has(format(date, 'yyyy-MM-dd'));

  // Stats
  const todayStr = format(today, 'yyyy-MM-dd');
  const todayBookings = (bookings || []).filter(
    (b: any) => (b.booking_date || b.date) === todayStr
  );
  const todaySlots = timeSlots || [];
  const todaySlotsAvailable = todaySlots.filter((s: any) => !s.is_booked).length;

  const selectedSlots = timeSlots || [];
  const bookedCount = selectedSlots.filter((s: any) => s.is_booked).length;
  const availableCount = selectedSlots.filter((s: any) => !s.is_booked).length;

  // Week stats
  const weekStart = startOfWeek(today);
  const weekEnd = endOfWeek(today);
  const weekBookings = (bookings || []).filter((b: any) => {
    const d = new Date(b.booking_date || b.date);
    return d >= weekStart && d <= weekEnd;
  });

  const handleAddSlot = async () => {
    if (!salon) return;
    setFormSubmitting(true);
    try {
      const startTime = newSlotTime;
      const [h, m] = startTime.split(':').map(Number);
      const totalMin = h * 60 + m + Number(newSlotDuration);
      const endH = Math.floor(totalMin / 60);
      const endM = totalMin % 60;
      const endTime = `${String(endH).padStart(2, '0')}:${String(endM).padStart(2, '0')}`;

      await createSlot.mutateAsync({
        salon_id: salon.id,
        date: selectedDateStr,
        start_time: startTime,
        end_time: endTime,
        is_booked: false,
      });
      setIsAddSlotOpen(false);
      setNewSlotTime('10:00');
      setNewSlotDuration('60');
    } catch {
      toast.error('Failed to add slot');
    } finally {
      setFormSubmitting(false);
    }
  };

  if (salonLoading) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-4">
            <LoadingShimmer className="h-8 w-16" />
            <LoadingShimmer className="h-4 w-24 mt-2" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: "Today's Bookings", value: String(todayBookings.length), color: 'rose' },
          { label: 'Available Slots Today', value: String(todaySlotsAvailable), color: 'green' },
          { label: 'This Week', value: `${weekBookings.length} bookings`, color: 'gold' },
          { label: 'Total Slots Today', value: String(todaySlots.length), color: 'rose' },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className="card p-4"
          >
            <p className="text-2xl font-heading text-ivory-900">{stat.value}</p>
            <p className="text-xs text-ivory-600 mt-1">{stat.label}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 card p-5"
        >
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-heading text-lg text-ivory-900">Calendar</h2>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentMonth(subMonths(currentMonth, 1))}
                className="p-1.5 rounded-lg hover:bg-ivory-100 transition-colors cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4 text-ivory-600" />
              </button>
              <span className="text-sm font-medium text-ivory-900 min-w-[140px] text-center">
                {format(currentMonth, 'MMMM yyyy')}
              </span>
              <button
                onClick={() => setCurrentMonth(addMonths(currentMonth, 1))}
                className="p-1.5 rounded-lg hover:bg-ivory-100 transition-colors cursor-pointer"
              >
                <ChevronRight className="w-4 h-4 text-ivory-600" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 mb-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
              <div key={d} className="text-center text-xs text-ivory-600 font-medium py-2">{d}</div>
            ))}
          </div>

          <div className="grid grid-cols-7 gap-1">
            {daysInMonth.map((date) => {
              const isSelected = isSameDay(date, selectedDate);
              const hasBooking = hasBookingsOnDate(date);
              const isCurrentMonth = isSameMonth(date, currentMonth);
              const isDateToday = isToday(date);

              return (
                <button
                  key={date.toISOString()}
                  onClick={() => setSelectedDate(date)}
                  className={cn(
                    'relative p-2 text-center rounded-xl transition-all cursor-pointer',
                    isSelected && 'bg-rose-400 text-white',
                    !isSelected && isCurrentMonth && 'hover:bg-ivory-100',
                    !isCurrentMonth && 'text-ivory-400'
                  )}
                >
                  <span className={cn(
                    'text-sm font-medium',
                    isDateToday && !isSelected && 'text-rose-400'
                  )}>
                    {format(date, 'd')}
                  </span>
                  {hasBooking && (
                    <div className={cn(
                      'w-1.5 h-1.5 rounded-full mx-auto mt-1',
                      isSelected ? 'bg-white' : 'bg-rose-400'
                    )} />
                  )}
                </button>
              );
            })}
          </div>
        </motion.div>

        {/* Day details */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-heading text-base text-ivory-900">
                {format(selectedDate, 'dd MMM yyyy')}
              </h3>
              <p className="text-xs text-ivory-600 mt-0.5">
                {bookedCount} booked · {availableCount} available
              </p>
            </div>
            <Button variant="primary" size="sm" onClick={() => setIsAddSlotOpen(true)}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Add Slot
            </Button>
          </div>

          <div className="space-y-2 max-h-[400px] overflow-y-auto">
            {slotsLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 3 }).map((_, i) => (
                  <LoadingShimmer key={i} className="h-14 w-full rounded-xl" />
                ))}
              </div>
            ) : selectedSlots.length > 0 ? (
              selectedSlots.map((slot: any) => (
                <div
                  key={slot.id}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-xl border transition-colors',
                    slot.is_booked
                      ? 'bg-rose-50 border-rose-200'
                      : 'bg-ivory-50 border-ivory-200 hover:border-rose-200'
                  )}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center shrink-0',
                    slot.is_booked ? 'bg-rose-100' : 'bg-white'
                  )}>
                    <Clock className={cn(
                      'w-4 h-4',
                      slot.is_booked ? 'text-rose-400' : 'text-ivory-600'
                    )} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ivory-900">
                      {slot.start_time} — {slot.end_time}
                    </p>
                  </div>
                  <div className="shrink-0">
                    {slot.is_booked ? (
                      <CheckCircle2 className="w-4 h-4 text-rose-400" />
                    ) : (
                      <button
                        onClick={() => deleteSlot.mutate(slot.id)}
                        className="p-1 rounded hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Remove slot"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-ivory-400 hover:text-rose-400" />
                      </button>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <CalendarIcon className="w-10 h-10 text-ivory-400 mb-3" />
                <p className="text-sm text-ivory-600">No slots configured</p>
                <p className="text-xs text-ivory-400 mt-1">Add time slots for this day</p>
              </div>
            )}
          </div>
        </motion.div>
      </div>

      {/* Add Slot Modal */}
      <Modal
        isOpen={isAddSlotOpen}
        onClose={() => setIsAddSlotOpen(false)}
        title="Add Time Slot"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ivory-900 mb-1.5">Date</label>
            <p className="text-sm text-ivory-600">{format(selectedDate, 'dd MMM yyyy')}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-ivory-900 mb-1.5">Start Time</label>
            <input
              type="time"
              value={newSlotTime}
              onChange={(e) => setNewSlotTime(e.target.value)}
              className="input-field"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-ivory-900 mb-1.5">Duration</label>
            <select className="input-field" value={newSlotDuration} onChange={(e) => setNewSlotDuration(e.target.value)}>
              <option value="30">30 min</option>
              <option value="60">1 hour</option>
              <option value="90">1.5 hours</option>
              <option value="120">2 hours</option>
              <option value="180">3 hours</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" size="md" className="flex-1" onClick={() => setIsAddSlotOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" className="flex-1" onClick={handleAddSlot} disabled={formSubmitting}>
              {formSubmitting ? 'Adding...' : 'Add Slot'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}