'use client';
import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/Button';
import styles from './InputArea.module.css';

interface InputAreaProps {
  onSend: (text: string) => void;
  disabled?: boolean;
}

export function InputArea({ onSend, disabled }: InputAreaProps) {
  const [text, setText] = useState('');
  const [recording, setRecording] = useState(false);
  const recognitionRef = useRef<any>(null);

  const startRecording = useCallback(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('你的浏览器不支持语音识别，请用Chrome打开');
      return;
    }
    const recognition = new SpeechRecognition();
    recognition.lang = 'zh-CN';
    recognition.interimResults = false;
    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setText(prev => prev + transcript);
    };
    recognition.onend = () => setRecording(false);
    recognition.onerror = () => setRecording(false);
    recognition.start();
    setRecording(true);
    recognitionRef.current = recognition;
  }, []);

  const stopRecording = () => {
    recognitionRef.current?.stop();
    setRecording(false);
  };

  const handleSend = () => {
    if (!text.trim() || disabled) return;
    onSend(text.trim());
    setText('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className={styles.bar}>
      <textarea
        className={styles.input}
        value={text}
        onChange={e => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder="输入你的回答... (Enter发送, Shift+Enter换行)"
        rows={2}
        disabled={disabled}
      />
      <div className={styles.buttons}>
        <Button
          variant="ghost"
          size="sm"
          onClick={recording ? stopRecording : startRecording}
          disabled={disabled}
        >
          {recording ? '🔴 停止' : '🎤'}
        </Button>
        <Button onClick={handleSend} disabled={disabled || !text.trim()}>
          发送
        </Button>
      </div>
    </div>
  );
}
