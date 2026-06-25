import { create } from 'zustand';

const STORAGE_KEY = 'shringar_wishlist';

function loadWishlist(): string[] {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch {
    return [];
  }
}

function saveWishlist(ids: string[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {}
}

interface WishlistStore {
  salonIds: string[];
  toggleSalon: (id: string) => void;
  isSaved: (id: string) => boolean;
  clearAll: () => void;
}

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  salonIds: loadWishlist(),
  toggleSalon: (id) =>
    set((state) => {
      const newIds = state.salonIds.includes(id)
        ? state.salonIds.filter((sid) => sid !== id)
        : [...state.salonIds, id];
      saveWishlist(newIds);
      return { salonIds: newIds };
    }),
  isSaved: (id) => get().salonIds.includes(id),
  clearAll: () => {
    saveWishlist([]);
    set({ salonIds: [] });
  },
}));