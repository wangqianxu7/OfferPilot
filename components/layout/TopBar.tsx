import Link from 'next/link';
import styles from './TopBar.module.css';

export function TopBar() {
  return (
    <header className={styles.bar}>
      <Link href="/" className={styles.logo}>OfferPilot</Link>
      <span className={styles.subtitle}>AI面试教练</span>
    </header>
  );
}
