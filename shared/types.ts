export interface Candidate {
  id: string;
  name: string;
  resumeText: string;
  resumeParsed: ResumeParsed | null;
  createdAt: string;
}

export interface ResumeParsed {
  skills: string[];
  projects: ProjectSummary[];
  education: string;
}

export interface ProjectSummary {
  name: string;
  description: string;
  techStack: string[];
}

export interface ProjectDetail {
  id: string;
  candidateId: string;
  name: string;
  content: string;
  keyDecisions: string[];
  painPoints: string[];
  createdAt: string;
}

export interface InterviewSession {
  id: string;
  candidateId: string;
  status: 'active' | 'completed';
  startedAt: string;
  endedAt?: string;
}

export interface InterviewMessage {
  id: string;
  sessionId: string;
  role: 'interviewer' | 'candidate';
  content: string;
  voiceUrl?: string;
  feedback?: InterviewFeedback;
  timestamp: string;
}

export interface InterviewFeedback {
  score: number;
  strengths: string[];
  improvements: string[];
}

export interface Bookmark {
  id: string;
  sessionId: string;
  question: string;
  userAnswer: string;
  aiAnswer: string;
  aiAnswerVersion: number;
  upVotes: number;
  downVotes: number;
  userVote: 'up' | 'down' | null;
  createdAt: string;
}

export interface ReviewReport {
  id: string;
  sessionId?: string;
  audioUrl: string;
  transcript: string;
  analysis: ReviewAnalysis | null;
  createdAt: string;
}

export interface ReviewAnalysis {
  pace: string;
  fillerWords: string[];
  weakPoints: {
    question: string;
    issue: string;
    suggestion: string;
  }[];
  overallScore: number;
}

// ===== v0.2 赛道类型 =====

export type TrainingTrack =
  | 'basics'
  | 'leetcode'
  | 'torchcode'
  | 'resume'
  | 'paper'
  | 'comprehensive';

export type BasicsTopic =
  | 'post-training'
  | 'multimodal'
  | 'rag'
  | 'agent';

export interface CodeReviewResult {
  correctness: string;
  complexity: string;
  style: string[];
  improvements: {
    line: number;
    issue: string;
    suggestion: string;
  }[];
  score: number;
}

export interface TrackMessage {
  id: string;
  sessionId: string;
  track: TrainingTrack;
  role: 'interviewer' | 'candidate';
  content: string;
  topic?: BasicsTopic;
  leetcodeUrl?: string;
  codeContent?: string;
  codeReview?: CodeReviewResult;
  feedback?: InterviewFeedback;
  referenceAnswer?: string;
  timestamp: string;
}

export interface TrackBookmark {
  id: string;
  track: TrainingTrack;
  topic?: BasicsTopic;
  question: string;
  referenceAnswer?: string;
  createdAt: string;
}

export interface CachedResume {
  id: string;
  fileName: string;
  pdfPath: string;
  parsed: ResumeParsed;
  projects: ProjectDetail[];
  createdAt: string;
  updatedAt: string;
}

export interface CachedSession {
  id: string;
  track: TrainingTrack;
  topic?: BasicsTopic;
  date: string;
  messages: TrackMessage[];
  summary?: string;
}

export interface CachedPaper {
  id: string;
  title: string;
  authors: string;
  abstract: string;
  keyTechniques: string[];
  sectionSummary: string;
  paperText: string;
  fileName: string;
  createdAt: string;
}

export interface CacheIndex {
  resumes: { id: string; fileName: string; createdAt: string }[];
  sessions: { id: string; track: string; date: string }[];
  papers: { id: string; title: string; fileName: string; createdAt: string }[];
}
