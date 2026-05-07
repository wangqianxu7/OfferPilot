'use client';
import { useEffect } from 'react';
import { CacheList } from '@/components/dashboard/CacheList';
import { TrackCards } from '@/components/dashboard/TrackCards';
import { useCandidateStore } from '@/stores/candidate-store';
import styles from '@/components/dashboard/Dashboard.module.css';

export default function DashboardPage() {
  const { candidate, loadCandidate } = useCandidateStore();

  useEffect(() => { loadCandidate(); }, [loadCandidate]);

  const handleSelectArchive = async (id: string) => {
    const res = await fetch('/api/cache/load', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id }),
    });
    if (!res.ok) return;
    const data = await res.json();
    if (data.resume) {
      useCandidateStore.setState({
        candidate: {
          id: data.resume.id,
          name: data.resume.parsed?.education || '候选人',
          resumeText: '',
          resumeParsed: data.resume.parsed,
          createdAt: data.resume.createdAt,
        },
        projects: data.resume.projects || [],
      });
    }
  };

  return (
    <div className={styles.page}>
      <CacheList onSelect={handleSelectArchive} />
      <TrackCards hasResume={!!candidate} />

      {candidate && (
        <div style={{ marginTop: '1rem' }}>
          <p style={{ fontSize: '0.82rem', color: 'var(--success)', marginBottom: '0.5rem' }}>
            ✓ 已加载：{candidate.name} 的简历档案
          </p>
        </div>
      )}
    </div>
  );
}
