import { create } from 'zustand';
import type { TrainingTrack, BasicsTopic, TrackMessage, CodeReviewResult } from '@/shared/types';

interface TrackState {
  activeTrack: TrainingTrack | null;
  activeTopic: BasicsTopic | null;
  messages: TrackMessage[];
  isStreaming: boolean;

  setTrack: (track: TrainingTrack) => void;
  setTopic: (topic: BasicsTopic) => void;
  addMessage: (msg: TrackMessage) => void;
  setCodeReview: (msgId: string, review: CodeReviewResult) => void;
  setFeedback: (msgId: string, feedback: { score: number; strengths: string[]; improvements: string[] }) => void;
  setStreaming: (v: boolean) => void;
  clearMessages: () => void;
}

export const useTrackStore = create<TrackState>((set) => ({
  activeTrack: null,
  activeTopic: null,
  messages: [],
  isStreaming: false,

  setTrack: (track) => set({ activeTrack: track, messages: [] }),
  setTopic: (topic) => set({ activeTopic: topic }),

  addMessage: (msg) =>
    set((s) => ({ messages: [...s.messages, msg] })),

  setCodeReview: (msgId, review) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === msgId ? { ...m, codeReview: review } : m
      ),
    })),

  setFeedback: (msgId, feedback) =>
    set((s) => ({
      messages: s.messages.map((m) =>
        m.id === msgId ? { ...m, feedback } : m
      ),
    })),

  setStreaming: (isStreaming) => set({ isStreaming }),
  clearMessages: () => set({ messages: [] }),
}));
