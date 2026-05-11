'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import { useTrackStore } from '@/stores/track-store';
import { useTrackBookmarkStore } from '@/stores/track-bookmark-store';
import { Button } from '@/components/ui/Button';
import { saveCache, clearCache } from '@/lib/client/storage';
import type { BasicsTopic, TrackMessage, TrackBookmark } from '@/shared/types';
import styles from './Track.module.css';

const TOPICS: { value: BasicsTopic; label: string }[] = [
  { value: 'post-training', label: '后训练' },
  { value: 'multimodal', label: '多模态' },
  { value: 'rag', label: 'RAG' },
  { value: 'agent', label: 'Agent' },
];

export function BasicsChat() {
  const { messages, isStreaming, activeTopic, addMessage, setTopic, setStreaming, resetTrack } = useTrackStore();
  const { init: initBookmarks, addBookmark, bookmarkedUserMsgIds } = useTrackBookmarkStore();
  const [input, setInput] = useState('');
  const [refLoadingId, setRefLoadingId] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { initBookmarks(); }, [initBookmarks]);

  // Auto-save on content change
  useEffect(() => {
    if (messages.length > 0 || activeTopic) {
      saveCache('basics', { topic: activeTopic, messages });
    }
  }, [messages, activeTopic]);

  const handleRefresh = () => {
    clearCache('basics');
    resetTrack();
  };

  const handleTopicChange = (topic: BasicsTopic) => {
    setTopic(topic);
    useTrackStore.setState({ messages: [] });
  };

  const startNewQuestion = useCallback(async () => {
    if (!activeTopic) return;
    setStreaming(true);

    try {
      const history = messages
        .filter(m => m.role === 'interviewer' && m.content)
        .map(m => ({ question: m.content, answer: '' }));

      const res = await fetch('/api/tracks/basics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'question', topic: activeTopic, history }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const { question } = await res.json();
      if (!question) throw new Error('Empty question');

      const msg: TrackMessage = {
        id: crypto.randomUUID(), sessionId: '',
        track: 'basics', role: 'interviewer',
        content: question, topic: activeTopic,
        timestamp: new Date().toISOString(),
      };
      addMessage(msg);
    } catch (e) {
      console.error('出题失败:', e);
      addMessage({
        id: crypto.randomUUID(), sessionId: '',
        track: 'basics', role: 'interviewer',
        content: '⚠️ 出题失败，请稍后重试',
        topic: activeTopic,
        timestamp: new Date().toISOString(),
      });
    }
    setStreaming(false);
  }, [activeTopic, messages, addMessage, setStreaming]);

  const fetchReference = useCallback(async (questionMsg: TrackMessage) => {
    if (!activeTopic || refLoadingId) return;
    setRefLoadingId(questionMsg.id);
    try {
      const res = await fetch('/api/tracks/basics', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'reference',
          topic: activeTopic,
          question: questionMsg.content,
        }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const { referenceAnswer } = await res.json();
      if (referenceAnswer) {
        useTrackStore.getState().setReferenceAnswer(questionMsg.id, referenceAnswer);
      }
    } catch (e) {
      console.error('获取参考答案失败:', e);
    }
    setRefLoadingId(null);
  }, [activeTopic, refLoadingId]);

  const handleBookmark = useCallback((candidateMsg: TrackMessage) => {
    const candidateIdx = messages.indexOf(candidateMsg);
    const question = [...messages].slice(0, candidateIdx).findLast(m => m.role === 'interviewer' && !m.content.startsWith('📝'));
    if (!question) return;

    const bookmark: TrackBookmark = {
      id: candidateMsg.id,
      track: 'basics',
      topic: activeTopic ?? undefined,
      question: question.content,
      referenceAnswer: question.referenceAnswer,
      createdAt: new Date().toISOString(),
    };
    addBookmark(bookmark);
  }, [messages, activeTopic, addBookmark]);

  const handleBookmarkQuestion = useCallback((questionMsg: TrackMessage) => {
    const bookmark: TrackBookmark = {
      id: questionMsg.id,
      track: 'basics',
      topic: activeTopic ?? undefined,
      question: questionMsg.content,
      referenceAnswer: questionMsg.referenceAnswer,
      createdAt: new Date().toISOString(),
    };
    addBookmark(bookmark);
  }, [activeTopic, addBookmark]);

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
        if (feedback.referenceAnswer) {
          useTrackStore.getState().setReferenceAnswer(lastQuestion.id, feedback.referenceAnswer);
        }
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
          <div style={{ flex: 1 }} />
          <Button variant="ghost" size="sm" onClick={handleRefresh}>🔄 刷新</Button>
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
        <Button variant="ghost" size="sm" onClick={handleRefresh}>🔄 刷新</Button>
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
              <>
                <div className={styles.interviewerMsg}>{m.content}</div>
                {!m.content.startsWith('📝') && (
                  m.referenceAnswer ? (
                    <div className={styles.referenceBox}>
                      <div className={styles.referenceLabel}>📝 参考答案</div>
                      <div>{m.referenceAnswer}</div>
                      <div className={styles.rowActions} style={{ marginTop: '0.4rem', padding: 0 }}>
                        <button
                          className={bookmarkedUserMsgIds.has(m.id) ? styles.bookmarkedBtn : styles.actionBtn}
                          onClick={() => handleBookmarkQuestion(m)}
                          disabled={bookmarkedUserMsgIds.has(m.id)}
                        >
                          {bookmarkedUserMsgIds.has(m.id) ? '✅ 已收藏' : '⭐ 收藏'}
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.rowActions}>
                      <button
                        className={styles.actionBtn}
                        onClick={() => fetchReference(m)}
                        disabled={refLoadingId === m.id}
                      >
                        {refLoadingId === m.id ? '加载中...' : '📝 参考答案'}
                      </button>
                    </div>
                  )
                )}
              </>
            ) : (
              <>
                <div className={styles.candidateMsg}>{m.content}</div>
                {m.feedback && (
                  <div className={styles.rowActions} style={{ alignItems: 'center' }}>
                    <span style={{ fontSize: '0.78rem', color: 'var(--accent)' }}>
                      评分：{'⭐'.repeat(Math.min(m.feedback.score, 10))} ({m.feedback.score}/10)
                    </span>
                    <button
                      className={bookmarkedUserMsgIds.has(m.id) ? styles.bookmarkedBtn : styles.actionBtn}
                      onClick={() => handleBookmark(m)}
                      disabled={bookmarkedUserMsgIds.has(m.id)}
                    >
                      {bookmarkedUserMsgIds.has(m.id) ? '✅ 已收藏' : '⭐ 收藏'}
                    </button>
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
