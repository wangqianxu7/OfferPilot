'use client';
import { useEffect, Suspense } from 'react';
import { InterviewChat } from '@/components/interview/InterviewChat';
import { useInterviewStore } from '@/stores/interview-store';
import { useCandidateStore } from '@/stores/candidate-store';
import { useRouter, useSearchParams } from 'next/navigation';
import { loadCache, saveCache, clearCache } from '@/lib/client/storage';
import { Button } from '@/components/ui/Button';
import type { InterviewSession, InterviewMessage } from '@/shared/types';

function InterviewContent() {
  const { session, messages, startSession, resumeSession, restoreFromCache, endSession } = useInterviewStore();
  const { candidate } = useCandidateStore();
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (!candidate) { router.push('/'); return; }
    if (!session) {
      // Try cache first
      const cached = loadCache<{ session: InterviewSession; messages: InterviewMessage[] }>('interview');
      if (cached?.session && cached.messages.length > 0) {
        restoreFromCache(cached.session, cached.messages);
      } else {
        const existingId = searchParams.get('id');
        if (existingId) {
          resumeSession(existingId, candidate.id);
        } else {
          startSession(candidate.id);
        }
      }
    }
  }, [candidate, session, startSession, resumeSession, restoreFromCache, router, searchParams]);

  // Auto-save
  useEffect(() => {
    if (session && messages.length > 0) {
      saveCache('interview', { session, messages });
    }
  }, [session, messages]);

  const handleRefresh = () => {
    clearCache('interview');
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

export default function InterviewPage() {
  return (
    <Suspense fallback={<div style={{ padding: '2rem', color: 'var(--text-muted)' }}>加载中...</div>}>
      <InterviewContent />
    </Suspense>
  );
}
