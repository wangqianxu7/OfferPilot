import type { InterviewFeedback } from '@/shared/types';
import styles from './InterviewChat.module.css';

export function FeedbackCard({ feedback }: { feedback: InterviewFeedback }) {
  return (
    <div className={styles.feedbackCard}>
      <div className={styles.feedbackScore}>
        评分：{'⭐'.repeat(feedback.score)} ({feedback.score}/10)
      </div>
      {feedback.strengths.length > 0 && (
        <ul className={styles.feedbackList}>
          {feedback.strengths.map((s, i) => (
            <li key={i} className={styles.strength}>👍 {s}</li>
          ))}
        </ul>
      )}
      {feedback.improvements.length > 0 && (
        <ul className={styles.feedbackList}>
          {feedback.improvements.map((imp, i) => (
            <li key={i} className={styles.improvement}>⚠️ {imp}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
