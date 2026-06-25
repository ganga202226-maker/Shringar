import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Save,
  Clock,
  MapPin,
  Phone,
  Mail,
  Camera,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { LoadingShimmer } from '../../components/ui/LoadingShimmer';
import { useAuthStore } from '../../store/authStore';
import { useMySalon, useUpdateSalon, useWorkingHours, useUpsertWorkingHours, useSalonArtists, usePortfolioImages } from '../../hooks/useSalon';
import toast from 'react-hot-toast';

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function DashboardSettings() {
  const { user } = useAuthStore();
  const { data: salon, isLoading: salonLoading } = useMySalon(user?.id);
  const { data: workingHours, isLoading: hoursLoading } = useWorkingHours(salon?.id);
  const { data: artists } = useSalonArtists(salon?.id);
  const { data: portfolioImages } = usePortfolioImages(salon?.id);
  const updateSalon = useUpdateSalon();
  const upsertHours = useUpsertWorkingHours();

  // Form state for salon
  const [formName, setFormName] = useState('');
  const [formArea, setFormArea] = useState('');
  const [formCity, setFormCity] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  // Working hours state (local form copies)
  const [hoursForm, setHoursForm] = useState<Record<number, { open: string; close: string; is_closed: boolean }>>({});

  // Sync DB data into form state
  useEffect(() => {
    if (salon) {
      setFormName(salon.name || '');
      setFormArea(salon.area || '');
      setFormCity(salon.city || '');
      setFormPhone(salon.phone || '');
      setFormEmail(salon.email || '');
      setFormDescription(salon.description || '');
    }
  }, [salon]);

  useEffect(() => {
    if (workingHours && workingHours.length > 0) {
      const map: Record<number, { open: string; close: string; is_closed: boolean }> = {};
      workingHours.forEach((h: any) => {
        map[h.day_of_week] = {
          open: h.open_time || '09:00',
          close: h.close_time || '19:00',
          is_closed: h.is_closed,
        };
      });
      // Fill missing days
      for (let i = 0; i < 7; i++) {
        if (!map[i]) {
          map[i] = { open: '09:00', close: '19:00', is_closed: i === 0 }; // Sunday closed by default
        }
      }
      setHoursForm(map);
    } else if (!hoursLoading) {
      // Default values
      const map: Record<number, { open: string; close: string; is_closed: boolean }> = {};
      for (let i = 0; i < 7; i++) {
        map[i] = { open: '10:00', close: '19:00', is_closed: i === 0 };
      }
      setHoursForm(map);
    }
  }, [workingHours, hoursLoading]);

  const handleSaveSalon = async () => {
    if (!salon) return;
    setIsSaving(true);
    try {
      await updateSalon.mutateAsync({
        id: salon.id,
        updates: {
          name: formName,
          area: formArea,
          city: formCity,
          phone: formPhone,
          email: formEmail,
          description: formDescription,
        },
      });
      setIsSaved(true);
      setTimeout(() => setIsSaved(false), 2000);
    } catch {
      toast.error('Failed to save salon settings');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleClosed = (dayIndex: number) => {
    setHoursForm((prev) => ({
      ...prev,
      [dayIndex]: {
        ...prev[dayIndex],
        is_closed: !prev[dayIndex]?.is_closed,
      },
    }));
  };

  const updateTime = (dayIndex: number, field: 'open' | 'close', value: string) => {
    setHoursForm((prev) => ({
      ...prev,
      [dayIndex]: {
        ...prev[dayIndex],
        [field]: value,
      },
    }));
  };

  const handleSaveHours = async () => {
    if (!salon) return;
    try {
      for (const [dayIndexStr, val] of Object.entries(hoursForm)) {
        const dayIndex = Number(dayIndexStr);
        await upsertHours.mutateAsync({
          salon_id: salon.id,
          day_of_week: dayIndex,
          open_time: val.is_closed ? null : val.open,
          close_time: val.is_closed ? null : val.close,
          is_closed: val.is_closed,
        });
      }
      toast.success('Working hours saved');
    } catch {
      toast.error('Failed to save working hours');
    }
  };

  const isLoading = salonLoading || hoursLoading;

  if (isLoading) {
    return (
      <div className="space-y-8 max-w-3xl">
        <div className="card p-6">
          <LoadingShimmer className="h-6 w-48" />
          <LoadingShimmer className="h-4 w-64 mt-4" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {/* Salon Profile */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="card p-6"
      >
        <h2 className="font-heading text-lg text-ivory-900 mb-5">Salon Profile</h2>
        <div className="space-y-4">
          <div className="flex items-center gap-4 mb-6">
            <div className="relative w-20 h-20 rounded-xl bg-gradient-to-br from-rose-200 to-rose-400 flex items-center justify-center text-white font-heading text-3xl">
              {salon?.name?.charAt(0) || 'S'}
              <button className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-white border border-ivory-200 flex items-center justify-center shadow-sm hover:bg-ivory-50 transition-colors cursor-pointer">
                <Camera className="w-3.5 h-3.5 text-ivory-600" />
              </button>
            </div>
            <div>
              <h3 className="font-medium text-ivory-900">{salon?.name || 'Your Salon'}</h3>
              <p className="text-xs text-ivory-600">Change logo or cover photo</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input label="Salon Name" value={formName} onChange={(e) => setFormName(e.target.value)} />
            <Input label="Owner Name" value={user?.name || ''} disabled />
            <Input label="Phone" value={formPhone} onChange={(e) => setFormPhone(e.target.value)} icon={<Phone className="w-4 h-4" />} />
            <Input label="Email" value={formEmail} onChange={(e) => setFormEmail(e.target.value)} icon={<Mail className="w-4 h-4" />} />
            <Input label="Area" value={formArea} onChange={(e) => setFormArea(e.target.value)} icon={<MapPin className="w-4 h-4" />} />
            <Input label="City" value={formCity} onChange={(e) => setFormCity(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-ivory-900 mb-1.5">Description</label>
            <textarea
              className="input-field min-h-[80px]"
              placeholder="Describe your salon..."
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
            />
          </div>

          <Button variant="primary" size="md" onClick={handleSaveSalon} disabled={isSaving}>
            <Save className="w-4 h-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save Changes'}
          </Button>
          {isSaved && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              className="flex items-center gap-1 text-sm text-green-600 ml-2"
            >
              <CheckCircle2 className="w-4 h-4" />
              Saved!
            </motion.span>
          )}
        </div>
      </motion.section>

      {/* Working Hours */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.08 }}
        className="card p-6"
      >
        <h2 className="font-heading text-lg text-ivory-900 mb-5">Working Hours</h2>
        <div className="space-y-3">
          {DAYS.map((day, index) => {
            const dayData = hoursForm[index];
            if (!dayData) return null;
            const isClosed = dayData.is_closed;

            return (
              <div key={day} className="flex items-center gap-4 py-2 border-b border-ivory-100 last:border-0">
                <span className="w-28 text-sm font-medium text-ivory-900">{day}</span>
                {isClosed ? (
                  <span className="text-sm text-ivory-400">Closed</span>
                ) : (
                  <div className="flex items-center gap-2">
                    <input
                      type="time"
                      value={dayData.open}
                      onChange={(e) => updateTime(index, 'open', e.target.value)}
                      className="text-sm border border-ivory-200 rounded-lg px-2 py-1.5 focus:border-rose-400 outline-none"
                    />
                    <span className="text-ivory-400">to</span>
                    <input
                      type="time"
                      value={dayData.close}
                      onChange={(e) => updateTime(index, 'close', e.target.value)}
                      className="text-sm border border-ivory-200 rounded-lg px-2 py-1.5 focus:border-rose-400 outline-none"
                    />
                  </div>
                )}
                <button
                  onClick={() => toggleClosed(index)}
                  className={cn(
                    'ml-auto text-xs font-medium px-3 py-1 rounded-full transition-colors cursor-pointer',
                    isClosed
                      ? 'bg-rose-50 text-rose-400 hover:bg-rose-100'
                      : 'bg-ivory-50 text-ivory-600 hover:bg-ivory-100'
                  )}
                >
                  {isClosed ? 'Open this day' : 'Mark as closed'}
                </button>
              </div>
            );
          })}
        </div>
        <Button variant="primary" size="sm" className="mt-4" onClick={handleSaveHours} disabled={upsertHours.isPending}>
          {upsertHours.isPending ? 'Saving...' : 'Save Hours'}
        </Button>
      </motion.section>

      {/* Subscription */}
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="card p-6"
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-heading text-lg text-ivory-900 mb-1">Subscription</h2>
            <p className="text-sm text-ivory-600">You're on the <strong className="text-rose-400">{salon?.tier || 'Free'}</strong> plan</p>
          </div>
          <Badge variant="gold" className="text-xs">
            {salon?.is_active ? 'Active' : 'Inactive'}
          </Badge>
        </div>
        <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: 'Artists', value: `${artists?.length || 0} / 10` },
            { label: 'Photos', value: `${portfolioImages?.length || 0} / ∞` },
            { label: 'Homepage Feature', value: salon?.tier === 'ELITE' ? '✓' : '—' },
            { label: 'AI Studio', value: '✓' },
          ].map((item) => (
            <div key={item.label} className="bg-ivory-50 rounded-lg p-3 text-center">
              <p className="text-sm font-medium text-ivory-900">{item.value}</p>
              <p className="text-xs text-ivory-600 mt-0.5">{item.label}</p>
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}