import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { salonService, bookingService, dashboardService } from '../services/salons';
import type { TablesInsert, TablesUpdate } from '../types/database';
import type { SalonQueryParams } from '../services/salons';
import toast from 'react-hot-toast';

// ──────── SALON QUERIES ────────

export function useMySalon(ownerId: string | undefined) {
  return useQuery({
    queryKey: ['my-salon', ownerId],
    queryFn: () => salonService.getMySalon(ownerId!),
    enabled: !!ownerId,
  });
}

export function useSalonBySlug(slug: string | undefined) {
  return useQuery({
    queryKey: ['salon', slug],
    queryFn: () => salonService.getSalonBySlug(slug!),
    enabled: !!slug,
  });
}

export function useUpdateSalon() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: TablesUpdate<'salons'> }) =>
      salonService.updateSalon(id, updates),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['my-salon', data.owner_id] });
      qc.invalidateQueries({ queryKey: ['salon', data.slug] });
      toast.success('Salon updated');
    },
  });
}

export function useSalons(params?: SalonQueryParams) {
  return useQuery({
    queryKey: ['salons', params],
    queryFn: () => salonService.getSalons(params),
  });
}

export function useFeaturedSalons() {
  return useQuery({
    queryKey: ['salons', 'featured'],
    queryFn: () => salonService.getSalons(),
    staleTime: 5 * 60 * 1000,
  });
}

// ──────── DASHBOARD STATS ────────

export function useOverviewStats(salonId: string | undefined) {
  return useQuery({
    queryKey: ['dashboard-stats', salonId],
    queryFn: () => dashboardService.getOverviewStats(salonId!),
    enabled: !!salonId,
    refetchInterval: 60_000,
  });
}

export function useAnalytics(salonId: string | undefined, period: 'week' | '6months' = 'week') {
  return useQuery({
    queryKey: ['analytics', salonId, period],
    queryFn: () => dashboardService.getAnalytics(salonId!, period),
    enabled: !!salonId,
  });
}

export function useMyBookings(userId: string | undefined) {
  return useQuery({
    queryKey: ['my-bookings', userId],
    queryFn: () => bookingService.getMyBookings(userId!),
    enabled: !!userId,
  });
}

// ──────── BOOKINGS ────────

export function useSalonBookings(salonId: string | undefined) {
  return useQuery({
    queryKey: ['salon-bookings', salonId],
    queryFn: () => bookingService.getSalonBookings(salonId!),
    enabled: !!salonId,
    refetchInterval: 30_000,
  });
}

export function useUpdateBooking() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: TablesUpdate<'bookings'> }) =>
      bookingService.updateBooking(id, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['salon-bookings'] });
      qc.invalidateQueries({ queryKey: ['my-bookings'] });
      toast.success('Booking updated');
    },
  });
}

// ──────── SERVICES ────────

export function useSalonServices(salonId: string | undefined) {
  return useQuery({
    queryKey: ['salon-services', salonId],
    queryFn: () => salonService.getSalonServices(salonId!),
    enabled: !!salonId,
  });
}

export function useCreateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (service: TablesInsert<'services'>) => salonService.createService(service),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['salon-services'] });
      toast.success('Service added');
    },
  });
}

export function useUpdateService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: TablesUpdate<'services'> }) =>
      salonService.updateService(id, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['salon-services'] });
      toast.success('Service updated');
    },
  });
}

export function useDeleteService() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => salonService.deleteService(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['salon-services'] });
      toast.success('Service deleted');
    },
  });
}


// ──────── ARTISTS ────────

export function useSalonArtists(salonId: string | undefined) {
  return useQuery({
    queryKey: ['salon-artists', salonId],
    queryFn: () => salonService.getSalonArtists(salonId!),
    enabled: !!salonId,
  });
}

export function useCreateArtist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (artist: TablesInsert<'artists'>) => salonService.createArtist(artist),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['salon-artists'] });
      toast.success('Artist added');
    },
  });
}

export function useUpdateArtist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: TablesUpdate<'artists'> }) =>
      salonService.updateArtist(id, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['salon-artists'] });
      toast.success('Artist updated');
    },
  });
}

export function useDeleteArtist() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => salonService.deleteArtist(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['salon-artists'] });
      toast.success('Artist removed');
    },
  });
}

// ──────── PACKAGES ────────

export function useSalonPackages(salonId: string | undefined) {
  return useQuery({
    queryKey: ['salon-packages', salonId],
    queryFn: () => salonService.getSalonPackages(salonId!),
    enabled: !!salonId,
  });
}

export function useCreatePackage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (pkg: TablesInsert<'packages'>) => salonService.createPackage(pkg),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['salon-packages'] });
      toast.success('Package created');
    },
  });
}

export function useUpdatePackage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, updates }: { id: string; updates: TablesUpdate<'packages'> }) =>
      salonService.updatePackage(id, updates),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['salon-packages'] });
      toast.success('Package updated');
    },
  });
}

export function useDeletePackage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => salonService.deletePackage(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['salon-packages'] });
      toast.success('Package deleted');
    },
  });
}

// ──────── PORTFOLIO ────────

export function usePortfolioImages(salonId: string | undefined) {
  return useQuery({
    queryKey: ['portfolio', salonId],
    queryFn: () => salonService.getPortfolioImages(salonId!),
    enabled: !!salonId,
  });
}

export function useCreatePortfolioImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (image: TablesInsert<'portfolio_images'>) => salonService.createPortfolioImage(image),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portfolio'] });
      toast.success('Image added to portfolio');
    },
  });
}

export function useDeletePortfolioImage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => salonService.deletePortfolioImage(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['portfolio'] });
      toast.success('Image removed');
    },
  });
}

// ──────── REVIEWS ────────

export function useSalonReviews(salonId: string | undefined) {
  return useQuery({
    queryKey: ['salon-reviews', salonId],
    queryFn: () => salonService.getSalonReviews(salonId!),
    enabled: !!salonId,
  });
}

// ──────── WORKING HOURS ────────

export function useWorkingHours(salonId: string | undefined) {
  return useQuery({
    queryKey: ['working-hours', salonId],
    queryFn: () => salonService.getWorkingHours(salonId!),
    enabled: !!salonId,
  });
}

export function useUpsertWorkingHours() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (hours: TablesInsert<'working_hours'>) => salonService.upsertWorkingHours(hours),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['working-hours'] });
    },
  });
}

// ──────── TIME SLOTS ────────

export function useTimeSlots(salonId: string | undefined, date: string) {
  return useQuery({
    queryKey: ['time-slots', salonId, date],
    queryFn: () => salonService.getTimeSlots(salonId!, date),
    enabled: !!salonId && !!date,
  });
}

export function useCreateTimeSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (slot: TablesInsert<'time_slots'>) => salonService.createTimeSlot(slot),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['time-slots'] });
      toast.success('Time slot added');
    },
  });
}

export function useDeleteTimeSlot() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => salonService.deleteTimeSlot(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['time-slots'] });
      toast.success('Time slot removed');
    },
  });
}