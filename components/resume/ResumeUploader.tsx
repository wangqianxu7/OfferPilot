'use client';
import { useState } from 'react';
import { FileUpload } from '@/components/ui/FileUpload';
import { Card } from '@/components/ui/Card';
import { useCandidateStore } from '@/stores/candidate-store';
import styles from './ResumeUploader.module.css';

export function ResumeUploader() {
  const [parsing, setParsing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { candidate, setCandidate, setResumeParsed } = useCandidateStore();

  const handleFile = async (file: File) => {
    setParsing(true);
    setError(null);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await fetch('/api/resume/parse', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || '解析失败，请重试');
        setParsing(false);
        return;
      }
      setCandidate({
        id: crypto.randomUUID(),
        name: data.parsed?.education || '候选人',
        resumeText: data.resumeText,
        resumeParsed: data.parsed,
        createdAt: new Date().toISOString(),
      });
    } catch {
      setError('网络错误，请检查服务是否正常运行');
    }
    setParsing(false);
  };

  const parsed = candidate?.resumeParsed;

  return (
    <Card className={styles.card}>
      <h2 className={styles.heading}>📋 上传简历</h2>
      <FileUpload accept=".pdf" label="点击上传PDF简历" onFile={handleFile} />
      {parsing && <p className={styles.status}>解析中...</p>}
      {error && <p className={styles.error}>{error}</p>}
      {parsed && (
        <div className={styles.result}>
          <h3>解析结果</h3>
          <div className={styles.section}>
            <span className={styles.tag}>技能</span>
            {parsed.skills.map(s => <span key={s} className={styles.chip}>{s}</span>)}
          </div>
          <div className={styles.section}>
            <span className={styles.tag}>项目</span>
            {parsed.projects.map(p => (
              <div key={p.name} className={styles.projectItem}>
                <strong>{p.name}</strong>
                <span className={styles.desc}>{p.description}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
