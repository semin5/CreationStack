import React, { useEffect, useState } from 'react';
import FavoriteContentItem from '../../components/Comment/LikeContentItem';
import styles from '../../styles/comment/likeContentPage.module.css';
import { fetchLikedContents, toggleLikeContent } from '../../api/likeList';

const FavoriteContentPage = () => {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem('userId');
  const postsPerPage = 5;

  useEffect(() => {
    fetchFavoritePosts();
  }, [currentPage]);

  const fetchFavoritePosts = async () => {
    try {
      setLoading(true);
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.error('userId가 없습니다.');
        setPosts([]);
        setTotalPages(0);
        return;
      }

      const data = await fetchLikedContents(currentPage - 1, userId);
      setPosts(data.content);
      setTotalPages(data.totalPages);
    } catch (error) {
      console.error('좋아요한 콘텐츠 조회 실패', error);
      setPosts([]);
      setTotalPages(0);
    } finally {
      setLoading(false);
    }
  };

  const handleUnlike = async (contentId, userId) => {
    try {
      await toggleLikeContent(contentId, userId);
      fetchFavoritePosts();
    } catch (err) {
      console.error('좋아요 취소 실패', err);
      alert('좋아요 취소에 실패했습니다.');
    }
  };

  const getPageNumbers = () => {
    const pages = [];
    const max = 5;
    if (totalPages <= max) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
    } else if (currentPage <= 3) {
      pages.push(1, 2, 3, '...', totalPages);
    } else if (currentPage >= totalPages - 2) {
      pages.push(1, '...', totalPages - 2, totalPages - 1, totalPages);
    } else {
      pages.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
    }
    return pages;
  };

  return (
    <div className={styles.favoriteContentPage}>
      <div className={styles.container}>
        <h1 className={styles.title}>좋아요한 콘텐츠 목록</h1>

        {loading ? (
          <p className={styles.state}>데이터를 불러오는 중...</p>
        ) : posts.length === 0 ? (
          <p className={styles.state}>좋아요한 콘텐츠가 없습니다.</p>
        ) : (
          <>
            <div className={styles.list}>
              {posts.map(post => (
                <FavoriteContentItem key={post.contentId} post={post} onUnlike={handleUnlike} userId={userId} />
              ))}
            </div>

            <div className={styles.pagination}>
              <button onClick={() => setCurrentPage(prev => prev - 1)} disabled={currentPage === 1}>
                &lt; Prev
              </button>
              {getPageNumbers().map((num, idx) => (
                <button
                  key={idx}
                  disabled={num === '...'}
                  className={`${styles.pageBtn} ${num === currentPage ? styles.active : ''}`}
                  onClick={() => typeof num === 'number' && setCurrentPage(num)}>
                  {num}
                </button>
              ))}
              <button onClick={() => setCurrentPage(prev => prev + 1)} disabled={currentPage === totalPages}>
                Next &gt;
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default FavoriteContentPage;
