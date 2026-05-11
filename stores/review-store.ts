import { create } from 'zustand';
import type { ReviewReport } from '@/shared/types';
import { loadCache, saveCache, clearCache } from '@/lib/client/storage';

const CACHE_KEY = 'review';

interface ReviewState {
  reports: ReviewReport[];
  currentReport: ReviewReport | null;
  loading: boolean;
  setReports: (r: ReviewReport[]) => void;
  setCurrentReport: (r: ReviewReport | null) => void;
  setLoading: (v: boolean) => void;
  loadFromStorage: () => void;
  clearStorage: () => void;
}

export const useReviewStore = create<ReviewState>((set, get) => ({
  reports: [],
  currentReport: null,
  loading: false,
  setReports: (reports) => set({ reports }),
  setCurrentReport: (currentReport) => {
    set({ currentReport });
    if (currentReport) saveCache(CACHE_KEY, { currentReport });
  },
  setLoading: (loading) => set({ loading }),
  loadFromStorage: () => {
    const cached = loadCache<{ currentReport: ReviewReport | null }>(CACHE_KEY);
    if (cached?.currentReport) set({ currentReport: cached.currentReport });
  },
  clearStorage: () => {
    clearCache(CACHE_KEY);
    set({ currentReport: null });
  },
}));
