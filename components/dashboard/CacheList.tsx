'use client';
import { useEffect, useState } from 'react';
import type { CacheIndex } from '@/shared/types';
import styles from './Dashboard.module.css';

interface CacheListProps {
  onSelect: (id: string) => void;
}

export function CacheList({ onSelect }: CacheListProps) {
  const [index, setIndex] = useState<CacheIndex | null>(null);

  useEffect(() => {
    fetch('/api/cache/list')
      .then(r => r.json())
      .then(setIndex)
      .catch(() => {});
  }, []);

  if (!index || index.resumes.length === 0) {
    return (
      <>
        <h2 className={styles.sectionTitle}>📊 训练档案</h2>
        <p className={styles.archiveEmpty}>暂无档案 · 上传简历后自动缓存</p>
      </>
    );
  }

  return (
    <>
      <h2 className={styles.sectionTitle}>📊 训练档案</h2>
      <div className={styles.archiveList}>
        {index.resumes.map(r => (
          <div key={r.id} className={styles.archiveCard} onClick={() => onSelect(r.id)}>
            <div className={styles.archiveName}>📄 {r.fileName}</div>
            <div className={styles.archiveDate}>{r.createdAt.slice(0, 10)}</div>
          </div>
        ))}
      </div>
    </>
  );
}
