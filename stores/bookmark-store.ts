import { create } from 'zustand';
import type { Bookmark } from '@/shared/types';

interface BookmarkState {
  bookmarks: Bookmark[];
  loading: boolean;
  setBookmarks: (b: Bookmark[]) => void;
  addBookmark: (b: Bookmark) => void;
  updateVote: (id: string, vote: 'up' | 'down', aiAnswer?: string, aiAnswerVersion?: number) => void;
}

export const useBookmarkStore = create<BookmarkState>((set) => ({
  bookmarks: [],
  loading: false,
  setBookmarks: (bookmarks) => set({ bookmarks }),
  addBookmark: (bookmark) => set((s) => ({ bookmarks: [bookmark, ...s.bookmarks] })),
  updateVote: (id, userVote, aiAnswer, aiAnswerVersion) =>
    set((s) => ({
      bookmarks: s.bookmarks.map((b) => {
        if (b.id !== id) return b;
        const prevVote = b.userVote;
        let upVotes = b.upVotes;
        let downVotes = b.downVotes;
        if (prevVote === 'up') upVotes--;
        if (prevVote === 'down') downVotes--;
        if (userVote === 'up') upVotes++;
        if (userVote === 'down') downVotes++;
        return { ...b, upVotes, downVotes, userVote, ...(aiAnswer ? { aiAnswer, aiAnswerVersion: aiAnswerVersion || b.aiAnswerVersion } : {}) };
      }),
    })),
}));
