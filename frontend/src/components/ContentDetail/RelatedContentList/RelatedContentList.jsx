import React, { useState, useEffect } from 'react';
import { ContentCardList } from '../../../components/ContentCard/ContentCardList'; // ContentCardList 임포트
import { getContentsByCreator } from '../../../api/contentAPI'; // getContentsByCreator 임포트
import styles from '../../../pages/CreatorManagement/creatorManagementPage.module.css'; // MyContent와 동일한 CSS 임포트

const RelatedContentList = ({ creatorId, creatorNickname, currentContentId }) => { // currentContentId prop 추가
  const [relatedContents, setRelatedContents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchRelatedContents = async () => {
      if (!creatorId) {
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        // getContentsByCreator API 호출 시 currentContentId를 excludeContentId로 전달
        const data = await getContentsByCreator(creatorId, currentContentId);
        setRelatedContents(data);
      } catch (err) {
        setError(err);
        console.error(`크리에이터 ID ${creatorId}의 관련 콘텐츠 로드 실패:`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedContents();
  }, [creatorId, currentContentId]); // creatorId 또는 currentContentId가 변경될 때마다 다시 로드

  if (loading) {
    return <div className={styles.loadingMessage}>관련 콘텐츠를 불러오는 중...</div>;
  }

  if (error) {
    return <div className={styles.errorMessage}>관련 콘텐츠를 불러오는데 실패했습니다: {error.message}</div>;
  }

  // 관련 콘텐츠가 없으면 섹션 자체를 렌더링하지 않음
  if (!relatedContents || relatedContents.length === 0) {
    return null;
  }

  return (
    <div className={styles.myContentManagementSection}> {/* MyContent와 동일한 섹션 스타일 재사용 */}
      <h1 className={styles.myContentTitle}>{creatorNickname}의 다른 콘텐츠</h1> {/* 동적 제목 */}
      <ContentCardList contents={relatedContents} />
    </div>
  );
};

export default RelatedContentList;
