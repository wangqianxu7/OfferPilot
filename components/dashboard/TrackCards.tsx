import Link from 'next/link';
import styles from './Dashboard.module.css';

const TRACKS = [
  { id: 'basics', icon: '📚', name: '大模型八股', desc: '后训练/多模态/RAG/Agent 知识考察', href: '/tracks/basics', needResume: false },
  { id: 'leetcode', icon: '⚙️', name: 'LeetCode算法', desc: '算法题 + LC原站链接 + AI评判', href: '/tracks/leetcode', needResume: false },
  { id: 'torchcode', icon: '🔥', name: '手撕代码', desc: 'PyTorch核心实现 · Monaco在线编辑器', href: '/tracks/torchcode', needResume: false },
  { id: 'resume', icon: '📋', name: '简历专项', desc: '基于你的简历和项目追问深挖', href: '/tracks/resume', needResume: true },
  { id: 'paper', icon: '📄', name: '论文精读', desc: '上传技术论文，AI考察核心技术理解', href: '/tracks/paper', needResume: false },
];

export function TrackCards({ hasResume }: { hasResume: boolean }) {
  return (
    <>
      <h2 className={styles.sectionTitle}>🎯 选择训练赛道</h2>
      <div className={styles.trackGrid}>
        {TRACKS.map(track => {
          const disabled = track.needResume && !hasResume;
          return disabled ? (
            <div key={track.id} className={styles.trackCard} style={{ opacity: 0.4, cursor: 'not-allowed' }}>
              <span className={styles.trackIcon}>{track.icon}</span>
              <span className={styles.trackName}>{track.name}</span>
              <span className={styles.trackDesc}>{track.desc}</span>
              <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>需要先上传简历</span>
            </div>
          ) : (
            <Link key={track.id} href={track.href} className={styles.trackCard}>
              <span className={styles.trackIcon}>{track.icon}</span>
              <span className={styles.trackName}>{track.name}</span>
              <span className={styles.trackDesc}>{track.desc}</span>
            </Link>
          );
        })}
      </div>
    </>
  );
}
