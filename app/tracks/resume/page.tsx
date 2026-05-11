'use client';
import { useEffect } from 'react';
import { InterviewChat } from '@/components/interview/InterviewChat';
import { useInterviewStore } from '@/stores/interview-store';
import { useCandidateStore } from '@/stores/candidate-store';
import { useRouter } from 'next/navigation';
import { loadCache, saveCache, clearCache } from '@/lib/client/storage';
import { Button } from '@/components/ui/Button';
import type { InterviewSession, InterviewMessage } from '@/shared/types';

export default function ResumeTrackPage() {
  const { session, messages, startSession, restoreFromCache, endSession } = useInterviewStore();
  const { candidate } = useCandidateStore();
  const router = useRouter();

  useEffect(() => {
    if (!candidate) { router.push('/'); return; }
    if (!session) {
      const cached = loadCache<{ session: InterviewSession; messages: InterviewMessage[] }>('resume');
      if (cached?.session && cached.messages.length > 0) {
        restoreFromCache(cached.session, cached.messages);
      } else {
        startSession(candidate.id);
      }
    }
  }, [candidate, session, startSession, restoreFromCache, router]);

  // Auto-save
  useEffect(() => {
    if (session && messages.length > 0) {
      saveCache('resume', { session, messages });
    }
  }, [session, messages]);

  const handleRefresh = () => {
    clearCache('resume');
    endSession();
    if (candidate) startSession(candidate.id);
  };

  if (!candidate) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 44px)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', padding: '0.5rem 1rem', borderBottom: 'var(--border-width) solid var(--border)' }}>
        <Button variant="ghost" size="sm" onClick={handleRefresh}>🔄 刷新</Button>
      </div>
      <InterviewChat />
    </div>
  );
}
