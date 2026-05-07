'use client';
import { useEffect } from 'react';
import { InterviewChat } from '@/components/interview/InterviewChat';
import { useInterviewStore } from '@/stores/interview-store';
import { useCandidateStore } from '@/stores/candidate-store';
import { useRouter } from 'next/navigation';

export default function ResumeTrackPage() {
  const { session, startSession } = useInterviewStore();
  const { candidate } = useCandidateStore();
  const router = useRouter();

  useEffect(() => {
    if (!candidate) { router.push('/'); return; }
    if (!session) { startSession(candidate.id); }
  }, [candidate, session, startSession, router]);

  if (!candidate) return null;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 44px)' }}>
      <InterviewChat />
    </div>
  );
}
