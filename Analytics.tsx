import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Clock,
  Languages,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { LoadingShimmer } from '../../components/ui/LoadingShimmer';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAuthStore } from '../../store/authStore';
import { useMySalon, useSalonArtists, useCreateArtist, useUpdateArtist, useDeleteArtist } from '../../hooks/useSalon';
import type { TablesInsert } from '../../types/database';
import toast from 'react-hot-toast';

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function DashboardArtists() {
  const { user } = useAuthStore();
  const { data: salon } = useMySalon(user?.id);
  const { data: artists, isLoading } = useSalonArtists(salon?.id);
  const createArtist = useCreateArtist();
  const updateArtist = useUpdateArtist();
  const deleteArtist = useDeleteArtist();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formSpecialty, setFormSpecialty] = useState('');
  const [formExperience, setFormExperience] = useState('');
  const [formLanguages, setFormLanguages] = useState('');
  const [formBio, setFormBio] = useState('');
  const [formPhoto, setFormPhoto] = useState('');
  const [formAvailable, setFormAvailable] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const resetForm = () => {
    setFormName('');
    setFormSpecialty('');
    setFormExperience('');
    setFormLanguages('');
    setFormBio('');
    setFormPhoto('');
    setFormAvailable(true);
    setEditingId(null);
  };

  const handleEdit = (artist: any) => {
    setEditingId(artist.id);
    setFormName(artist.name);
    setFormSpecialty(artist.specialty || '');
    setFormExperience(String(artist.experience_years || artist.experience || ''));
    setFormLanguages((artist.languages || []).join(', '));
    setFormBio(artist.bio || '');
    setFormPhoto(artist.photo_url || artist.photo || '');
    setFormAvailable(artist.is_active ?? artist.isAvailable ?? true);
    setIsAddOpen(true);
  };

  const handleSubmit = async () => {
    if (!salon) return;
    setFormSubmitting(true);
    try {
      const languages = formLanguages.split(',').map(s => s.trim()).filter(Boolean);
      if (editingId) {
        await updateArtist.mutateAsync({
          id: editingId,
          updates: {
            name: formName,
            specialty: formSpecialty,
            experience_years: Number(formExperience) || null,
            languages,
            bio: formBio,
            photo_url: formPhoto || null,
            is_active: formAvailable,
          },
        });
      } else {
        await createArtist.mutateAsync({
          salon_id: salon.id,
          name: formName,
          specialty: formSpecialty,
          experience_years: Number(formExperience) || null,
          languages,
          bio: formBio,
          photo_url: formPhoto || null,
          is_active: formAvailable,
        });
      }
      setIsAddOpen(false);
      resetForm();
    } catch {
      toast.error('Failed to save artist');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!isDeleteOpen) return;
    try {
      await deleteArtist.mutateAsync(isDeleteOpen);
      setIsDeleteOpen(null);
    } catch {
      toast.error('Failed to delete artist');
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-4 flex gap-4">
            <LoadingShimmer className="w-16 h-16 rounded-xl shrink-0" />
            <div className="flex-1 space-y-2">
              <LoadingShimmer className="h-5 w-32" />
              <LoadingShimmer className="h-4 w-24" />
              <LoadingShimmer className="h-4 w-48" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-ivory-600">
          {artists?.length || 0} artists · {artists?.filter((a: any) => a.is_active ?? a.isAvailable).length || 0} available
        </p>
        <Button variant="primary" size="sm" onClick={() => { resetForm(); setIsAddOpen(true); }}>
          <Plus className="w-4 h-4 mr-1.5" /> Add Artist
        </Button>
      </div>

      {/* Artist grid */}
      {!artists || artists.length === 0 ? (
        <EmptyState
          icon={Plus}
          title="No artists yet"
          description="Add your team of artists to manage bookings"
          action={{ label: 'Add Artist', onClick: () => { resetForm(); setIsAddOpen(true); } }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {artists.map((artist: any, i: number) => {
            const isAvail = artist.is_active ?? artist.isAvailable ?? true;
            const languages = artist.languages || [];

            return (
              <motion.div
                key={artist.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="card p-4 flex gap-4"
              >
                <img
                  src={artist.photo_url || artist.photo || 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&q=80'}
                  alt={artist.name}
                  className="w-16 h-16 rounded-xl object-cover shrink-0"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium text-ivory-900 text-sm">{artist.name}</h3>
                        {isAvail ? (
                          <Badge variant="success">Available</Badge>
                        ) : (
                          <Badge variant="gray">Unavailable</Badge>
                        )}
                      </div>
                      <p className="text-xs text-ivory-600 mt-0.5">{artist.specialty}</p>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleEdit(artist)}
                        className="p-1.5 rounded-lg hover:bg-ivory-100 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5 text-ivory-600" />
                      </button>
                      <button
                        onClick={() => setIsDeleteOpen(artist.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5 text-ivory-600" />
                      </button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3 mt-3 text-xs text-ivory-600">
                    {artist.experience_years != null && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {artist.experience_years} years
                      </span>
                    )}
                    {languages.length > 0 && (
                      <span className="flex items-center gap-1">
                        <Languages className="w-3 h-3" /> {languages.join(', ')}
                      </span>
                    )}
                  </div>
                  {artist.bio && (
                    <p className="text-xs text-ivory-600 mt-2 line-clamp-2">{artist.bio}</p>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Artist Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => { setIsAddOpen(false); resetForm(); }}
        title={editingId ? 'Edit Artist' : 'Add Artist'}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ivory-900 mb-1.5">Full Name</label>
            <input className="input-field" placeholder="e.g. Priya Sharma" value={formName} onChange={(e) => setFormName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-ivory-900 mb-1.5">Specialty</label>
            <select className="input-field" value={formSpecialty} onChange={(e) => setFormSpecialty(e.target.value)}>
              <option value="">Select specialty</option>
              <option value="Bridal Makeup">Bridal Makeup</option>
              <option value="Hair Styling">Hair Styling</option>
              <option value="Mehendi">Mehendi</option>
              <option value="Skin Prep">Skin Prep</option>
              <option value="Bridal Party Package">Bridal Party Package</option>
            </select>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ivory-900 mb-1.5">Experience (years)</label>
              <input type="number" className="input-field" placeholder="e.g. 5" value={formExperience} onChange={(e) => setFormExperience(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-ivory-900 mb-1.5">Languages</label>
              <input className="input-field" placeholder="Hindi, English" value={formLanguages} onChange={(e) => setFormLanguages(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-ivory-900 mb-1.5">Bio</label>
            <textarea className="input-field min-h-[80px]" placeholder="Short bio about the artist..." value={formBio} onChange={(e) => setFormBio(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-ivory-900 mb-1.5">Photo URL</label>
            <input className="input-field" placeholder="https://..." value={formPhoto} onChange={(e) => setFormPhoto(e.target.value)} />
          </div>
          <label className="flex items-center gap-2 text-sm text-ivory-600">
            <input type="checkbox" className="rounded border-ivory-400 text-rose-400" checked={formAvailable} onChange={(e) => setFormAvailable(e.target.checked)} />
            Available for booking
          </label>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" size="md" className="flex-1" onClick={() => { setIsAddOpen(false); resetForm(); }}>Cancel</Button>
            <Button variant="primary" size="md" className="flex-1" onClick={handleSubmit} disabled={formSubmitting || !formName}>
              {formSubmitting ? 'Saving...' : editingId ? 'Save Changes' : 'Add Artist'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={!!isDeleteOpen} onClose={() => setIsDeleteOpen(null)} title="Remove Artist" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-ivory-600">
            Are you sure you want to remove this artist? They will be unlinked from all future bookings.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" size="md" className="flex-1" onClick={() => setIsDeleteOpen(null)}>Cancel</Button>
            <Button variant="primary" size="md" className="flex-1 bg-rose-600 hover:bg-rose-800" onClick={handleDelete} disabled={deleteArtist.isPending}>
              {deleteArtist.isPending ? 'Removing...' : 'Remove'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}