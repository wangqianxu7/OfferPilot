'use client';
import { useRef, useState } from 'react';
import styles from './FileUpload.module.css';

interface FileUploadProps {
  accept: string;
  label: string;
  onFile: (file: File) => void;
}

export function FileUpload({ accept, label, onFile }: FileUploadProps) {
  const [fileName, setFileName] = useState<string | null>(null);
  const ref = useRef<HTMLInputElement>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    onFile(file);
  };

  return (
    <div
      className={styles.wrap}
      role="button"
      tabIndex={0}
      onClick={() => ref.current?.click()}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          ref.current?.click();
        }
      }}
    >
      <input ref={ref} type="file" accept={accept} className={styles.input} onChange={handleChange} />
      <div className={styles.icon}>📎</div>
      <span className={styles.label}>{fileName || label}</span>
    </div>
  );
}
