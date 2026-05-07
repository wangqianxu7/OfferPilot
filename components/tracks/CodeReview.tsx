import type { CodeReviewResult } from '@/shared/types';
import styles from './Track.module.css';

export function CodeReview({ review }: { review: CodeReviewResult }) {
  return (
    <div className={styles.reviewPanel}>
      <div className={styles.reviewScore}>评分：{review.score}/10</div>

      <div className={styles.reviewSection}>
        <div className={styles.reviewLabel}>逻辑正确性</div>
        <div className={styles.reviewText}>{review.correctness}</div>
      </div>

      <div className={styles.reviewSection}>
        <div className={styles.reviewLabel}>复杂度分析</div>
        <div className={styles.reviewText}>{review.complexity}</div>
      </div>

      {review.style.length > 0 && (
        <div className={styles.reviewSection}>
          <div className={styles.reviewLabel}>代码风格</div>
          {review.style.map((s, i) => (
            <div key={i} className={styles.reviewText}>• {s}</div>
          ))}
        </div>
      )}

      {review.improvements.length > 0 && (
        <div className={styles.reviewSection}>
          <div className={styles.reviewLabel}>改进建议</div>
          {review.improvements.map((imp, i) => (
            <div key={i} className={styles.improvementItem}>
              <div className={styles.improvementLine}>第{imp.line}行</div>
              <div>⚠️ {imp.issue}</div>
              <div>💡 {imp.suggestion}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
