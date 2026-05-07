'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import { useTrackStore } from '@/stores/track-store';
import { Button } from '@/components/ui/Button';
import type { BasicsTopic, TrackMessage } from '@/shared/types';
import styles from './Track.module.css';

const TOPICS: { value: BasicsTopic; label: string }[] = [
  { value: 'post-training', label: '后训练' },
  { value: 'multimodal', label: '多模态' },
  { value: 'rag', label: 'RAG' },
  { value: 'agent', label: 'Agent' },
];

export function BasicsChat() {
  const { messages, isStreaming, activeTopic, addMessage, setTopic, setStreaming } = useTrackStore();
  const [input, setInput] = useState('');
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const handleTopicChange = (topic: BasicsTopic) => {
    setTopic(topic);
    useTrackStore.setState({ messages: [] });
  };

  const startNewQuestion = useCallback(async () => {
    if (!activeTopic) return;
    setStreaming(true);

    const history = messages
      .filter(m => m.role === 'interviewer' && m.content)
      .map(m => ({ question: m.content, answer: '' }));

    const res = await fetch('/api/tracks/basics', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'question', topic: activeTopic, history }),
    });
    const { question } = await res.json();

    const msg: TrackMessage = {
      id: crypto.randomUUID(), sessionId: '',
      track: 'basics', role: 'interviewer',
      content: question, topic: activeTopic,
      timestamp: new Date().toISOString(),
    };
    addMessage(msg);
    setStreaming(false);
  }, [activeTopic, messages, addMessage, setStreaming]);

  const submitAnswer = useCallback(async () => {
    if (!input.trim() || !activeTopic) return;
    const lastQuestion = [...messages].reverse().find(m => m.role === 'interviewer');
    if (!lastQuestion) return;

    setStreaming(true);
    const candidateMsg: TrackMessage = {
      id: crypto.randomUUID(), sessionId: '',
      track: 'basics', role: 'candidate',
      content: input.trim(), topic: activeTopic,
      timestamp: new Date().toISOString(),
    };
    addMessage(candidateMsg);
    setInput('');

    try {
      const fbRes = await fetch('/api/tracks/basics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'judge', topic: activeTopic, question: lastQuestion.content, answer: candidateMsg.content }),
      });
      if (fbRes.ok) {
        const feedback = await fbRes.json();
        useTrackStore.getState().setFeedback(candidateMsg.id, {
          score: feedback.score,
          strengths: [feedback.comment],
          improvements: [],
        });
        addMessage({
          id: crypto.randomUUID(), sessionId: '',
          track: 'basics', role: 'interviewer',
          content: `📝 参考答案：\n${feedback.referenceAnswer}`,
          topic: activeTopic, timestamp: new Date().toISOString(),
        });
      }
    } catch {}
    setStreaming(false);
  }, [input, activeTopic, messages, addMessage, setStreaming]);

  if (!activeTopic) {
    return (
      <div className={styles.trackPage}>
        <div className={styles.trackHeader}>
          <span className={styles.trackTitle}>📚 大模型八股</span>
          <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>请先选择专题</span>
        </div>
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>📚</span>
          <span className={styles.emptyText}>选择一个专题开始练习</span>
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
            {TOPICS.map(t => (
              <Button key={t.value} variant="ghost" size="sm" onClick={() => handleTopicChange(t.value)}>
                {t.label}
              </Button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.trackPage}>
      <div className={styles.trackHeader}>
        <span className={styles.trackTitle}>📚 大模型八股</span>
        <select
          className={styles.topicSelect}
          value={activeTopic}
          onChange={e => handleTopicChange(e.target.value as BasicsTopic)}
        >
          {TOPICS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
        </select>
        <div style={{ flex: 1 }} />
        <Button size="sm" onClick={startNewQuestion} disabled={isStreaming}>
          {messages.length === 0 ? '开始出题' : '下一题'}
        </Button>
      </div>

      <div className={styles.chatArea}>
        {messages.length === 0 && (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>📝</span>
            <span className={styles.emptyText}>点击「开始出题」进入练习</span>
          </div>
        )}
        {messages.map(m => (
          <div key={m.id} className={styles.messageRow}>
            {m.role === 'interviewer' ? (
              <div className={styles.interviewerMsg}>{m.content}</div>
            ) : (
              <>
                <div className={styles.candidateMsg}>{m.content}</div>
                {m.feedback && (
                  <div style={{ fontSize: '0.78rem', color: 'var(--accent)', padding: '0 0.5rem' }}>
                    评分：{'⭐'.repeat(Math.min(m.feedback.score, 10))} ({m.feedback.score}/10)
                  </div>
                )}
              </>
            )}
          </div>
        ))}
        {isStreaming && <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)', fontStyle: 'italic' }}>AI生成中...</div>}
        <div ref={bottomRef} />
      </div>

      <div style={{ padding: '0.75rem 1.5rem', borderTop: 'var(--border-width) solid var(--border)', background: 'var(--bg-glass)', display: 'flex', gap: '0.5rem' }}>
        <textarea
          style={{ flex: 1, padding: '0.5rem 0.75rem', border: 'var(--border-width) solid var(--border)', borderRadius: 'var(--radius-sm)', background: 'var(--bg-card)', color: 'var(--text)', fontFamily: 'var(--font-ui)', fontSize: '0.88rem', resize: 'none' }}
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); submitAnswer(); } }}
          placeholder="输入你的回答... (Enter发送)"
          rows={2}
          disabled={isStreaming || messages.length === 0}
        />
        <Button onClick={submitAnswer} disabled={isStreaming || !input.trim()}>发送</Button>
      </div>
    </div>
  );
}
