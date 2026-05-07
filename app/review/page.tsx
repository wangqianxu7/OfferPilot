import { AudioUploader } from '@/components/review/AudioUploader';
import { ReviewReport } from '@/components/review/ReviewReport';
import styles from '@/components/review/Review.module.css';

export default function ReviewPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>📊 面试复盘</h1>
      <AudioUploader />
      <ReviewReport />
    </div>
  );
}
