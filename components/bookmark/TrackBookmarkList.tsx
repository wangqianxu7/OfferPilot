'use client';
import { useEffect, useState } from 'react';
import { useTrackBookmarkStore } from '@/stores/track-bookmark-store';
import type { TrackBookmark } from '@/shared/types';
import styles from './Bookmark.module.css';

const TOPIC_LABELS: Record<string, string> = {
  'post-training': '后训练',
  'multimodal': '多模态',
  'rag': 'RAG',
  'agent': 'Agent',
};

const TRACK_LABELS: Record<string, string> = {
  'basics': '📚 八股',
  'paper': '📄 论文',
  'leetcode': '⚙️ 算法',
  'torchcode': '🔥 手撕',
  'resume': '📋 简历',
};

export function TrackBookmarkList() {
  const [bookmarks, setBookmarks] = useState<TrackBookmark[]>([]);
  const removeBookmark = useTrackBookmarkStore(s => s.removeBookmark);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('op_track_bookmarks');
      if (raw) setBookmarks(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  const handleDelete = (id: string) => {
    removeBookmark(id);
    setBookmarks(prev => prev.filter(b => b.id !== id));
  };

  if (bookmarks.length === 0) return null;

  return (
    <div style={{ marginTop: '2rem' }}>
      <h2 className={styles.heading}>📚 赛道收藏</h2>
      {bookmarks.map((b) => (
        <div key={b.id} className={styles.card}>
          <div className={styles.question}>{b.question}</div>
          {b.referenceAnswer && (
            <details>
              <summary style={{ cursor: 'pointer', fontSize: '0.82rem', color: 'var(--success)', marginBottom: '0.4rem' }}>
                参考答案
              </summary>
              <div className={styles.answer} style={{ borderLeftColor: 'var(--success)' }}>
                {b.referenceAnswer}
              </div>
            </details>
          )}
          <div className={styles.meta}>
            {TRACK_LABELS[b.track] || b.track} · {b.topic ? TOPIC_LABELS[b.topic] : '通用'}
          </div>
          <div className={styles.actions}>
            <button className={styles.voteBtn} onClick={() => handleDelete(b.id)}>
              🗑️ 删除
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
