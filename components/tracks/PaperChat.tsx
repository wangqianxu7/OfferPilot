'use client';
import { useState, useCallback, useRef, useEffect } from 'react';
import { useTrackStore } from '@/stores/track-store';
import { useTrackBookmarkStore } from '@/stores/track-bookmark-store';
import { Button } from '@/components/ui/Button';
import { FileUpload } from '@/components/ui/FileUpload';
import { saveCache, clearCache } from '@/lib/client/storage';
import type { TrackMessage, TrackBookmark, CachedPaper } from '@/shared/types';
import styles from './Track.module.css';

interface PaperInfo {
  title: string;
  abstract: string;
  keyTechniques: string[];
  sectionSummary: string;
  paperText: string;
}

export function PaperChat() {
  const { messages, isStreaming, addMessage, setStreaming, resetTrack } = useTrackStore();
  const { init: initBookmarks, addBookmark, bookmarkedUserMsgIds } = useTrackBookmarkStore();
  const [input, setInput] = useState('');
  const [refLoadingId, setRefLoadingId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [paperData, setPaperData] = useState<CachedPaper | null>(null);
  const [cachedPapers, setCachedPapers] = useState<{ id: string; title: string; fileName: string; createdAt: string }[]>([]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => { initBookmarks(); }, [initBookmarks]);

  // Load cached papers on mount
  useEffect(() => {
    fetch('/api/tracks/paper', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'papers' }),
    })
      .then(r => r.json())
      .then(d => { if (d.papers) setCachedPapers(d.papers); })
      .catch(() => {});
  }, []);

  // Auto-save
  useEffect(() => {
    if (paperData && messages.length > 0) {
      saveCache('paper', { paperData, messages });
    }
  }, [paperData, messages]);

  const handleRefresh = () => {
    clearCache('paper');
    resetTrack();
    setPaperData(null);
  };

  const handleFileUpload = async (file: File) => {
    setLoading(true);
    try {
      // Extract text client-side via server API
      const formData = new FormData();
      formData.append('file', file);

      const extractRes = await fetch('/api/resume/parse', { method: 'POST', body: formData });
      if (!extractRes.ok) throw new Error('PDF extraction failed');
      const { resumeText } = await extractRes.json();

      const parseRes = await fetch('/api/tracks/paper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'parse', pdfText: resumeText, fileName: file.name }),
      });
      if (!parseRes.ok) throw new Error('Paper parse failed');
      const parsed = await parseRes.json();
      setPaperData(parsed);

      // Refresh cached papers list
      setCachedPapers(prev => {
        const filtered = prev.filter(p => p.id !== parsed.id);
        return [{ id: parsed.id, title: parsed.title, fileName: parsed.fileName, createdAt: parsed.createdAt }, ...filtered];
      });
    } catch (e) {
      console.error('论文解析失败:', e);
      alert('论文解析失败，请确认PDF可读后重试');
    }
    setLoading(false);
  };

  const loadCachedPaper = async (id: string) => {
    setLoading(true);
    try {
      const res = await fetch('/api/tracks/paper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'papers' }),
      });
      const { papers } = await res.json();
      // Papers list only has metadata, need to check if we have the full data
      // For now, the full paper data is only in file cache, accessible via a different mechanism
      // Simple approach: just reload from the parsed list
    } catch {}
    setLoading(false);
  };

  const getPaperInfo = (): PaperInfo => {
    if (!paperData) return { title: '', abstract: '', keyTechniques: [], sectionSummary: '', paperText: '' };
    return {
      title: paperData.title,
      abstract: paperData.abstract,
      keyTechniques: paperData.keyTechniques,
      sectionSummary: paperData.sectionSummary,
      paperText: paperData.paperText,
    };
  };

  const startNewQuestion = useCallback(async () => {
    if (!paperData) return;
    setStreaming(true);
    const paperInfo = getPaperInfo();

    try {
      const history = messages
        .filter(m => m.role === 'interviewer' && m.content && !m.content.startsWith('📝'))
        .map(m => ({ question: m.content, answer: '' }));

      const res = await fetch('/api/tracks/paper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'question', paperInfo, history }),
      });
      if (!res.ok) throw new Error(`API error: ${res.status}`);
      const { question } = await res.json();
      if (!question) throw new Error('Empty question');

      const msg: TrackMessage = {
        id: crypto.randomUUID(), sessionId: '',
        track: 'paper', role: 'interviewer',
        content: question,
        timestamp: new Date().toISOString(),
      };
      addMessage(msg);
    } catch (e) {
      console.error('出题失败:', e);
      addMessage({
        id: crypto.randomUUID(), sessionId: '',
        track: 'paper', role: 'interviewer',
        content: '出题失败，请稍后重试',
        timestamp: new Date().toISOString(),
      });
    }
    setStreaming(false);
  }, [paperData, messages, addMessage, setStreaming]);

  const fetchReference = useCallback(async (questionMsg: TrackMessage) => {
    if (!paperData || refLoadingId) return;
    setRefLoadingId(questionMsg.id);
    const paperInfo = getPaperInfo();
    try {
      const res = await fetch('/api/tracks/paper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reference', paperInfo, question: questionMsg.content }),
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
  }, [paperData, refLoadingId]);

  const submitAnswer = useCallback(async () => {
    if (!input.trim() || !paperData) return;
    const lastQuestion = [...messages].reverse().find(m => m.role === 'interviewer');
    if (!lastQuestion) return;

    const paperInfo = getPaperInfo();
    setStreaming(true);

    const candidateMsg: TrackMessage = {
      id: crypto.randomUUID(), sessionId: '',
      track: 'paper', role: 'candidate',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };
    addMessage(candidateMsg);
    setInput('');

    try {
      const res = await fetch('/api/tracks/paper', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'judge', paperInfo, question: lastQuestion.content, answer: candidateMsg.content }),
      });
      if (res.ok) {
        const feedback = await res.json();
        useTrackStore.getState().setFeedback(candidateMsg.id, {
          score: feedback.score,
          strengths: [feedback.comment],
          improvements: [],
        });
        addMessage({
          id: crypto.randomUUID(), sessionId: '',
          track: 'paper', role: 'interviewer',
          content: `📝 参考答案：\n${feedback.referenceAnswer}`,
          timestamp: new Date().toISOString(),
        });
      }
    } catch {}
    setStreaming(false);
  }, [input, paperData, messages, addMessage, setStreaming]);

  const handleBookmark = useCallback((candidateMsg: TrackMessage) => {
    const candidateIdx = messages.indexOf(candidateMsg);
    const question = [...messages].slice(0, candidateIdx).findLast(m => m.role === 'interviewer' && !m.content.startsWith('📝'));
    if (!question) return;

    const bookmark: TrackBookmark = {
      id: candidateMsg.id,
      track: 'paper',
      question: question.content,
      referenceAnswer: question.referenceAnswer,
      createdAt: new Date().toISOString(),
    };
    addBookmark(bookmark);
  }, [messages, addBookmark]);

  // No paper loaded — show upload + cached papers
  if (!paperData) {
    return (
      <div className={styles.trackPage}>
        <div className={styles.trackHeader}>
          <span className={styles.trackTitle}>📄 论文精读</span>
        </div>
        <div className={styles.emptyState}>
          <span className={styles.emptyIcon}>📄</span>
          <span className={styles.emptyText}>上传论文PDF，AI帮你出题考察核心技术</span>
          <div style={{ marginTop: '1rem' }}>
            <FileUpload accept=".pdf" label="上传论文PDF (pdf)" onFile={handleFileUpload} />
          </div>
          {loading && <p style={{ marginTop: '0.5rem', fontSize: '0.82rem', color: 'var(--text-muted)' }}>📖 正在解析论文...</p>}
        </div>

        {cachedPapers.length > 0 && (
          <div style={{ marginTop: '2rem', padding: '0 1.5rem' }}>
            <h3 style={{ fontFamily: 'var(--font-serif)', fontSize: '0.95rem', marginBottom: '0.75rem', color: 'var(--text-light)' }}>
              📁 已缓存的论文
            </h3>
            {cachedPapers.map(p => (
              <div
                key={p.id}
                style={{
                  padding: '0.6rem 0.75rem',
                  marginBottom: '0.4rem',
                  background: 'var(--bg-card)',
                  border: 'var(--border-width) solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                }}
                onClick={() => loadCachedPaper(p.id)}
              >
                <div style={{ fontWeight: 500 }}>{p.title}</div>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '0.15rem' }}>
                  {p.fileName} · {new Date(p.createdAt).toLocaleDateString('zh-CN')}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // Paper loaded — show Q&A interface
  return (
    <div className={styles.trackPage}>
      <div className={styles.trackHeader}>
        <span className={styles.trackTitle}>📄 {paperData.title}</span>
        <div style={{ flex: 1 }} />
        <Button variant="ghost" size="sm" onClick={handleRefresh}>🔄 刷新</Button>
        <Button size="sm" onClick={startNewQuestion} disabled={isStreaming}>
          {messages.length === 0 ? '开始提问' : '下一题'}
        </Button>
      </div>

      {/* Paper summary bar */}
      <div style={{
        padding: '0.6rem 1.5rem',
        fontSize: '0.78rem',
        color: 'var(--text-muted)',
        borderBottom: 'var(--border-width) solid var(--border)',
        background: 'var(--bg-glass)',
        display: 'flex',
        gap: '1rem',
        flexWrap: 'wrap',
      }}>
        <span>📝 {paperData.authors || '未知作者'}</span>
        <span>🔑 {paperData.keyTechniques.slice(0, 3).join(' / ')}</span>
      </div>

      <div className={styles.chatArea}>
        {messages.length === 0 && (
          <div className={styles.emptyState}>
            <span className={styles.emptyIcon}>📝</span>
            <span className={styles.emptyText}>点击「开始提问」让AI出题</span>
            {paperData.abstract && (
              <div style={{ marginTop: '1rem', maxWidth: '480px', fontSize: '0.82rem', color: 'var(--text-light)', lineHeight: 1.7, textAlign: 'left' }}>
                <strong>摘要：</strong>{paperData.abstract}
              </div>
            )}
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
