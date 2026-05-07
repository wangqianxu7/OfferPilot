'use client';
import { useEffect } from 'react';
import { BookmarkCard } from './BookmarkCard';
import { useBookmarkStore } from '@/stores/bookmark-store';
import styles from './Bookmark.module.css';

export function BookmarkList() {
  const { bookmarks, setBookmarks } = useBookmarkStore();

  useEffect(() => {
    fetch('/api/bookmarks')
      .then(r => r.json())
      .then(setBookmarks);
  }, [setBookmarks]);

  if (bookmarks.length === 0) {
    return <p className={styles.empty}>📭 暂无收藏 · 面试中点击 ⭐ 收藏卡壳问题</p>;
  }

  return (
    <div>
      {bookmarks.map(b => <BookmarkCard key={b.id} bookmark={b} />)}
    </div>
  );
}
