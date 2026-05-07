import { create } from 'zustand';
import type { Candidate, ProjectDetail, ResumeParsed } from '@/shared/types';

interface CandidateState {
  candidate: Candidate | null;
  projects: ProjectDetail[];
  setCandidate: (c: Candidate) => void;
  setResumeParsed: (parsed: ResumeParsed) => void;
  setProjects: (projects: ProjectDetail[]) => void;
  addProject: (project: ProjectDetail) => void;
  updateProject: (id: string, updates: Partial<ProjectDetail>) => void;
  loadCandidate: () => void;
}

function persist<T>(key: string, value: T) {
  if (typeof window !== 'undefined') localStorage.setItem(key, JSON.stringify(value));
}

export const useCandidateStore = create<CandidateState>((set) => ({
  candidate: null,
  projects: [],
  setCandidate: (candidate) => {
    persist('op_candidate', candidate);
    set({ candidate });
  },
  setResumeParsed: (parsed) =>
    set((s) => ({
      candidate: s.candidate ? { ...s.candidate, resumeParsed: parsed } : null,
    })),
  setProjects: (projects) => {
    persist('op_projects', projects);
    set({ projects });
  },
  addProject: (p) =>
    set((s) => {
      const projects = [...s.projects, p];
      persist('op_projects', projects);
      return { projects };
    }),
  updateProject: (id, updates) =>
    set((s) => {
      const projects = s.projects.map((p) => (p.id === id ? { ...p, ...updates } : p));
      persist('op_projects', projects);
      return { projects };
    }),
  loadCandidate: () => {
    if (typeof window === 'undefined') return;
    const stored = localStorage.getItem('op_candidate');
    const storedProjects = localStorage.getItem('op_projects');
    if (stored) {
      try { set({ candidate: JSON.parse(stored) }); } catch {}
    }
    if (storedProjects) {
      try { set({ projects: JSON.parse(storedProjects) }); } catch {}
    }
  },
}));
