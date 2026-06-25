import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Edit2,
  Trash2,
  Clock,
  IndianRupee,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { LoadingShimmer } from '../../components/ui/LoadingShimmer';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatPrice, formatDuration } from '../../utils/format';
import { useAuthStore } from '../../store/authStore';
import {
  useMySalon,
  useSalonServices,
  useCreateService,
  useUpdateService,
  useDeleteService,
} from '../../hooks/useSalon';
import type { TablesInsert } from '../../types/database';
import toast from 'react-hot-toast';

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

const CATEGORIES = [
  'Bridal Makeup',
  'Mehendi',
  'Hair Styling',
  'Skin Prep',
  'Bridal Party',
] as const;

function getCategoryBadgeVariant(category: string): 'rose' | 'gold' | 'gray' | 'success' {
  const cat = category.toLowerCase();
  if (cat.includes('bridal') || cat.includes('makeup')) return 'rose';
  if (cat.includes('mehendi')) return 'gold';
  if (cat.includes('hair')) return 'rose'; // purple not available, use rose
  if (cat.includes('skin') || cat.includes('prep')) return 'gold';
  if (cat.includes('party')) return 'rose';
  return 'gray';
}

export default function DashboardServices() {
  const { user } = useAuthStore();
  const { data: salon } = useMySalon(user?.id);
  const { data: services, isLoading } = useSalonServices(salon?.id);
  const createService = useCreateService();
  const updateService = useUpdateService();
  const deleteService = useDeleteService();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [isDeleteOpen, setIsDeleteOpen] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formCategory, setFormCategory] = useState<string>('');
  const [formDesc, setFormDesc] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formDuration, setFormDuration] = useState('');
  const [formActive, setFormActive] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const resetForm = () => {
    setFormName('');
    setFormCategory('');
    setFormDesc('');
    setFormPrice('');
    setFormDuration('');
    setFormActive(true);
    setEditingId(null);
  };

  const handleEdit = (service: any) => {
    setEditingId(service.id);
    setFormName(service.name);
    setFormCategory(service.category || '');
    setFormDesc(service.description || '');
    setFormPrice(String(service.price || ''));
    setFormDuration(String(service.duration_minutes || service.duration || ''));
    setFormActive(service.is_active ?? true);
    setIsAddOpen(true);
  };

  const handleSubmit = async () => {
    if (!salon) return;
    setFormSubmitting(true);
    try {
      if (editingId) {
        await updateService.mutateAsync({
          id: editingId,
          updates: {
            name: formName,
            category: formCategory,
            description: formDesc,
            price: Number(formPrice) || 0,
            duration_minutes: Number(formDuration) || null,
            is_active: formActive,
          },
        });
      } else {
        await createService.mutateAsync({
          salon_id: salon.id,
          name: formName,
          category: formCategory,
          description: formDesc,
          price: Number(formPrice) || 0,
          duration_minutes: Number(formDuration) || null,
          is_active: formActive,
        } as TablesInsert<'services'>);
      }
      setIsAddOpen(false);
      resetForm();
    } catch {
      toast.error('Failed to save service');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!isDeleteOpen) return;
    try {
      await deleteService.mutateAsync(isDeleteOpen);
      setIsDeleteOpen(null);
    } catch {
      toast.error('Failed to delete service');
    }
  };

  const handleToggleActive = async (service: any) => {
    try {
      await updateService.mutateAsync({
        id: service.id,
        updates: { is_active: !service.is_active },
      });
    } catch {
      toast.error('Failed to update service');
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-4">
            <LoadingShimmer className="h-5 w-40" />
            <LoadingShimmer className="h-4 w-24 mt-2" />
            <LoadingShimmer className="h-8 w-20 mt-3" />
          </div>
        ))}
      </div>
    );
  }

  const activeCount = services?.filter((s: any) => s.is_active).length || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-ivory-600">
          {services?.length || 0} services · {activeCount} active
        </p>
        <Button variant="primary" size="sm" onClick={() => { resetForm(); setIsAddOpen(true); }}>
          <Plus className="w-4 h-4 mr-1.5" /> Add Service
        </Button>
      </div>

      {/* Services grid */}
      {!services || services.length === 0 ? (
        <EmptyState
          icon={Plus}
          title="No services yet"
          description="Add individual services that customers can book"
          action={{ label: 'Add Service', onClick: () => { resetForm(); setIsAddOpen(true); } }}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {services.map((service: any, i: number) => {
            const isActive = service.is_active ?? true;
            const mins = service.duration_minutes || service.duration;

            return (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className={cn(
                  'card p-4 transition-opacity duration-200',
                  !isActive && 'opacity-60'
                )}
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium text-ivory-900 text-sm">{service.name}</h3>
                      {service.category && (
                        <Badge variant={getCategoryBadgeVariant(service.category)} className="text-[10px]">
                          {service.category}
                        </Badge>
                      )}
                    </div>
                    {service.description && (
                      <p className="text-xs text-ivory-600 mt-1 line-clamp-2">{service.description}</p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0 ml-3">
                    <button
                      onClick={() => handleEdit(service)}
                      className="p-1.5 rounded-lg hover:bg-ivory-100 transition-colors cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-ivory-600" />
                    </button>
                    <button
                      onClick={() => setIsDeleteOpen(service.id)}
                      className="p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-ivory-600" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-4 mt-3">
                  <span className="font-heading text-lg text-rose-800">
                    {formatPrice(service.price)}
                  </span>
                  {mins && (
                    <span className="flex items-center gap-1 text-xs text-ivory-600">
                      <Clock className="w-3 h-3" /> {formatDuration(mins)}
                    </span>
                  )}
                </div>

                {/* Active toggle */}
                <div className="mt-3 pt-3 border-t border-ivory-100">
                  <label className="flex items-center gap-2 text-xs text-ivory-600 cursor-pointer">
                    <input
                      type="checkbox"
                      className="rounded border-ivory-400 text-rose-400"
                      checked={isActive}
                      onChange={() => handleToggleActive(service)}
                    />
                    Active
                  </label>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Add/Edit Service Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => { setIsAddOpen(false); resetForm(); }}
        title={editingId ? 'Edit Service' : 'Add Service'}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ivory-900 mb-1.5">Service Name</label>
            <input className="input-field" placeholder="e.g. Bridal Makeup" value={formName} onChange={(e) => setFormName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-ivory-900 mb-1.5">Category</label>
            <select className="input-field" value={formCategory} onChange={(e) => setFormCategory(e.target.value)}>
              <option value="">Select category</option>
              {CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-ivory-900 mb-1.5">Description</label>
            <textarea className="input-field min-h-[60px]" placeholder="Short description..." value={formDesc} onChange={(e) => setFormDesc(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ivory-900 mb-1.5">Price (₹)</label>
              <input type="number" className="input-field" placeholder="e.g. 5000" value={formPrice} onChange={(e) => setFormPrice(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-ivory-900 mb-1.5">Duration (mins)</label>
              <input type="number" className="input-field" placeholder="e.g. 60" value={formDuration} onChange={(e) => setFormDuration(e.target.value)} />
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-ivory-600">
            <input type="checkbox" className="rounded border-ivory-400 text-rose-400" checked={formActive} onChange={(e) => setFormActive(e.target.checked)} />
            Active (visible to customers)
          </label>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" size="md" className="flex-1" onClick={() => { setIsAddOpen(false); resetForm(); }}>Cancel</Button>
            <Button variant="primary" size="md" className="flex-1" onClick={handleSubmit} disabled={formSubmitting || !formName}>
              {formSubmitting ? 'Saving...' : editingId ? 'Save Changes' : 'Add Service'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={!!isDeleteOpen} onClose={() => setIsDeleteOpen(null)} title="Delete Service" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-ivory-600">
            Are you sure you want to delete this service? This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <Button variant="secondary" size="md" className="flex-1" onClick={() => setIsDeleteOpen(null)}>Cancel</Button>
            <Button variant="primary" size="md" className="flex-1 bg-rose-600 hover:bg-rose-800" onClick={handleDelete} disabled={deleteService.isPending}>
              {deleteService.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
