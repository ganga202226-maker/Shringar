import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Edit2,
  Trash2,
  CheckCircle2,
  ChevronDown,
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { LoadingShimmer } from '../../components/ui/LoadingShimmer';
import { EmptyState } from '../../components/ui/EmptyState';
import { formatPrice } from '../../utils/format';
import { useAuthStore } from '../../store/authStore';
import { useMySalon, useSalonPackages, useCreatePackage, useUpdatePackage, useDeletePackage } from '../../hooks/useSalon';
import type { TablesInsert, TablesUpdate } from '../../types/database';
import toast from 'react-hot-toast';

function cn(...classes: (string | boolean | undefined | null)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function DashboardPackages() {
  const { user } = useAuthStore();
  const { data: salon } = useMySalon(user?.id);
  const { data: packages, isLoading } = useSalonPackages(salon?.id);
  const createPkg = useCreatePackage();
  const updatePkg = useUpdatePackage();
  const deletePkg = useDeletePackage();

  const [isAddOpen, setIsAddOpen] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // Form state
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formOriginal, setFormOriginal] = useState('');
  const [formDiscounted, setFormDiscounted] = useState('');
  const [formDuration, setFormDuration] = useState('1');
  const [formIncludes, setFormIncludes] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formSubmitting, setFormSubmitting] = useState(false);

  const resetForm = () => {
    setFormName('');
    setFormDesc('');
    setFormOriginal('');
    setFormDiscounted('');
    setFormDuration('1');
    setFormIncludes('');
    setEditingId(null);
  };

  const handleEdit = (pkg: any) => {
    setEditingId(pkg.id);
    setFormName(pkg.name);
    setFormDesc(pkg.description || '');
    setFormOriginal(String(pkg.original_price || pkg.originalPrice || ''));
    setFormDiscounted(String(pkg.discounted_price || pkg.discountedPrice || ''));
    setFormDuration(String(pkg.duration_days || (pkg as any).duration || '1'));
    setFormIncludes((pkg.services_included || pkg.whatIncludes || []).join('\n'));
    setIsAddOpen(true);
  };

  const handleAdd = () => {
    resetForm();
    setIsAddOpen(true);
  };

  const handleSubmit = async () => {
    if (!salon) return;
    setFormSubmitting(true);
    try {
      const servicesIncluded = formIncludes.split('\n').filter(Boolean);
      if (editingId) {
        await updatePkg.mutateAsync({
          id: editingId,
          updates: {
            name: formName,
            description: formDesc,
            original_price: Number(formOriginal) || 0,
            discounted_price: Number(formDiscounted) || undefined,
            duration_days: Number(formDuration) || 1,
            services_included: servicesIncluded,
          },
        });
      } else {
        await createPkg.mutateAsync({
          salon_id: salon.id,
          name: formName,
          description: formDesc,
          original_price: Number(formOriginal) || 0,
          discounted_price: Number(formDiscounted) || undefined,
          duration_days: Number(formDuration) || 1,
          services_included: servicesIncluded,
          is_active: true,
        });
      }
      setIsAddOpen(false);
      resetForm();
    } catch (err) {
      toast.error('Failed to save package');
    } finally {
      setFormSubmitting(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    try {
      await deletePkg.mutateAsync(deleteId);
      setDeleteId(null);
    } catch {
      toast.error('Failed to delete package');
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="card p-5">
            <LoadingShimmer className="h-6 w-48" />
            <LoadingShimmer className="h-4 w-64 mt-2" />
            <LoadingShimmer className="h-8 w-24 mt-3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-ivory-600">{packages?.length || 0} packages</p>
        <Button variant="primary" size="sm" onClick={handleAdd}>
          <Plus className="w-4 h-4 mr-1.5" /> Create Package
        </Button>
      </div>

      {/* Package list */}
      {!packages || packages.length === 0 ? (
        <EmptyState
          icon={Plus}
          title="No packages yet"
          description="Create your first bridal package to attract customers"
          action={{ label: 'Create Package', onClick: handleAdd }}
        />
      ) : (
        <div className="space-y-4">
          {packages.map((pkg: any, i: number) => {
            const original = pkg.original_price || pkg.originalPrice || 0;
            const discounted = pkg.discounted_price || pkg.discountedPrice || original;
            const savings = original - discounted;
            const whatIncludes = pkg.services_included || pkg.whatIncludes || [];

            return (
              <motion.div
                key={pkg.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                className="card overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3">
                        <h3 className="font-heading text-lg text-ivory-900">{pkg.name}</h3>
                        {savings > 0 && (
                          <Badge variant="gold" className="text-[10px]">
                            Save {formatPrice(savings)}
                          </Badge>
                        )}
                      </div>
                      <p className="text-sm text-ivory-600 mt-1">{pkg.description}</p>
                    </div>
                    <div className="flex gap-1 shrink-0 ml-4">
                      <button
                        onClick={() => handleEdit(pkg)}
                        className="p-1.5 rounded-lg hover:bg-ivory-100 transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-4 h-4 text-ivory-600" />
                      </button>
                      <button
                        onClick={() => setDeleteId(pkg.id)}
                        className="p-1.5 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4 text-ivory-600" />
                      </button>
                    </div>
                  </div>

                  {/* Price */}
                  <div className="flex items-center gap-3 mt-3">
                    <span className="font-heading text-2xl text-rose-800">{formatPrice(discounted)}</span>
                    {original > discounted && (
                      <span className="text-sm text-ivory-400 line-through">{formatPrice(original)}</span>
                    )}
                  </div>

                  {/* Duration */}
                  {pkg.duration_days && (
                    <p className="text-xs text-ivory-600 mt-2">{pkg.duration_days} day{pkg.duration_days > 1 ? 's' : ''} duration</p>
                  )}

                  {/* Includes toggle */}
                  {whatIncludes.length > 0 && (
                    <>
                      <button
                        onClick={() => setExpandedId(expandedId === pkg.id ? null : pkg.id)}
                        className="flex items-center gap-1 mt-3 text-xs text-rose-400 hover:text-rose-600 font-medium cursor-pointer"
                      >
                        {expandedId === pkg.id ? 'Hide' : 'Show'} details
                        <ChevronDown className={cn('w-3 h-3 transition-transform', expandedId === pkg.id && 'rotate-180')} />
                      </button>

                      {expandedId === pkg.id && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          className="mt-3 pt-3 border-t border-ivory-100"
                        >
                          <p className="text-xs font-medium text-ivory-900 mb-2">Services included:</p>
                          <ul className="space-y-1">
                            {whatIncludes.map((item: string) => (
                              <li key={item} className="flex items-center gap-2 text-xs text-ivory-600">
                                <CheckCircle2 className="w-3 h-3 text-rose-400 shrink-0" />
                                {item}
                              </li>
                            ))}
                          </ul>
                        </motion.div>
                      )}
                    </>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* Package Form Modal */}
      <Modal
        isOpen={isAddOpen}
        onClose={() => { setIsAddOpen(false); resetForm(); }}
        title={editingId ? 'Edit Package' : 'Create Package'}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-ivory-900 mb-1.5">Package Name</label>
            <input className="input-field" placeholder="e.g. Premium Wedding Package" value={formName} onChange={(e) => setFormName(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-ivory-900 mb-1.5">Description</label>
            <textarea className="input-field min-h-[60px]" placeholder="Short description..." value={formDesc} onChange={(e) => setFormDesc(e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-ivory-900 mb-1.5">Original Price (₹)</label>
              <input type="number" className="input-field" placeholder="e.g. 35000" value={formOriginal} onChange={(e) => setFormOriginal(e.target.value)} />
            </div>
            <div>
              <label className="block text-sm font-medium text-ivory-900 mb-1.5">Discounted Price (₹)</label>
              <input type="number" className="input-field" placeholder="e.g. 25000" value={formDiscounted} onChange={(e) => setFormDiscounted(e.target.value)} />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-ivory-900 mb-1.5">Duration (days)</label>
            <input type="number" className="input-field" placeholder="e.g. 3" value={formDuration} onChange={(e) => setFormDuration(e.target.value)} />
          </div>
          <div>
            <label className="block text-sm font-medium text-ivory-900 mb-1.5">Services Included (one per line)</label>
            <textarea className="input-field min-h-[80px]" placeholder="Bridal makeup trial&#10;Wedding day makeup&#10;Hair styling" value={formIncludes} onChange={(e) => setFormIncludes(e.target.value)} />
          </div>
          <div className="flex gap-3 pt-2">
            <Button variant="secondary" size="md" className="flex-1" onClick={() => { setIsAddOpen(false); resetForm(); }}>Cancel</Button>
            <Button variant="primary" size="md" className="flex-1" onClick={handleSubmit} disabled={formSubmitting || !formName}>
              {formSubmitting ? 'Saving...' : editingId ? 'Save Changes' : 'Create Package'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal isOpen={!!deleteId} onClose={() => setDeleteId(null)} title="Delete Package" size="sm">
        <div className="space-y-4">
          <p className="text-sm text-ivory-600">Are you sure you want to delete this package? This action cannot be undone.</p>
          <div className="flex gap-3">
            <Button variant="secondary" size="md" className="flex-1" onClick={() => setDeleteId(null)}>Cancel</Button>
            <Button variant="primary" size="md" className="flex-1 bg-rose-600 hover:bg-rose-800" onClick={handleDelete} disabled={deletePkg.isPending}>
              {deletePkg.isPending ? 'Deleting...' : 'Delete'}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}