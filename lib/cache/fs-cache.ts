import fs from 'fs';
import path from 'path';
import type { CacheIndex, CachedResume, CachedSession } from '@/shared/types';
import { CACHE_DIR, RESUMES_DIR, PARSED_DIR, HISTORY_DIR, ANSWERS_DIR, INDEX_FILE } from './cache-types';

function ensureDirs() {
  [CACHE_DIR, RESUMES_DIR, PARSED_DIR, HISTORY_DIR, ANSWERS_DIR].forEach(dir => {
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  });
}

function readIndex(): CacheIndex {
  ensureDirs();
  if (!fs.existsSync(INDEX_FILE)) {
    const empty: CacheIndex = { resumes: [], sessions: [] };
    fs.writeFileSync(INDEX_FILE, JSON.stringify(empty, null, 2));
    return empty;
  }
  return JSON.parse(fs.readFileSync(INDEX_FILE, 'utf-8'));
}

function writeIndex(index: CacheIndex) {
  ensureDirs();
  fs.writeFileSync(INDEX_FILE, JSON.stringify(index, null, 2));
}

export function listArchives(): CacheIndex {
  return readIndex();
}

export function loadArchive(id: string): { resume: CachedResume | null; sessions: CachedSession[] } {
  const parsedFile = path.join(PARSED_DIR, `${id}.json`);
  const resume = fs.existsSync(parsedFile)
    ? JSON.parse(fs.readFileSync(parsedFile, 'utf-8'))
    : null;

  const sessions: CachedSession[] = [];
  if (fs.existsSync(HISTORY_DIR)) {
    fs.readdirSync(HISTORY_DIR).forEach(f => {
      if (f.endsWith('.json')) {
        try {
          const session = JSON.parse(fs.readFileSync(path.join(HISTORY_DIR, f), 'utf-8'));
          if (session.resumeId === id || resume) sessions.push(session);
        } catch {}
      }
    });
  }

  return { resume, sessions };
}

export function saveResumeJson(id: string, data: CachedResume) {
  ensureDirs();
  fs.writeFileSync(path.join(PARSED_DIR, `${id}.json`), JSON.stringify(data, null, 2));

  const index = readIndex();
  const existing = index.resumes.find(r => r.id === id);
  if (existing) {
    existing.fileName = data.fileName;
  } else {
    index.resumes.push({ id, fileName: data.fileName, createdAt: data.createdAt });
  }
  writeIndex(index);
}

export function saveSession(session: CachedSession) {
  ensureDirs();
  const dateStr = new Date(session.date).toISOString().slice(0, 10).replace(/-/g, '');
  const filePath = path.join(HISTORY_DIR, `${dateStr}_${session.track}_${session.id.slice(0, 8)}.json`);
  fs.writeFileSync(filePath, JSON.stringify(session, null, 2));

  const index = readIndex();
  index.sessions.push({ id: session.id, track: session.track, date: session.date });
  writeIndex(index);
}

export function saveAnswer(dateStr: string, question: string, code: string) {
  ensureDirs();
  const safeQuestion = question.slice(0, 50).replace(/[^a-zA-Z\u4e00-\u9fa5]/g, '_');
  const filePath = path.join(ANSWERS_DIR, `${dateStr}_${safeQuestion}.py`);
  fs.writeFileSync(filePath, code);
  return filePath;
}
