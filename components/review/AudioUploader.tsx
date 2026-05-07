'use client';
import { useState } from 'react';
import { FileUpload } from '@/components/ui/FileUpload';
import { useReviewStore } from '@/stores/review-store';
import styles from './Review.module.css';

export function AudioUploader() {
  const [step, setStep] = useState<'idle' | 'transcribing' | 'analyzing' | 'done'>('idle');
  const { setCurrentReport, setLoading } = useReviewStore();

  const handleFile = async (file: File) => {
    setStep('transcribing');
    setLoading(true);
    const formData = new FormData();
    formData.append('audio', file);

    try {
      const transRes = await fetch('/api/review/transcribe', { method: 'POST', body: formData });
      if (!transRes.ok) throw new Error('Transcribe failed');
      const { transcript } = await transRes.json();

      setStep('analyzing');
      const anaRes = await fetch('/api/review/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ transcript }),
      });
      if (!anaRes.ok) throw new Error('Analyze failed');
      const analysis = await anaRes.json();

      const report = {
        id: crypto.randomUUID(),
        audioUrl: URL.createObjectURL(file),
        transcript,
        analysis,
        createdAt: new Date().toISOString(),
      };
      setCurrentReport(report);
      setStep('done');
    } catch (e) {
      setStep('idle');
      alert('分析失败，请重试');
    }
    setLoading(false);
  };

  return (
    <div className={styles.uploadSection}>
      <FileUpload accept="audio/*" label="上传面试录音 (mp3/wav/m4a)" onFile={handleFile} />
      {step === 'transcribing' && <p className={styles.status}>🎙️ 语音转文字中...</p>}
      {step === 'analyzing' && <p className={styles.status}>📊 AI分析中...</p>}
    </div>
  );
}
