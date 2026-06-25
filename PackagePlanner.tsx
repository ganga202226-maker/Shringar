import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Image as ImageIcon,
  Heart,
  Trash2,
  Upload,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { LoadingShimmer } from '../../components/ui/LoadingShimmer';
import { EmptyState } from '../../components/ui/EmptyState';
import { useAuthStore } from '../../store/authStore';
import { useMySalon, usePortfolioImages, useCreatePortfolioImage, useDeletePortfolioImage } from '../../hooks/useSalon';
import type { TablesInsert } from '../../types/database';
import toast from 'react-hot-toast';

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

const categories = ['All', 'Bridal Makeup', 'Mehendi', 'Hair Styling', 'Bridal Party'];

export default function DashboardPortfolio() {
  const { user } = useAuthStore();
  const { data: salon } = useMySalon(user?.id);
  const { data: images, isLoading } = usePortfolioImages(salon?.id);
  const createImage = useCreatePortfolioImage();
  const deleteImage = useDeletePortfolioImage();

  const [filter, setFilter] = useState('All');
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<string | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formCategory, setFormCategory] = useState('Bridal Makeup');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formFeatured, setFormFeatured] = useState(false);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const resetForm = () => {
    setFormTitle('');
    setFormCategory('Bridal Makeup');
    setFormImageUrl('');
    setFormFeatured(false);
  };

  const filtered = filter === 'All'
    ? (images || [])
    : (images || []).filter((p: any) => p.category === filter);

  const featuredCount = (images || []).filter((p: any) => p.is_featured).length;

  const handleSubmit = async () => {
    if (!salon || !formImageUrl) return;
    setFormSubmitting(true);
    try {
      await createImage.mutateAsync({
        salon_id: salon.id,
        image_url: formImageUrl,
        title: formTitle || null,
        category: formCategory,
        is_featured: formFeatured,
      });
      setIsAddOpen(false);
      resetForm();
    } catch {
      toast.error('Failed to add image');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!isDeleteOpen) return;
    try {
      await deleteImage.mutateAsync(isDeleteOpen);
      setIsDeleteOpen(null);
    } catch {
      toast.error('Failed to delete image');
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="card overflow-hidden">
            <LoadingShimmer className="aspect-[4/3] w-full" />
            <div className="p-3 space-y-2">
              <LoadingShimmer className="h-4 w-32" />
              <LoadingShimmer className="h-3 w-20" />
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
        <div>
          <p className="text-sm text-ivory-600">
            {images?.length || 0} images · {featuredCount} featured
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => { resetForm(); setIsAddOpen(true); }}>
          <Plus className="w-4 h-4 mr-1.5" /> Add Image
        </Button>
      </div>

      {/* Category filter */}
      <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={cn(
              'px-4 py-2 rounded-full text-sm whitespace-nowrap transition-all cursor-pointer',
              filter === cat
                ? 'bg-rose-400 text-white'
                : 'bg-white text-ivory-600 hover:bg-ivory-100 border border-ivory-200'
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          icon={ImageIcon}
          title="No images yet"
          description="Add your best work to showcase to potential customers"
          action={{ label: 'Add Image', onClick: () => { resetForm(); setIsAddOpen(true); } }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item: any, i: number) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="card overflow-hidden group"
            >
              <div className="relative aspect-[4/3] overflow-hidden">
                <img
                  src={item.image_url}
                  alt={item.title || 'Portfolio image'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute top-2 right-2 flex gap-1">
                    <button
                      onClick={() => setIsDeleteOpen(item.id)}
                      className="p-1.5 rounded-lg bg-white/90 hover:bg-white text-ivory-600 hover:text-rose-400 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
                {item.is_featured && (
                  <div className="absolute top-2 left-2 bg-gold-100 text-gold-800 text-[10px] font-medium px-2 py-0.5 rounded-full">
                    ⭐ Featured
                  </div>
                )}
              </div>
              <div className="p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-medium text-ivory-900">{item.title || 'Untitled'}</h3>
                    <p className="text-xs text-ivory-600">{item.category}</p>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Add Image Modal */}
      <Modal isOpen={isAddOpen} onClose={() => { setIsAddOpen(false); resetForm(); }} title="Add Portfolio Image" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ivory-900 mb-1.5">Image URL</label>
            <input className="input-field" placeholder="https://images.unsplash.com/..." value={formImageUrl} onChange={(e) => setFormImageUrl(e.target.value)} />
          </div>
          {formImageUrl && (
            <div className="rounded-xl overflow-hidden border border-ivory-200">
              <img src={formImageUrl} alt="Preview" className="w-full h-48 object-cover" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-ivory-900 mb-1.5">Title</label>
            <input className="input-field" placeholder="e.g. Bridal Makeup - Front View" value={formTitle} onChange={(e) => setFormTitle(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-ivory-900 mb-1.5">Category</label>
            <select className="input-field" value={formCategory} onChange={(e) => setFormCategory(e.target.value)}>
              <option>Bridal Makeup</option>
              <option>Mehendi</option>
              <option>Hair Styling</option>
              <option>Bridal Party</option>
              <option>Skin Prep</option>
            </select>
          </div>
          <label className="flex items-center gap-2 text-sm text-ivory-600">
            <input type="checkbox" className="rounded border-ivory-400 text-rose-400" checked={formFeatured} onChange={(e) => setFormFeatured(e.target.checked)} />
            Set as featured image
          </label>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" size="md" className="flex-1" onClick={() => { setIsAddOpen(false); resetForm(); }}>Cancel</Button>
            <Button variant="primary" size="md" className="flex-1" onClick={handleSubmit} disabled={formSubmitting || !formImageUrl}>
              {formSubmitting ? 'Uploading...' : 'Add to Portfolio'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={!!isDeleteOpen} onClose={() => setIsDeleteOpen(null)} title="Delete Image" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-ivory-600">Are you sure you want to delete this image? This action cannot be undone.</p>
          <div className="flex gap-3">
            <Button variant="secondary" size="md" className="flex-1" onClick={() => setIsDeleteOpen(null)}>Cancel</Button>
            <Button variant="primary" size="md" className="flex-1 bg-rose-600 hover:bg-rose-800" onClick={handleDelete} disabled={deleteImage.isPending}>
              {deleteImage.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}