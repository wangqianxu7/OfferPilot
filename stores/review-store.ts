import { create } from 'zustand';
import type { ReviewReport } from '@/shared/types';

interface ReviewState {
  reports: ReviewReport[];
  currentReport: ReviewReport | null;
  loading: boolean;
  setReports: (r: ReviewReport[]) => void;
  setCurrentReport: (r: ReviewReport | null) => void;
  setLoading: (v: boolean) => void;
}

export const useReviewStore = create<ReviewState>((set) => ({
  reports: [],
  currentReport: null,
  loading: false,
  setReports: (reports) => set({ reports }),
  setCurrentReport: (currentReport) => set({ currentReport }),
  setLoading: (loading) => set({ loading }),
}));
