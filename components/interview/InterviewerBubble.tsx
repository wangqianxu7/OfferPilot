import type { InterviewMessage } from '@/shared/types';
import styles from './InterviewChat.module.css';

export function InterviewerBubble({ message }: { message: InterviewMessage }) {
  return (
    <div className={styles.bubbleRow}>
      <span className={styles.roleTag}>面试官</span>
      <div className={styles.interviewerBubble}>
        <p>{message.content}</p>
      </div>
    </div>
  );
}
