import { create } from 'zustand';
import type { TrackBookmark } from '@/shared/types';

const STORAGE_KEY = 'op_track_bookmarks';

function loadFromStorage(): TrackBookmark[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveToStorage(bookmarks: TrackBookmark[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(bookmarks));
  } catch { /* localStorage full */ }
}

interface TrackBookmarkState {
  bookmarks: TrackBookmark[];
  bookmarkedUserMsgIds: Set<string>;
  init: () => void;
  addBookmark: (b: TrackBookmark) => void;
  removeBookmark: (id: string) => void;
}

export const useTrackBookmarkStore = create<TrackBookmarkState>((set, get) => ({
  bookmarks: [],
  bookmarkedUserMsgIds: new Set(),

  init: () => {
    const loaded = loadFromStorage();
    set({
      bookmarks: loaded,
      bookmarkedUserMsgIds: new Set(loaded.map((b) => b.id)),
    });
  },

  addBookmark: (b) => {
    const next = [b, ...get().bookmarks];
    saveToStorage(next);
    const ids = new Set(get().bookmarkedUserMsgIds);
    ids.add(b.id);
    set({ bookmarks: next, bookmarkedUserMsgIds: ids });
  },

  removeBookmark: (id) => {
    const next = get().bookmarks.filter((b) => b.id !== id);
    saveToStorage(next);
    const ids = new Set(get().bookmarkedUserMsgIds);
    ids.delete(id);
    set({ bookmarks: next, bookmarkedUserMsgIds: ids });
  },
}));
