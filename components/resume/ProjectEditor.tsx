'use client';
import { Textarea } from '@/components/ui/Textarea';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useCandidateStore } from '@/stores/candidate-store';
import styles from './ProjectEditor.module.css';
import { useState } from 'react';

export function ProjectEditor() {
  const { candidate, projects, addProject } = useCandidateStore();
  const [edited, setEdited] = useState<Record<string, string>>({});

  if (!candidate?.resumeParsed) return null;

  const handleSave = (name: string) => {
    const content = edited[name];
    if (!content?.trim()) return;
    addProject({
      id: crypto.randomUUID(),
      candidateId: candidate.id,
      name,
      content,
      keyDecisions: [],
      painPoints: [],
      createdAt: new Date().toISOString(),
    });
  };

  const isDirty = (name: string) => !!edited[name]?.trim();
  const isSaved = (name: string) => projects.some(p => p.name === name);

  return (
    <Card>
      <h2 className={styles.heading}>📝 项目详情</h2>
      <p className={styles.hint}>
        补充项目细节，AI面试官会基于这些来追问。包括：技术决策的考量、遇到的难点和解决方案、用到的具体库/参数等。
      </p>
      {candidate.resumeParsed.projects.map(proj => (
        <div key={proj.name} className={styles.projectBlock}>
          <h3>{proj.name}</h3>
          <Textarea
            value={edited[proj.name] ?? ''}
            onChange={e => setEdited(prev => ({ ...prev, [proj.name]: e.target.value }))}
            placeholder="描述项目细节：架构选择、技术决策、踩过的坑..."
          />
          <div className={styles.actions}>
            {isSaved(proj.name) && <span className={styles.saved}>✓ 已保存</span>}
            {isDirty(proj.name) && !isSaved(proj.name) && (
              <Button size="sm" onClick={() => handleSave(proj.name)}>保存</Button>
            )}
          </div>
        </div>
      ))}
    </Card>
  );
}
