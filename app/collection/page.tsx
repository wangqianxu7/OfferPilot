import { BookmarkList } from '@/components/bookmark/BookmarkList';
import { TrackBookmarkList } from '@/components/bookmark/TrackBookmarkList';
import styles from '@/components/bookmark/Bookmark.module.css';

export default function CollectionPage() {
  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>⭐ 我的收藏夹</h1>
      <BookmarkList />
      <TrackBookmarkList />
    </div>
  );
}
