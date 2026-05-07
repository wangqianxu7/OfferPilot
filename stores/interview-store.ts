import { create } from 'zustand';
import type { InterviewSession, InterviewMessage, InterviewFeedback } from '@/shared/types';

interface SessionSummary {
  id: string;
  title: string;
  date: string;
}

interface InterviewState {
  session: InterviewSession | null;
  messages: InterviewMessage[];
  sessions: SessionSummary[];
  isStreaming: boolean;
  startSession: (candidateId: string) => void;
  addMessage: (msg: InterviewMessage) => void;
  setFeedback: (msgId: string, feedback: InterviewFeedback) => void;
  setStreaming: (v: boolean) => void;
  endSession: () => void;
  loadSessions: () => void;
}

export const useInterviewStore = create<InterviewState>((set) => ({
  session: null,
  messages: [],
  sessions: [],
  isStreaming: false,

  startSession: (candidateId) => {
    const id = crypto.randomUUID();
    const storageKey = `op_msgs_${id}`;
    const stored = typeof window !== 'undefined' ? localStorage.getItem(storageKey) : null;
    const messages = stored ? JSON.parse(stored) : [];
    set({
      session: { id, candidateId, status: 'active', startedAt: new Date().toISOString() },
      messages,
    });
  },

  addMessage: (msg) =>
    set((s) => ({ messages: [...s.messages, msg] })),

  setFeedback: (msgId, feedback) =>
    set((s) => ({
      messages: s.messages.map((m) => (m.id === msgId ? { ...m, feedback } : m)),
    })),

  setStreaming: (isStreaming) => set({ isStreaming }),

  endSession: () =>
    set((s) => {
      const updated = s.session
        ? { ...s.session, status: 'completed' as const, endedAt: new Date().toISOString() }
        : null;
      const summary: SessionSummary = {
        id: s.session?.id || '',
        title: `面试 · ${new Date().toLocaleDateString('zh-CN')}`,
        date: new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' }),
      };
      const sessions = [...s.sessions, summary];
      if (typeof window !== 'undefined') localStorage.setItem('op_sessions', JSON.stringify(sessions));
      return { session: updated, sessions };
    }),

  loadSessions: () => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('op_sessions');
    if (stored) {
      try { set({ sessions: JSON.parse(stored) }); } catch {}
    }
  },
}));
