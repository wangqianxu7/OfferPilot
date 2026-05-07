'use client';
import { useState, useCallback } from 'react';
import { CodeEditor } from '@/components/tracks/CodeEditor';
import { CodeReview } from '@/components/tracks/CodeReview';
import { Button } from '@/components/ui/Button';
import type { BasicsTopic, CodeReviewResult } from '@/shared/types';
import styles from '@/components/tracks/Track.module.css';

const TOPICS: { value: BasicsTopic; label: string }[] = [
  { value: 'post-training', label: '后训练' },
  { value: 'multimodal', label: '多模态' },
  { value: 'rag', label: 'RAG' },
  { value: 'agent', label: 'Agent' },
];

export default function TorchCodePage() {
  const [topic, setTopic] = useState<BasicsTopic>('post-training');
  const [question, setQuestion] = useState('');
  const [code, setCode] = useState('# 在这里编写你的PyTorch代码...\n');
  const [review, setReview] = useState<CodeReviewResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [pastQuestions, setPastQuestions] = useState<{ question: string }[]>([]);

  const generateQuestion = useCallback(async () => {
    setLoading(true);
    setReview(null);
    setCode('# 在这里编写你的PyTorch代码...\n');

    const res = await fetch('/api/tracks/torchcode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'question', topic, history: pastQuestions }),
    });
    if (res.ok) {
      const data = await res.json();
      setQuestion(data.question);
      setPastQuestions(prev => [...prev, { question: data.question }]);
    }
    setLoading(false);
  }, [topic, pastQuestions]);

  const submitCode = useCallback(async () => {
    if (!code.trim() || !question) return;
    setLoading(true);
    const res = await fetch('/api/tracks/torchcode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'review', question, code }),
    });
    if (res.ok) {
      const data = await res.json();
      setReview(data);

      fetch('/api/cache/save-answer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: new Date().toISOString().slice(0, 10),
          question: question.slice(0, 50),
          code,
        }),
      });
    }
    setLoading(false);
  }, [code, question]);

  return (
    <div className={styles.trackPage}>
      <div className={styles.trackHeader}>
        <span className={styles.trackTitle}>🔥 手撕代码</span>
        <select className={styles.topicSelect} value={topic} onChange={e => setTopic(e.target.value as BasicsTopic)}>
          {TOPICS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <div style={{ flex: 1 }} />
        <Button size="sm" onClick={generateQuestion} disabled={loading}>{question ? '换一题' : '开始出题'}</Button>
      </div>

      {!question ? (
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>🔥</span>
          <span className={styles.emptyText}>选择专题，开始手撕代码</span>
        </div>
      ) : (
        <div className={styles.splitLayout}>
          <div className={styles.questionPanel}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>题目要求</h3>
            <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.82rem', lineHeight: 1.7, fontFamily: 'var(--font-ui)' }}>
              {question}
            </pre>
          </div>

          <div className={styles.editorPanel}>
            <div className={styles.editorToolbar}>
              <span className={styles.editorLang}>Python</span>
              <Button size="sm" onClick={submitCode} disabled={loading || !code.trim()}>
                {loading ? '审查中...' : '提交审查'}
              </Button>
            </div>
            <CodeEditor value={code} onChange={setCode} />
            {review && <CodeReview review={review} />}
          </div>
        </div>
      )}
    </div>
  );
}
