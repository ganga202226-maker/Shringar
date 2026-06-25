import React, { useState, useEffect, useRef, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  User,
  Heart,
  Sparkles,
  Bell,
  Crown,
  HelpCircle,
  ChevronRight,
  Camera,
  LogOut,
  Calendar,
  Gift,
  Loader2,
  Trash2,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { SalonCard } from '../components/shared/SalonCard';
import { EmptyState } from '../components/ui/EmptyState';
import { cn } from '../utils/cn';
import { formatDate, daysUntil } from '../utils/format';
import { useAuthStore } from '../store/authStore';
import { useWishlistStore } from '../store/wishlistStore';
import { useSalons, useMyBookings } from '../hooks/useSalon';
import { updateProfile } from '../services/api';
import { uploadAvatar } from '../services/storage';
import { savedLooksService } from '../services/savedLooks';
import type { SavedLook } from '../services/savedLooks';
import toast from 'react-hot-toast';

type Tab = 'profile' | 'wishlist' | 'saved-looks' | 'notifications' | 'subscription' | 'help';

const navItems: { id: Tab; label: string; icon: React.ReactNode }[] = [
  { id: 'profile', label: 'Profile', icon: <User className="w-5 h-5" /> },
  { id: 'wishlist', label: 'Wishlist', icon: <Heart className="w-5 h-5" /> },
  { id: 'saved-looks', label: 'Saved Looks', icon: <Sparkles className="w-5 h-5" /> },
  { id: 'notifications', label: 'Notifications', icon: <Bell className="w-5 h-5" /> },
  { id: 'subscription', label: 'Subscription', icon: <Crown className="w-5 h-5" /> },
  { id: 'help', label: 'Help & Support', icon: <HelpCircle className="w-5 h-5" /> },
];

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [weddingDate, setWeddingDate] = useState('');
  const [city, setCity] = useState('');
  const [skinTone, setSkinTone] = useState('');
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [savedLooks, setSavedLooks] = useState<SavedLook[]>([]);
  const [looksLoading, setLooksLoading] = useState(false);
  const [deletingLookId, setDeletingLookId] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { user, logout, refreshUser } = useAuthStore();
  const { salonIds } = useWishlistStore();
  const { data: myBookings } = useMyBookings(user?.id);

  // Fetch wishlist salons
  const { data: allSalons } = useSalons();
  const wishlistSalons = (allSalons?.data || []).filter((s) => salonIds.includes(s.id));

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setPhone(user.phone || '');
      setWeddingDate(user.weddingDate || '');
      setCity(user.city || '');
      setSkinTone(user.skinTone || '');
    }
  }, [user]);

  const savedWeddingDate = weddingDate || '';
  const daysLeft = savedWeddingDate ? daysUntil(savedWeddingDate) : 0;

  // Handle avatar upload
  const handleAvatarUpload = async (file: File) => {
    if (!user || !file) return;
    setAvatarUploading(true);
    try {
      const url = await uploadAvatar(user.id, file);
      await updateProfile(user.id, { avatar_url: url });
      await refreshUser();
      toast.success('Profile photo updated!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to upload photo');
    } finally {
      setAvatarUploading(false);
    }
  };

  // Load saved looks
  const loadSavedLooks = useCallback(async () => {
    if (!user) return;
    setLooksLoading(true);
    try {
      const looks = await savedLooksService.getMyLooks(user.id);
      setSavedLooks(looks);
    } catch (err) {
      console.error('Failed to load saved looks:', err);
    } finally {
      setLooksLoading(false);
    }
  }, [user]);

  // Delete a saved look
  const handleDeleteLook = async (lookId: string) => {
    setDeletingLookId(lookId);
    try {
      await savedLooksService.deleteLook(lookId);
      setSavedLooks((prev) => prev.filter((l) => l.id !== lookId));
      toast.success('Look removed');
    } catch (err: any) {
      toast.error(err.message || 'Failed to delete look');
    } finally {
      setDeletingLookId(null);
    }
  };

  // Handle saving profile (now includes skin_tone and wedding_date)
  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      await updateProfile(user.id, {
        name,
        phone: phone || null,
        city: city || null,
        wedding_date: weddingDate || null,
        skin_tone: skinTone || null,
      });
      await refreshUser();
      toast.success('Profile updated!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'profile':
        return (
          <div className="space-y-6 max-w-xl">
            {myBookings && myBookings.length > 0 && (
              <Link to="/my-bookings">
                <div className="card p-4 bg-rose-50 border border-rose-100 hover:bg-rose-100 transition-colors cursor-pointer">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs text-ivory-600 font-medium">Upcoming bookings</p>
                      <p className="text-lg font-bold text-rose-400">
                        {myBookings.filter((b: any) => b.status === 'confirmed').length}
                      </p>
                    </div>
                    <span className="text-xs text-rose-400 hover:text-rose-600 font-medium">
                      View all →
                    </span>
                  </div>
                </div>
              </Link>
            )}

            <div className="card p-6">
              {/* Avatar section */}
              <div className="flex items-center gap-4 mb-6">
                <div className="relative">
                  <div className="w-20 h-20 rounded-full bg-rose-50 border-2 border-rose-200 flex items-center justify-center overflow-hidden">
                    {user?.avatar_url || user?.avatar ? (
                      <img
                        src={user.avatar_url || user.avatar}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-8 h-8 text-rose-400" />
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleAvatarUpload(file);
                      e.target.value = '';
                    }}
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    disabled={avatarUploading}
                    className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-rose-400 text-white flex items-center justify-center shadow-sm hover:bg-rose-500 transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {avatarUploading ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Camera className="w-3.5 h-3.5" />
                    )}
                  </button>
                </div>
                <div>
                  <h2 className="font-heading text-xl text-ivory-900">{user?.name || 'Bride-to-be'}</h2>
                  <p className="text-sm text-ivory-600">{user?.email || ''}</p>
                  {savedWeddingDate && (
                    <div className="flex items-center gap-1.5 mt-1">
                      <Calendar className="w-3.5 h-3.5 text-rose-400" />
                      <span className="text-xs text-ivory-600">
                        Wedding: {formatDate(savedWeddingDate)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {daysLeft > 0 && (
                <div className="p-4 bg-rose-50 rounded-xl flex items-center justify-between mb-6">
                  <div>
                    <p className="text-xs text-ivory-600 font-medium">Days until your wedding</p>
                    <p className="text-2xl font-bold text-rose-400">{daysLeft}</p>
                  </div>
                  <Gift className="w-8 h-8 text-rose-200" />
                </div>
              )}

              <div className="space-y-4">
                <Input
                  label="Full Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                />
                <Input
                  label="Phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+91 98765 43210"
                />
                <div>
                  <label className="block text-sm font-medium text-ivory-900 mb-1.5">Wedding Date</label>
                  <input
                    type="date"
                    value={weddingDate}
                    onChange={(e) => setWeddingDate(e.target.value)}
                    className="input-field"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ivory-900 mb-1.5">City</label>
                  <select
                    className="input-field"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  >
                    <option value="">Select city</option>
                    <option value="Delhi">Delhi</option>
                    <option value="New Delhi">New Delhi</option>
                    <option value="Gurgaon">Gurgaon</option>
                    <option value="Noida">Noida</option>
                    <option value="Faridabad">Faridabad</option>
                    <option value="Ghaziabad">Ghaziabad</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-ivory-900 mb-1.5">
                    Skin Tone (for AI Studio)
                  </label>
                  <select
                    className="input-field"
                    value={skinTone}
                    onChange={(e) => setSkinTone(e.target.value)}
                  >
                    <option value="">Select skin tone</option>
                    <option value="Fair">Fair</option>
                    <option value="Medium">Medium</option>
                    <option value="Olive">Olive</option>
                    <option value="Tan">Tan</option>
                    <option value="Dark">Dark</option>
                    <option value="Deep">Deep</option>
                  </select>
                </div>

                <Button
                  variant="primary"
                  className="w-full"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Saving...</>
                  ) : (
                    'Save Changes'
                  )}
                </Button>

                <Button variant="ghost" className="w-full text-rose-400" onClick={logout}>
                  <LogOut className="w-4 h-4 mr-2" /> Sign Out
                </Button>
              </div>
            </div>
          </div>
        );

      case 'wishlist':
        return wishlistSalons.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {wishlistSalons.map((salon) => (
              <SalonCard key={salon.id} salon={salon} />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={<Heart className="w-16 h-16" />}
            title="Your wishlist is empty"
            description="Start saving salons and looks you love!"
            action={
              <Link to="/search">
                <Button variant="primary">Browse Salons</Button>
              </Link>
            }
          />
        );

      case 'saved-looks':
        if (!user) return null;
        // Lazy-load looks when tab is activated
        if (savedLooks.length === 0 && !looksLoading) {
          loadSavedLooks();
        }

        if (looksLoading) {
          return (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="w-8 h-8 text-rose-400 animate-spin" />
            </div>
          );
        }

        if (savedLooks.length === 0) {
          return (
            <EmptyState
              icon={<Sparkles className="w-16 h-16" />}
              title="No saved looks"
              description="Try the AI Bridal Studio to generate and save your looks!"
              action={
                <Link to="/ai-studio">
                  <Button variant="primary">Try AI Studio</Button>
                </Link>
              }
            />
          );
        }

        return (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {savedLooks.map((look) => (
              <div key={look.id} className="card overflow-hidden group">
                <div className="relative bg-ivory-50">
                  <img
                    src={look.imageUrl}
                    alt={look.style}
                    className="w-full h-48 object-contain"
                  />
                  <div className="absolute top-2 left-2">
                    <Badge variant="gold">{look.style}</Badge>
                  </div>
                  <button
                    onClick={() => handleDeleteLook(look.id)}
                    disabled={deletingLookId === look.id}
                    className="absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 hover:bg-red-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {deletingLookId === look.id ? (
                      <Loader2 className="w-3.5 h-3.5 text-red-400 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5 text-red-400" />
                    )}
                  </button>
                </div>
                <div className="p-3">
                  <div className="flex flex-wrap gap-1.5">
                    {look.features.slice(0, 3).map((f) => (
                      <Badge key={f} variant="gray" className="text-xs">{f}</Badge>
                    ))}
                    {look.features.length > 3 && (
                      <span className="text-xs text-ivory-500">+{look.features.length - 3} more</span>
                    )}
                  </div>
                  <p className="text-xs text-ivory-500 mt-2">
                    Saved {new Date(look.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        );

      case 'notifications':
        return (
          <div className="card p-6 max-w-lg space-y-4">
            {[
              { label: 'Booking Reminders', enabled: true },
              { label: 'Offer Alerts', enabled: true },
              { label: 'Review Prompts', enabled: false },
              { label: 'Platform Updates', enabled: true },
            ].map((setting) => (
              <div key={setting.label} className="flex items-center justify-between">
                <span className="text-sm text-ivory-900">{setting.label}</span>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    defaultChecked={setting.enabled}
                    className="sr-only peer"
                  />
                  <div className="w-10 h-6 bg-ivory-200 rounded-full peer peer-checked:bg-rose-400 peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all" />
                </label>
              </div>
            ))}
          </div>
        );

      case 'subscription':
        return (
          <div className="max-w-lg space-y-4">
            <div className="card p-6 text-center">
              <Crown className="w-12 h-12 text-amber-400 mx-auto mb-3" />
              <Badge variant="gold" className="text-sm mb-2">
                Free Plan
              </Badge>
              <p className="text-sm text-ivory-600 mt-2">
                Upgrade to access premium features like priority support and exclusive offers
              </p>
              <Button variant="primary" className="mt-4">
                Explore Plans
              </Button>
            </div>
          </div>
        );

      case 'help':
        return (
          <div className="max-w-lg space-y-3">
            {[
              {
                q: 'How do I book a trial?',
                a: 'Navigate to any salon profile, select a package, and choose "Book Trial" before confirming.',
              },
              {
                q: 'Can I cancel my booking?',
                a: 'Yes, you can cancel up to 48 hours before your appointment for a full refund.',
              },
              {
                q: 'How does the AI Studio work?',
                a: 'Upload a clear photo, choose a style, and our AI generates 3 bridal looks in seconds.',
              },
            ].map((faq) => (
              <details key={faq.q} className="card p-4 group">
                <summary className="text-sm font-medium text-ivory-900 cursor-pointer list-none flex items-center justify-between">
                  {faq.q}
                  <ChevronRight className="w-4 h-4 text-ivory-600 group-open:rotate-90 transition-transform" />
                </summary>
                <p className="mt-2 text-sm text-ivory-600">{faq.a}</p>
              </details>
            ))}
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-20">
      <Helmet>
        <title>My Profile — Shringar</title>
      </Helmet>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-heading text-3xl text-rose-800 mb-6">My Profile</h1>

        <div className="flex flex-col md:flex-row gap-8">
          <nav className="md:w-56 shrink-0">
            <div className="md:sticky md:top-24 space-y-1">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer',
                    activeTab === item.id
                      ? 'bg-rose-50 text-rose-600'
                      : 'text-ivory-600 hover:bg-ivory-50'
                  )}
                >
                  {item.icon}
                  {item.label}
                </button>
              ))}
            </div>
          </nav>

          <main className="flex-1 min-w-0">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              {renderTabContent()}
            </motion.div>
          </main>
        </div>
      </div>
    </div>
  );
}