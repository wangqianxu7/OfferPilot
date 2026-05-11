'use client';
import { useState, useCallback, useEffect } from 'react';
import { Button } from '@/components/ui/Button';
import { loadCache, saveCache, clearCache } from '@/lib/client/storage';
import type { CodeReviewResult } from '@/shared/types';
import styles from './Track.module.css';

interface LeetCodeCache {
  question: any;
  code: string;
  review: CodeReviewResult | null;
}

export function LeetCodePanel() {
  const [question, setQuestion] = useState<any>(() => {
    const cached = loadCache<LeetCodeCache>('leetcode');
    return cached?.question ?? null;
  });
  const [code, setCode] = useState<string>(() => {
    const cached = loadCache<LeetCodeCache>('leetcode');
    return cached?.code ?? '';
  });
  const [review, setReview] = useState<CodeReviewResult | null>(() => {
    const cached = loadCache<LeetCodeCache>('leetcode');
    return cached?.review ?? null;
  });
  const [loading, setLoading] = useState(false);

  // Auto-save
  useEffect(() => {
    if (question || code) {
      saveCache('leetcode', { question, code, review });
    }
  }, [question, code, review]);

  const handleRefresh = () => {
    clearCache('leetcode');
    setQuestion(null);
    setCode('');
    setReview(null);
  };

  const generateQuestion = useCallback(async (difficulty: string = 'medium') => {
    setLoading(true);
    setReview(null);
    setCode('');

    const res = await fetch('/api/tracks/leetcode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'question', difficulty }),
    });
    if (res.ok) setQuestion(await res.json());
    setLoading(false);
  }, []);

  const submitCode = useCallback(async () => {
    if (!code.trim() || !question) return;
    setLoading(true);
    const res = await fetch('/api/tracks/leetcode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'review', question: question.description, code: code.trim() }),
    });
    if (res.ok) setReview(await res.json());
    setLoading(false);
  }, [code, question]);

  if (!question) {
    return (
      <div className={styles.trackPage}>
        <div className={styles.trackHeader}>
          <span className={styles.trackTitle}>⚙️ LeetCode算法</span>
        </div>
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>⚙️</span>
          <span className={styles.emptyText}>选择难度开始练习</span>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            <Button variant="ghost" size="sm" onClick={() => generateQuestion('easy')}>简单</Button>
            <Button size="sm" onClick={() => generateQuestion('medium')}>中等</Button>
            <Button variant="ghost" size="sm" onClick={() => generateQuestion('hard')} style={{ color: 'var(--danger)' }}>困难</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.trackPage}>
      <div className={styles.trackHeader}>
        <span className={styles.trackTitle}>⚙️ LeetCode算法</span>
        <div style={{ flex: 1 }} />
        <Button size="sm" variant="ghost" onClick={handleRefresh}>🔄 刷新</Button>
        <Button size="sm" variant="ghost" onClick={() => setQuestion(null)}>换一题</Button>
      </div>

      <div className={styles.lcPanel}>
        <div className={styles.lcQuestion}>
          <h2 className={styles.lcTitle}>{question.title}</h2>
          <p className={styles.lcDesc}>{question.description}</p>
          {question.leetcodeUrl && (
            <a className={styles.lcLink} href={question.leetcodeUrl} target="_blank" rel="noopener noreferrer">
              🔗 在 LeetCode 中打开 →
            </a>
          )}
          {question.hint && <div className={styles.lcHint}>💡 提示：{question.hint}</div>}
        </div>

        <textarea
          className={styles.codeInput}
          value={code}
          onChange={e => setCode(e.target.value)}
          placeholder="在这里粘贴你的代码..."
          rows={10}
        />

        <Button onClick={submitCode} disabled={loading || !code.trim()}>
          {loading ? '评判中...' : '提交AI评判'}
        </Button>

        {review && (
          <div style={{ marginTop: '1rem' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '1rem', marginBottom: '0.5rem' }}>📋 审查结果</h3>
            <div style={{ fontSize: '0.85rem', padding: '0.75rem', background: 'var(--bg-card)', borderRadius: 'var(--radius-md)', border: 'var(--border-width) solid var(--border)' }}>
              <p><strong>评分：</strong>{'⭐'.repeat(Math.min(review.score, 10))} ({review.score}/10)</p>
              <p><strong>正确性：</strong>{review.correctness}</p>
              <p><strong>复杂度：</strong>{review.complexity}</p>
              {review.improvements.map((imp: any, i: number) => (
                <p key={i} style={{ fontSize: '0.78rem', color: 'var(--warning)' }}>⚠️ 第{imp.line}行：{imp.issue} → {imp.suggestion}</p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
