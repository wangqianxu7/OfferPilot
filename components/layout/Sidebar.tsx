'use client';
import Link from 'next/link';
import styles from './Sidebar.module.css';

interface SidebarProps {
  sessions: { id: string; title: string; date: string }[];
}

export function Sidebar({ sessions }: SidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <nav className={styles.nav}>
        <Link href="/" className={styles.navItem}>🏠 首页</Link>
        <Link href="/tracks/basics" className={styles.navItem}>📚 八股</Link>
        <Link href="/tracks/leetcode" className={styles.navItem}>⚙️ 算法</Link>
        <Link href="/tracks/torchcode" className={styles.navItem}>🔥 手撕</Link>
        <Link href="/tracks/resume" className={styles.navItem}>📋 简历</Link>
        <Link href="/tracks/paper" className={styles.navItem}>📄 论文</Link>
        <Link href="/collection" className={styles.navItem}>⭐ 收藏</Link>
        <Link href="/review" className={styles.navItem}>📊 复盘</Link>
      </nav>

      <div className={styles.divider} />

      <div className={styles.sectionLabel}>面试记录</div>
      {sessions.length === 0 ? (
        <p className={styles.empty}>暂无面试记录</p>
      ) : (
        sessions.map(s => (
          <Link key={s.id} href={`/interview?id=${s.id}`} className={styles.sessionItem}>
            <span className={styles.sessionTitle}>{s.title}</span>
            <span className={styles.sessionDate}>{s.date}</span>
          </Link>
        ))
      )}
    </aside>
  );
}
