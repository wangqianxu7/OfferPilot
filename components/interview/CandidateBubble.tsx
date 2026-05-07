import type { InterviewMessage } from '@/shared/types';
import styles from './InterviewChat.module.css';

export function CandidateBubble({ message, onBookmark }: {
  message: InterviewMessage;
  onBookmark: () => void;
}) {
  return (
    <div className={`${styles.bubbleRow} ${styles.candidateRow}`}>
      <div className={styles.candidateBubble}>
        <p>{message.content}</p>
      </div>
      <div className={styles.candidateActions}>
        <button onClick={onBookmark} className={styles.bookmarkBtn} title="收藏此题" aria-label="收藏此题">
          ⭐
        </button>
      </div>
    </div>
  );
}
