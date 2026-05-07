'use client';
import dynamic from 'next/dynamic';
import { useState } from 'react';

const MonacoEditor = dynamic(() => import('@monaco-editor/react'), { ssr: false });

interface CodeEditorProps {
  value: string;
  onChange: (value: string) => void;
  language?: string;
  height?: string;
}

export function CodeEditor({ value, onChange, language = 'python', height = '100%' }: CodeEditorProps) {
  const [mounted, setMounted] = useState(false);

  return (
    <div style={{ flex: 1, minHeight: 0 }}>
      {!mounted && (
        <div
          style={{ height, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}
          ref={el => { if (el) setMounted(true); }}
        >
          加载编辑器中...
        </div>
      )}
      <MonacoEditor
        language={language}
        value={value}
        onChange={v => onChange(v || '')}
        theme="vs"
        height={height}
        loading={<div style={{ padding: '1rem', color: 'var(--text-muted)' }}>加载编辑器...</div>}
        options={{
          minimap: { enabled: false },
          fontSize: 14,
          lineNumbers: 'on',
          scrollBeyondLastLine: false,
          automaticLayout: true,
          tabSize: 4,
          wordWrap: 'on',
          padding: { top: 12, bottom: 12 },
        }}
      />
    </div>
  );
}
