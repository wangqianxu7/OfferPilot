'use client';
import { useReviewStore } from '@/stores/review-store';
import styles from './Review.module.css';

export function ReviewReport() {
  const { currentReport } = useReviewStore();
  if (!currentReport?.analysis) return null;

  const analysis = currentReport.analysis;

  return (
    <div className={styles.reportCard}>
      <div className={styles.overallScore}>{analysis.overallScore} / 10</div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>语速分析</div>
        <div className={styles.sectionBody}>{analysis.pace}</div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>口头禅 / 填充词</div>
        <div>
          {analysis.fillerWords.map((w: string, i: number) => (
            <span key={i} className={styles.fillerChip}>{w}</span>
          ))}
        </div>
      </div>

      <div className={styles.section}>
        <div className={styles.sectionTitle}>弱项识别</div>
        {analysis.weakPoints.map((wp: any, i: number) => (
          <div key={i} className={styles.weakPoint}>
            <div className={styles.weakQuestion}>❓ {wp.question}</div>
            <div className={styles.weakIssue}>⚠️ {wp.issue}</div>
            <div className={styles.weakSuggestion}>💡 {wp.suggestion}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
