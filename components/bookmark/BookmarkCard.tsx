'use client';
import type { Bookmark } from '@/shared/types';
import { useBookmarkStore } from '@/stores/bookmark-store';
import styles from './Bookmark.module.css';

export function BookmarkCard({ bookmark }: { bookmark: Bookmark }) {
  const updateVote = useBookmarkStore(s => s.updateVote);

  const handleVote = async (vote: 'up' | 'down') => {
    const res = await fetch(`/api/bookmarks/${bookmark.id}/vote`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ vote }),
    });
    if (res.ok) {
      const data = await res.json();
      updateVote(bookmark.id, vote, data.aiAnswer, data.aiAnswerVersion);
    }
  };

  return (
    <div className={styles.card}>
      <p className={styles.question}>{bookmark.question}</p>
      <div className={styles.answer}>{bookmark.aiAnswer}</div>
      <p className={styles.meta}>
        版本 {bookmark.aiAnswerVersion} · 👍 {bookmark.upVotes} · 👎 {bookmark.downVotes}
      </p>
      <div className={styles.actions}>
        <button
          className={`${styles.voteBtn} ${bookmark.userVote === 'up' ? styles.voted : ''}`}
          onClick={() => handleVote('up')}
        >
          👍 有用
        </button>
        <button
          className={`${styles.voteBtn} ${bookmark.userVote === 'down' ? styles.voted : ''}`}
          onClick={() => handleVote('down')}
        >
          👎 可以更好
        </button>
      </div>
    </div>
  );
}
