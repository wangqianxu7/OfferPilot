'use client';

import { useEffect } from 'react';
import { TopBar } from './TopBar';
import { Sidebar } from './Sidebar';
import { useInterviewStore } from '@/stores/interview-store';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const sessions = useInterviewStore((s) => s.sessions);
  const loadSessions = useInterviewStore((s) => s.loadSessions);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  return (
    <>
      <TopBar />
      <div style={{ display: 'flex' }}>
        <Sidebar sessions={sessions} />
        <main style={{ flex: 1, overflow: 'auto' }}>{children}</main>
      </div>
    </>
  );
}
