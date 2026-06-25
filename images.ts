import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Helmet } from 'react-helmet-async';
import {
  Calendar, ChevronLeft, ChevronRight, Check, GripVertical,
  Sparkles, ShoppingCart, Loader2, CheckCircle2, Plus, Trash2,
  Search, Building2, X, IndianRupee,
} from 'lucide-react';
import {
  DndContext, DragOverlay, DragStartEvent, DragEndEvent,
  PointerSensor, useSensor, useSensors, useDraggable, useDroppable, closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext, useSortable, verticalListSortingStrategy, arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { Input } from '../components/ui/Input';
import { ProgressStepper } from '../components/ui/ProgressStepper';
import { LoadingShimmer } from '../components/ui/LoadingShimmer';
import { formatPrice } from '../utils/format';
import { cn } from '../utils/cn';
import { useAuthStore } from '../store/authStore';
import { salonService, bookingService } from '../services/salons';
import type { Salon, Service } from '../types';
import toast from 'react-hot-toast';

type Step = 'details' | 'plan' | 'party' | 'summary';

const STEPS = [
  { label: 'Wedding Details', description: 'Date, venue & salon' },
  { label: 'Day Planner', description: 'Drag & drop services by day' },
  { label: 'Party Members', description: 'Add bridal party services' },
  { label: 'Summary & Book', description: 'Review & confirm booking' },
];

const DAYS = [
  { id: 'd-2', label: 'D-2 Mehendi' },
  { id: 'd-1', label: 'D-1 Sangeet' },
  { id: 'd-0', label: 'D-0 Wedding' },
];

const DAY_LABELS: Record<string, string> = {
  'd-2': 'Mehendi Day', 'd-1': 'Sangeet Day', 'd-0': 'Wedding Day',
};

const CATEGORY_DAY_MAP: Record<string, string> = {
  Mehendi: 'd-2', 'Bridal party': 'd-1', 'Bridal party package': 'd-1',
  'Bridal makeup': 'd-0', 'Hair styling': 'd-0', 'Skin prep': 'd-0',
  'Pre-bridal care': 'd-0', 'Home service': 'd-0',
};

const CATALOG_PREFIX = 'cat-';
const SORTABLE_PREFIX = 'sort-';

function getItemId(service: Service, dayId?: string) {
  return dayId ? `${SORTABLE_PREFIX}${dayId}-${service.id}` : `${CATALOG_PREFIX}${service.id}`;
}

type UniqueIdentifier = string | number;

function SortableServiceItem({ service, dayId, onRemove }: {
  service: Service; dayId: string; onRemove: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } =
    useSortable({ id: getItemId(service, dayId) });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.4 : 1 };
  return (
    <div ref={setNodeRef} style={style} className={cn('flex items-center justify-between p-3 rounded-lg border transition-all', isDragging ? 'border-rose-400 shadow-md bg-rose-50' : 'border-ivory-200 bg-white')}>
      <div className="flex items-center gap-2 flex-1 min-w-0">
        <button {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing touch-none text-ivory-400 hover:text-ivory-600">
          <GripVertical className="w-4 h-4" />
        </button>
        <div className="min-w-0">
          <p className="text-sm font-medium text-ivory-900 truncate">{service.name}</p>
          <p className="text-xs text-ivory-500">{service.duration_minutes || service.duration} min · {service.category}</p>
        </div>
      </div>
      <div className="flex items-center gap-3 shrink-0">
        <span className="text-sm font-semibold text-rose-400">{formatPrice(service.price)}</span>
        <button onClick={() => onRemove(service.id)} className="text-ivory-400 hover:text-rose-500 transition-colors cursor-pointer" title="Remove service">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

function DraggableCatalogService({ service }: { service: Service }) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
    id: getItemId(service), data: { type: 'catalog', service },
  });
  return (
    <div ref={setNodeRef} {...listeners} {...attributes} className={cn('p-3 border rounded-lg transition-all cursor-grab active:cursor-grabbing select-none', isDragging ? 'opacity-40 border-rose-400 shadow-md' : 'border-ivory-200 hover:border-rose-300 hover:shadow-sm')}>
      <p className="text-sm font-medium text-ivory-900">{service.name}</p>
      <div className="flex items-center justify-between mt-1">
        <span className="text-xs text-ivory-500">{service.duration_minutes || service.duration} min</span>
        <span className="text-sm font-semibold text-rose-400">{formatPrice(service.price)}</span>
      </div>
      <Badge variant="gray" className="mt-1.5">{service.category}</Badge>
    </div>
  );
}

function DaySection({ day, services, isActive, onSetActive, onRemove, isDragOver }: {
  day: { id: string; label: string }; services: Service[];
  isActive: boolean; onSetActive: () => void; onRemove: (id: string) => void; isDragOver: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: `drop-${day.id}`, data: { type: 'day', dayId: day.id } });
  const dayTotal = services.reduce((sum, s) => sum + s.price, 0);
  return (
    <div ref={setNodeRef} onClick={onSetActive} className={cn('rounded-xl border-2 transition-all duration-200 overflow-hidden', isDragOver || isOver ? 'border-rose-400 bg-rose-50/60 shadow-lg shadow-rose-200/20' : isActive ? 'border-rose-300 bg-white shadow-md' : 'border-ivory-200 bg-white hover:border-ivory-300')}>
      <div className={cn('flex items-center justify-between px-4 py-3 cursor-pointer transition-colors', isActive ? 'bg-rose-50' : 'bg-ivory-50/50')}>
        <div className="flex items-center gap-2">
          <Calendar className={cn('w-4 h-4', isActive ? 'text-rose-400' : 'text-ivory-400')} />
          <h3 className={cn('font-heading text-sm', isActive ? 'text-rose-800' : 'text-ivory-900')}>{day.label}</h3>
          {services.length > 0 && <span className="text-xs bg-rose-100 text-rose-600 px-2 py-0.5 rounded-full font-medium">{services.length}</span>}
        </div>
        <span className="text-sm font-semibold text-rose-400">{formatPrice(dayTotal)}</span>
      </div>
      <SortableContext items={services.map((s) => getItemId(s, day.id))} strategy={verticalListSortingStrategy}>
        <div className="px-4 pb-3 pt-2 space-y-2 min-h-[70px]">
          {services.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-4 text-center">
              <div className={cn('text-xs transition-colors', isDragOver || isOver ? 'text-rose-500 font-medium' : 'text-ivory-400')}>
                <ShoppingCart className="w-5 h-5 mx-auto mb-1 opacity-50" />
                {isDragOver || isOver ? 'Drop service here' : 'Tap day, then tap a service'}
              </div>
            </div>
          ) : (
            services.map((service) => (
              <SortableServiceItem key={getItemId(service, day.id)} service={service} dayId={day.id} onRemove={onRemove} />
            ))
          )}
        </div>
      </SortableContext>
    </div>
  );
}
export default function PackagePlannerPage() {
  const [searchParams] = useSearchParams();
  const salonSlugParam = searchParams.get('salon');
  const [currentStep, setCurrentStep] = useState<number>(0);
  const { user, isAuthenticated } = useAuthStore();

  const [weddingDate, setWeddingDate] = useState(user?.weddingDate || '');
  const [city, setCity] = useState(user?.city || 'Delhi');
  const [venueType, setVenueType] = useState('');
  const [partyCount, setPartyCount] = useState(5);
  const [budget, setBudget] = useState(100000);

  const [selectedSalon, setSelectedSalon] = useState<Salon | null>(null);
  const [salonSearch, setSalonSearch] = useState('');
  const [salonResults, setSalonResults] = useState<Salon[]>([]);
  const [showSalonPicker, setShowSalonPicker] = useState(false);

  const [salonServices, setSalonServices] = useState<Service[]>([]);
  const [isLoadingServices, setIsLoadingServices] = useState(false);
  const [activeDayId, setActiveDayId] = useState<string>('d-0');
  const [dayServices, setDayServices] = useState<Record<string, Service[]>>({ 'd-2': [], 'd-1': [], 'd-0': [] });

  const [activeDragService, setActiveDragService] = useState<Service | null>(null);
  const [dragOverDayId, setDragOverDayId] = useState<string | null>(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const [partyMembers, setPartyMembers] = useState<{ name: string; relation: string; services: string[] }[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (salonSlugParam) {
      setIsLoadingServices(true);
      salonService.getSalonBySlug(salonSlugParam).then((salon) => { setSelectedSalon(salon); setCity(salon.city); }).catch(() => {}).finally(() => setIsLoadingServices(false));
    }
  }, [salonSlugParam]);

  useEffect(() => {
    if (!selectedSalon) { setSalonServices([]); return; }
    setIsLoadingServices(true);
    salonService.getSalonServices(selectedSalon.id).then(setSalonServices).catch(() => toast.error('Failed to load salon services')).finally(() => setIsLoadingServices(false));
  }, [selectedSalon]);

  useEffect(() => {
    if (!salonSearch || salonSearch.length < 2) { setSalonResults([]); return; }
    const timer = setTimeout(async () => {
      try { const { data } = await salonService.getSalons({ search: salonSearch }); setSalonResults(data.slice(0, 8)); } catch {}
    }, 300);
    return () => clearTimeout(timer);
  }, [salonSearch]);

  const totalPrice = useMemo(() => Object.values(dayServices).flat().reduce((sum, s) => sum + s.price, 0), [dayServices]);
  const selectedSalonServices = useMemo(() => salonServices.filter((s) => s.is_active !== false), [salonServices]);

  const addServiceToDay = useCallback((dayId: string, service: Service) => {
    setDayServices((prev) => {
      if (prev[dayId].some((s) => s.id === service.id)) return prev;
      return { ...prev, [dayId]: [...prev[dayId], service] };
    });
  }, []);

  const removeServiceFromDay = useCallback((dayId: string, serviceId: string) => {
    setDayServices((prev) => ({ ...prev, [dayId]: prev[dayId].filter((s) => s.id !== serviceId) }));
  }, []);

  const suggestDayForService = useCallback((service: Service): string => {
    const cat = service.category;
    for (const [keyword, dayId] of Object.entries(CATEGORY_DAY_MAP)) {
      if (cat.toLowerCase().includes(keyword.toLowerCase())) return dayId;
    }
    return activeDayId;
  }, [activeDayId]);

  const handleQuickAdd = useCallback((service: Service) => {
    const suggestedDay = suggestDayForService(service);
    addServiceToDay(suggestedDay, service);
    toast.success(`Added to ${DAY_LABELS[suggestedDay] || suggestedDay}`);
  }, [suggestDayForService, addServiceToDay]);

  const handleDragStart = useCallback((event: DragStartEvent) => {
    const data = event.active.data.current;
    if (data?.type === 'catalog' && data?.service) setActiveDragService(data.service);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    setActiveDragService(null);
    if (!over) return;
    const activeData = active.data.current;
    const overData = over.data.current;
    if (activeData?.type === 'catalog') {
      const service: Service = activeData.service;
      let targetDayId: string | null = null;
      if (overData?.type === 'day') targetDayId = overData.dayId;
      if (targetDayId) {
        addServiceToDay(targetDayId, service);
        toast.success(`Added to ${DAY_LABELS[targetDayId] || targetDayId}`);
      }
      return;
    }
    if (activeData?.type === 'day-item' && overData?.type === 'day-item') {
      if (activeData.dayId !== overData.dayId) return;
      const dayId = activeData.dayId;
      const items = dayServices[dayId];
      if (!items) return;
      const oldIdx = items.findIndex((s) => getItemId(s, dayId) === active.id);
      const newIdx = items.findIndex((s) => getItemId(s, dayId) === over.id);
      if (oldIdx !== -1 && newIdx !== -1 && oldIdx !== newIdx) {
        setDayServices((prev) => ({ ...prev, [dayId]: arrayMove(prev[dayId], oldIdx, newIdx) }));
      }
    }
  }, [dayServices, addServiceToDay]);

  const handleDragOver = useCallback((event: any) => {
    const { over } = event;
    setDragOverDayId(over?.data?.current?.type === 'day' ? over.data.current.dayId : null);
  }, []);

  const resetAll = useCallback(() => {
    setCurrentStep(0);
    setWeddingDate(''); setCity('Delhi'); setVenueType(''); setPartyCount(5); setBudget(100000);
    setSelectedSalon(null); setSalonServices([]);
    setDayServices({ 'd-2': [], 'd-1': [], 'd-0': [] });
    setPartyMembers([]); setPaymentSuccess(false); setActiveDayId('d-0');
  }, []);

  const handleConfirm = async () => {
    if (!isAuthenticated || !user) { toast.error('Please log in first'); return; }
    if (totalPrice <= 0) { toast.error('Please add services to your package'); return; }
    setIsProcessing(true);
    try {
      const servicesSummary = DAYS.map((d) => ({
        day: d.id, label: d.label,
        services: dayServices[d.id].map((s) => ({ id: s.id, name: s.name, price: s.price })),
      }));
      await bookingService.createBooking({
        customer_id: user.id,
        salon_id: selectedSalon?.id || '00000000-0000-0000-0000-000000000000',
        booking_date: weddingDate || new Date().toISOString().split('T')[0],
        start_time: '09:00', end_time: '18:00',
        total_amount: totalPrice, amount_paid: 0,
        status: 'pending', booking_type: 'FINAL', payment_status: 'pending',
        notes: JSON.stringify({ venueType, city, partyCount, dayServices: servicesSummary, partyMembers, packageType: 'custom' }),
      });
      setPaymentSuccess(true);
      toast.success('Booking sent for confirmation!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create booking. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const renderDetailsStep = () => (
    <div className="max-w-xl mx-auto space-y-6">
      <div>
        <label className="block text-sm font-medium text-ivory-900 mb-1.5">Select Salon</label>
        {selectedSalon ? (
          <div className="flex items-center justify-between p-3 bg-rose-50 rounded-xl border border-rose-200">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-rose-100 flex items-center justify-center">
                {selectedSalon.logo_url ? <img src={selectedSalon.logo_url} alt={selectedSalon.name} className="w-8 h-8 rounded object-cover" /> : <Building2 className="w-5 h-5 text-rose-400" />}
              </div>
              <div>
                <p className="text-sm font-medium text-ivory-900">{selectedSalon.name}</p>
                <p className="text-xs text-ivory-600">{selectedSalon.area}, {selectedSalon.city}</p>
              </div>
            </div>
            <button onClick={() => setSelectedSalon(null)} className="text-xs text-rose-500 hover:text-rose-700 cursor-pointer">Change</button>
          </div>
        ) : (
          <div className="relative">
            <Input placeholder="Search for a salon..." value={salonSearch} onChange={(e) => { setSalonSearch(e.target.value); setShowSalonPicker(true); }} icon={<Search className="w-4 h-4" />} />
            {showSalonPicker && salonSearch.length >= 2 && (
              <div className="absolute top-full left-0 right-0 z-20 mt-1 bg-white border border-ivory-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                {salonResults.length === 0 ? <p className="p-3 text-sm text-ivory-500 text-center">No salons found</p> : (
                  salonResults.map((salon) => (
                    <button key={salon.id} onClick={() => { setSelectedSalon(salon); setCity(salon.city); setShowSalonPicker(false); setSalonSearch(''); }} className="w-full text-left px-3 py-2.5 hover:bg-ivory-50 flex items-center gap-3 border-b border-ivory-100 last:border-0 cursor-pointer">
                      <Building2 className="w-4 h-4 text-ivory-400 shrink-0" /><div><p className="text-sm font-medium text-ivory-900">{salon.name}</p><p className="text-xs text-ivory-600">{salon.area}, {salon.city}</p></div>
                    </button>
                  ))
                )}
              </div>
            )}
          </div>
        )}
      </div>
      <div><label className="block text-sm font-medium text-ivory-900 mb-1.5">Wedding Date</label><Input type="date" value={weddingDate} onChange={(e) => setWeddingDate(e.target.value)} icon={<Calendar className="w-4 h-4" />} /></div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-ivory-900 mb-1.5">City</label>
          <select value={city} onChange={(e) => setCity(e.target.value)} className="input-field">
            <option value="Delhi">Delhi</option><option value="New Delhi">New Delhi</option><option value="Gurgaon">Gurgaon</option><option value="Noida">Noida</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-ivory-900 mb-1.5">Venue Type</label>
          <select value={venueType} onChange={(e) => setVenueType(e.target.value)} className="input-field">
            <option value="">Select venue</option><option value="Banquet Hall">Banquet Hall</option><option value="Hotel">Hotel</option><option value="Farmhouse">Farmhouse</option><option value="Home">Home</option>
          </select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-ivory-900 mb-1.5">Bridal Party Count</label>
          <div className="flex items-center gap-3">
            <button onClick={() => setPartyCount(Math.max(1, partyCount - 1))} className="w-10 h-10 rounded-full border border-ivory-200 flex items-center justify-center hover:bg-ivory-50 cursor-pointer" type="button">-</button>
            <span className="text-lg font-semibold text-ivory-900 w-8 text-center">{partyCount}</span>
            <button onClick={() => setPartyCount(Math.min(20, partyCount + 1))} className="w-10 h-10 rounded-full border border-ivory-200 flex items-center justify-center hover:bg-ivory-50 cursor-pointer" type="button">+</button>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-ivory-900 mb-1.5">Budget Range</label>
          <Input type="number" value={budget} onChange={(e) => setBudget(Number(e.target.value))} icon={<IndianRupee className="w-4 h-4" />} min={0} step={5000} />
        </div>
      </div>
      <p className="text-xs text-ivory-500 text-center">{selectedSalon ? `\u2713 Using services from ${selectedSalon.name}` : 'Tip: Select a salon to use their real services in the planner'}</p>
    </div>
  );

  const renderPlannerStep = () => {
    if (!selectedSalon) {
      return (
        <div className="text-center py-12">
          <Building2 className="w-12 h-12 mx-auto text-ivory-300 mb-4" />
          <h3 className="font-heading text-lg text-ivory-900 mb-2">No Salon Selected</h3>
          <p className="text-ivory-600 text-sm mb-6">Go back and select a salon to use their services.</p>
          <Button variant="primary" size="md" onClick={() => setCurrentStep(0)}>Back to Details</Button>
        </div>
      );
    }
    if (isLoadingServices) {
      return (
        <div className="space-y-4"><LoadingShimmer className="h-8 w-48" /><LoadingShimmer className="h-40 w-full" /><LoadingShimmer className="h-40 w-full" /></div>
      );
    }
    if (selectedSalonServices.length === 0) {
      return (
        <div className="text-center py-12">
          <ShoppingCart className="w-12 h-12 mx-auto text-ivory-300 mb-4" />
          <h3 className="font-heading text-lg text-ivory-900 mb-2">No Services Available</h3>
          <p className="text-ivory-600 text-sm">This salon hasn't added any services yet.</p>
        </div>
      );
    }
    const catalogGroups = selectedSalonServices.reduce((groups, svc) => {
      const cat = svc.category || 'Other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(svc);
      return groups;
    }, {} as Record<string, Service[]>);
    return (
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onDragOver={handleDragOver}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex gap-2 mb-1">
              {DAYS.map((day) => (
                <button key={day.id} onClick={() => setActiveDayId(day.id)} className={cn('px-4 py-2 rounded-lg text-sm font-medium transition-all cursor-pointer', activeDayId === day.id ? 'bg-rose-100 text-rose-800 shadow-sm' : 'bg-ivory-100 text-ivory-600 hover:bg-ivory-200')}>
                  {day.label}
                  {dayServices[day.id].length > 0 && <span className="ml-2 text-xs bg-rose-200 text-rose-700 px-1.5 py-0.5 rounded-full">{dayServices[day.id].length}</span>}
                </button>
              ))}
            </div>
            {DAYS.map((day) => (
              <DaySection key={day.id} day={day} services={dayServices[day.id]} isActive={activeDayId === day.id} isDragOver={dragOverDayId === day.id} onSetActive={() => setActiveDayId(day.id)} onRemove={(serviceId) => removeServiceFromDay(day.id, serviceId)} />
            ))}
            <div className="card p-4 bg-rose-50 border-rose-200">
              <div className="flex justify-between items-center">
                <span className="font-heading text-lg text-rose-800">Total Package</span>
                <span className="text-2xl font-bold text-rose-400">{formatPrice(totalPrice)}</span>
              </div>
              {budget > 0 && totalPrice > budget && <p className="text-sm text-rose-600 mt-1">\u26A0 Over budget by {formatPrice(totalPrice - budget)}</p>}
              {budget > 0 && totalPrice <= budget && totalPrice > 0 && <p className="text-sm text-green-600 mt-1 flex items-center gap-1"><Check className="w-3.5 h-3.5" /> Within budget</p>}
            </div>
          </div>
          <div>
            <div className="card p-4 sticky top-24">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-heading text-ivory-900">Services at <span className="text-rose-500">{selectedSalon.name}</span></h3>
                <Sparkles className="w-4 h-4 text-rose-400" />
              </div>
              <p className="text-xs text-ivory-500 mb-3">Drag services to a day, or tap a day first then tap to add</p>
              {Object.entries(catalogGroups).map(([category, services]) => (
                <div key={category} className="mb-4">
                  <h4 className="text-xs font-semibold text-ivory-600 uppercase tracking-wider mb-2 px-1">{category}</h4>
                  <div className="space-y-2">
                    {services.map((service) => (
                      <div key={service.id} className="relative group">
                        <DraggableCatalogService service={service} />
                        <button onClick={() => handleQuickAdd(service)} className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-rose-400 text-white rounded-full w-5 h-5 flex items-center justify-center cursor-pointer" title="Quick-add to suggested day" type="button">
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <DragOverlay>
          {activeDragService ? (
            <div className="p-3 bg-white rounded-lg border-2 border-rose-400 shadow-xl max-w-[250px]">
              <p className="text-sm font-medium text-ivory-900">{activeDragService.name}</p>
              <div className="flex items-center justify-between mt-1">
                <span className="text-xs text-ivory-500">{activeDragService.duration_minutes || activeDragService.duration} min</span>
                <span className="text-sm font-semibold text-rose-400">{formatPrice(activeDragService.price)}</span>
              </div>
            </div>
          ) : null}
        </DragOverlay>
      </DndContext>
    );
  };

  const renderPartyStep = () => (
    <div className="max-w-xl mx-auto space-y-4">
      <p className="text-sm text-ivory-600 mb-4">Add members of your bridal party and assign services to each</p>
      {partyMembers.map((member, i) => (
        <div key={i} className="card p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2">
              <input className="text-sm font-medium text-ivory-900 bg-transparent border-b border-dashed border-ivory-300 focus:outline-none focus:border-rose-400" value={member.name} onChange={(e) => { const updated = [...partyMembers]; updated[i].name = e.target.value; setPartyMembers(updated); }} placeholder="Member name" />
              <select value={member.relation} onChange={(e) => { const updated = [...partyMembers]; updated[i].relation = e.target.value; setPartyMembers(updated); }} className="text-xs border border-ivory-200 rounded-lg px-2 py-1 bg-white">
                <option value="Bridesmaid">Bridesmaid</option><option value="Mother">Mother</option><option value="Sister">Sister</option><option value="Friend">Friend</option><option value="Other">Other</option>
              </select>
            </div>
            <button onClick={() => setPartyMembers((prev) => prev.filter((_, idx) => idx !== i))} className="text-ivory-400 hover:text-rose-500 cursor-pointer" type="button"><Trash2 className="w-4 h-4" /></button>
          </div>
          <div className="flex flex-wrap gap-1.5">{member.services.map((s) => (<Badge key={s} variant="rose">{s}</Badge>))}</div>
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="secondary" size="sm" onClick={() => setPartyMembers((prev) => [...prev, { name: `Member ${prev.length + 1}`, relation: 'Bridesmaid', services: [] }])}>
          <Plus className="w-4 h-4 mr-1" /> Add Member
        </Button>
      </div>
    </div>
  );

  const renderSummaryStep = () => (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="card overflow-hidden">
        <div className="bg-rose-50 p-5 border-b border-rose-100"><h3 className="font-heading text-rose-800">Booking Summary</h3></div>
        <div className="p-5 space-y-4">
          {selectedSalon && (
            <div className="flex items-center gap-3 p-3 bg-ivory-50 rounded-lg">
              <Building2 className="w-5 h-5 text-rose-400 shrink-0" />
              <div><p className="text-sm font-medium text-ivory-900">{selectedSalon.name}</p><p className="text-xs text-ivory-600">{selectedSalon.area}, {selectedSalon.city}</p></div>
            </div>
          )}
          <div className="flex justify-between text-sm"><span className="text-ivory-600">Wedding Date</span><span className="font-medium text-ivory-900">{weddingDate || 'Not set'}</span></div>
          <div className="flex justify-between text-sm"><span className="text-ivory-600">Venue</span><span className="font-medium text-ivory-900">{venueType || 'Not set'} · {city}</span></div>
          <div className="flex justify-between text-sm"><span className="text-ivory-600">Party Size</span><span className="font-medium text-ivory-900">{partyCount} members</span></div>
          <hr className="border-ivory-200" />
          {DAYS.map((day) => {
            const items = dayServices[day.id];
            if (items.length === 0) return null;
            return (
              <div key={day.id}>
                <div className="flex justify-between text-sm font-medium text-ivory-900 mb-1"><span>{day.label}</span><span>{formatPrice(items.reduce((sum, s) => sum + s.price, 0))}</span></div>
                {items.map((s) => (
                  <div key={s.id} className="flex justify-between text-xs text-ivory-600 pl-4"><span>{s.name}</span><span>{formatPrice(s.price)}</span></div>
                ))}
              </div>
            );
          })}
          {partyMembers.length > 0 && (
            <>
              <hr className="border-ivory-200" />
              <div><p className="text-sm font-medium text-ivory-900 mb-2">Bridal Party ({partyMembers.length})</p><div className="flex flex-wrap gap-1.5">{partyMembers.map((m, i) => (<Badge key={i} variant="gray">{m.name} ({m.relation})</Badge>))}</div></div>
            </>
          )}
          <hr className="border-ivory-200" />
          <div className="flex justify-between items-center"><span className="font-heading text-lg text-ivory-900">Total</span><span className="text-2xl font-bold text-rose-400">{formatPrice(totalPrice)}</span></div>
          {budget > 0 && totalPrice <= budget && totalPrice > 0 && (
            <div className="p-3 bg-green-50 rounded-lg flex items-center gap-2 text-sm text-green-700"><Check className="w-4 h-4" /> Within budget</div>
          )}
          {!selectedSalon && <div className="p-3 bg-amber-50 rounded-xl text-sm text-amber-700">No salon selected - booking will be created without a salon association.</div>}
        </div>
      </div>

      {paymentSuccess ? (
        <div className="text-center py-8">
          <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-4"><CheckCircle2 className="w-10 h-10 text-green-500" /></div>
          <h3 className="font-heading text-2xl text-rose-800 mb-2">Booking Confirmed!</h3>
          <p className="text-ivory-600 mb-6">Your custom bridal package has been booked.</p>
          <Button variant="primary" size="md" onClick={resetAll}>Plan Another Package</Button>
        </div>
      ) : (
        <div className="text-center space-y-3">
          {!isAuthenticated && <div className="p-3 bg-amber-50 rounded-xl text-sm text-amber-700 mb-3">Please log in to proceed</div>}
          <Button variant="primary" size="lg" className="w-full md:w-auto" disabled={isProcessing || !isAuthenticated} onClick={handleConfirm}>
            {isProcessing ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Processing...</> : <><CheckCircle2 className="w-4 h-4 mr-2" /> Confirm Booking</>}
          </Button>
        </div>
      )}
    </div>
  );

  const renderStepContent = () => {
    switch (currentStep) {
      case 0: return renderDetailsStep();
      case 1: return renderPlannerStep();
      case 2: return renderPartyStep();
      case 3: return renderSummaryStep();
      default: return null;
    }
  };

  const canProceed = useCallback((): boolean => {
    if (currentStep === 0) return !!weddingDate;
    if (currentStep === 1) return totalPrice > 0;
    return true;
  }, [currentStep, weddingDate, totalPrice]);

  return (
    <div className="min-h-screen pt-20 md:pt-24 pb-20">
      <Helmet>
        <title>Plan Your Bridal Package - Shringar</title>
        <meta name="description" content="Plan your complete bridal beauty package. Drag-and-drop services from real salons, manage budget, and book your dream look." />
      </Helmet>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8">
          <h1 className="font-heading text-3xl text-rose-800 mb-2">Your Bridal Package Planner</h1>
          <p className="text-ivory-600">Pick a salon, plan your wedding beauty schedule, and book your look.</p>
        </div>
        {!paymentSuccess && (
          <>
            <ProgressStepper steps={STEPS} currentStep={currentStep} className="max-w-3xl mx-auto mb-10" />
            <AnimatePresence mode="wait">
              <motion.div key={currentStep} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} transition={{ duration: 0.3 }}>
                {renderStepContent()}
              </motion.div>
            </AnimatePresence>
            <div className="flex items-center justify-between mt-10 max-w-xl mx-auto">
              <Button variant="ghost" size="md" onClick={() => setCurrentStep(Math.max(0, currentStep - 1))} disabled={currentStep === 0}>
                <ChevronLeft className="w-4 h-4 mr-1" /> Back
              </Button>
              <span className="text-sm text-ivory-600">Step {currentStep + 1} of {STEPS.length}</span>
              <Button variant="primary" size="md" onClick={() => setCurrentStep(Math.min(STEPS.length - 1, currentStep + 1))} disabled={!canProceed()}>
                {currentStep === STEPS.length - 1 ? 'Confirm & Book' : <><>Continue <ChevronRight className="w-4 h-4 ml-1" /></></>}
              </Button>
            </div>
          </>
        )}
        {paymentSuccess && renderStepContent()}
      </div>
    </div>
  );
}