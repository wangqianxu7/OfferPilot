'use client';
import { useCallback, useRef, useEffect } from 'react';
import { useInterviewStore } from '@/stores/interview-store';
import { useCandidateStore } from '@/stores/candidate-store';
import { InterviewerBubble } from './InterviewerBubble';
import { CandidateBubble } from './CandidateBubble';
import { FeedbackCard } from './FeedbackCard';
import { InputArea } from './InputArea';
import styles from './InterviewChat.module.css';

function persistMessages(storageKey: string) {
  const msgs = useInterviewStore.getState().messages;
  localStorage.setItem(storageKey, JSON.stringify(msgs));
}

export function InterviewChat() {
  const { messages, isStreaming, addMessage, setFeedback, setStreaming } = useInterviewStore();
  const { candidate, projects } = useCandidateStore();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  const sendMessage = useCallback(async (text: string) => {
    const msgId = crypto.randomUUID();
    const sessionId = useInterviewStore.getState().session?.id || '';
    const candidateMsg = {
      id: msgId, sessionId, role: 'candidate' as const,
      content: text, timestamp: new Date().toISOString(),
    };
    addMessage(candidateMsg);
    if (sessionId) persistMessages(`op_msgs_${sessionId}`);

    // Get last interviewer question for feedback
    const lastQuestion = [...messages].reverse().find(m => m.role === 'interviewer');
    if (lastQuestion) {
      setStreaming(true);
      try {
        const fbRes = await fetch('/api/interview/feedback', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ question: lastQuestion.content, answer: text }),
        });
        if (fbRes.ok) {
          const feedback = await fbRes.json();
          setFeedback(msgId, feedback);
        }
      } catch {}
    }

    // Get next interviewer response via streaming
    const history = [...messages, candidateMsg].map(m => ({
      role: m.role,
      content: m.content,
    }));

    try {
      const chatRes = await fetch('/api/interview/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          resumeText: candidate?.resumeText || '',
          projectDetails: projects.map(p => `## ${p.name}\n${p.content}`).join('\n\n'),
          history,
        }),
      });

      if (chatRes.ok && chatRes.body) {
        const reader = chatRes.body.getReader();
        const decoder = new TextDecoder();
        let content = '';
        const interviewerMsgId = crypto.randomUUID();
        addMessage({
          id: interviewerMsgId, sessionId,
          role: 'interviewer', content: '',
          timestamp: new Date().toISOString(),
        });

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          content += decoder.decode(value, { stream: true });
          useInterviewStore.setState((s) => ({
            messages: s.messages.map((m) =>
              m.id === interviewerMsgId ? { ...m, content } : m
            ),
          }));
        }
        // Persist after streaming completes
        if (sessionId) persistMessages(`op_msgs_${sessionId}`);
      }
    } catch {}
    setStreaming(false);
  }, [messages, candidate, projects, addMessage, setFeedback, setStreaming]);

  const handleBookmark = useCallback(async (msg: typeof messages[0]) => {
    const question = [...messages].reverse().find(m => m.role === 'interviewer');
    if (!question) return;
    await fetch('/api/bookmarks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        sessionId: useInterviewStore.getState().session?.id,
        question: question.content,
        userAnswer: msg.content,
      }),
    });
    alert('已收藏！');
  }, [messages]);

  if (!candidate) {
    return (
      <div className={styles.chatArea} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-muted)' }}>请先在首页上传简历</p>
      </div>
    );
  }

  return (
    <>
      <div className={styles.chatArea}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            <p style={{ fontFamily: 'var(--font-serif)', fontSize: '1.1rem', marginBottom: '0.5rem' }}>
              面试准备就绪
            </p>
            <p style={{ fontSize: '0.85rem' }}>
              点击下方输入框，面试官将开始提问
            </p>
          </div>
        )}
        {messages.map(m => (
          <div key={m.id}>
            {m.role === 'interviewer' ? (
              <InterviewerBubble message={m} />
            ) : (
              <CandidateBubble message={m} onBookmark={() => handleBookmark(m)} />
            )}
            {m.feedback && <FeedbackCard feedback={m.feedback} />}
          </div>
        ))}
        {isStreaming && <div className={styles.streamingHint}>面试官思考中...</div>}
        <div ref={bottomRef} />
      </div>
      <InputArea onSend={sendMessage} disabled={isStreaming} />
    </>
  );
}
