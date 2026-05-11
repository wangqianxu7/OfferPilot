'use client';
import { useEffect } from 'react';
import { AudioUploader } from '@/components/review/AudioUploader';
import { ReviewReport } from '@/components/review/ReviewReport';
import { useReviewStore } from '@/stores/review-store';
import { Button } from '@/components/ui/Button';
import styles from '@/components/review/Review.module.css';

export default function ReviewPage() {
  const { loadFromStorage, clearStorage } = useReviewStore();

  useEffect(() => { loadFromStorage(); }, [loadFromStorage]);

  return (
    <div className={styles.page}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h1 className={styles.heading}>📊 面试复盘</h1>
        <Button variant="ghost" size="sm" onClick={clearStorage}>🔄 刷新</Button>
      </div>
      <AudioUploader />
      <ReviewReport />
    </div>
  );
}
