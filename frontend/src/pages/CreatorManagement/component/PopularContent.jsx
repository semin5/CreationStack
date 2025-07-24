import React, { useState, useEffect } from 'react';
import styles from '../../../pages/CreatorManagement/CreatorManagementPage.module.css'; // 페이지 CSS 임포트
import { getMyTopViewedContents } from '../../../api/contentAPI'; // API 함수 임포트

export const PopularContent =() => {
    const [topContents, setTopContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTopContents = async () => {
      try {
        setLoading(true);
        const data = await getMyTopViewedContents();
        setTopContents(data);
      } catch (err) {
        setError(err);
        console.error('조회수 TOP 3 콘텐츠 로드 실패:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopContents();
  }, []); // 컴포넌트 마운트 시 1회 호출

  if (loading) {
    return <div className={styles.loadingMessage}>인기 콘텐츠를 불러오는 중...</div>;
  }

  if (error) {
    return <div className={styles.errorMessage}>인기 콘텐츠를 불러오는데 실패했습니다: {error.message}</div>;
  }

  return (
    <div className={styles.popularContent}> 
      <div className={styles.overlapPopular}>
        <div className={styles.sectionTitle}>조회수 TOP 3 콘텐츠</div> 
        <div className={styles.contentList}>
          {topContents.length > 0 ? (
            topContents.map((content, index) => (
              <div key={content.contentId} className={styles.cardItem}>
                <div className={styles.overlapGroupContent}>
                  <div className={styles.rankBadge}>
                    <div className={styles.rankTextWrapper}>
                      <div className={styles.rankText}>{index + 1}</div> {/* 순위 표시 */}
                    </div>
                  </div>
                  <p className={styles.titleTextContent}>
                    {content.title}
                  </p>
                  <div className={styles.viewCountText}>조회수 {content.viewCount ? content.viewCount.toLocaleString() : 0}</div>
                </div>
              </div>
            ))
          ) : (
            <p className={styles.noItemsMessage}>표시할 인기 콘텐츠가 없습니다.</p>
          )}
        </div>
      </div>
    </div>
  );
};