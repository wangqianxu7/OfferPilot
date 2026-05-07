'use client';
import { useEffect } from 'react';
import { BasicsChat } from '@/components/tracks/BasicsChat';
import { useTrackStore } from '@/stores/track-store';

export default function BasicsPage() {
  const setTrack = useTrackStore(s => s.setTrack);
  useEffect(() => { setTrack('basics'); }, [setTrack]);

  return <BasicsChat />;
}
