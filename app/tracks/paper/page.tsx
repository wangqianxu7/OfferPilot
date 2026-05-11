'use client';
import { useEffect } from 'react';
import { PaperChat } from '@/components/tracks/PaperChat';
import { useTrackStore } from '@/stores/track-store';
import { loadCache } from '@/lib/client/storage';
import type { TrackMessage } from '@/shared/types';

export default function PaperPage() {
  const setTrack = useTrackStore(s => s.setTrack);
  const restoreSession = useTrackStore(s => s.restoreSession);

  useEffect(() => {
    const cached = loadCache<{ paperData: any; messages: TrackMessage[] }>('paper');
    if (cached?.messages?.length) {
      restoreSession('paper', cached.messages);
    } else {
      setTrack('paper');
    }
  }, [setTrack, restoreSession]);

  return <PaperChat />;
}
