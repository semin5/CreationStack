import React from 'react';
import styles from './ContentHeader.module.css'; // ContentHeader.module.css 임포트

const ContentHeader = ({ title, categories, createdAt, accessType, isAuthor, onEdit, onDelete }) => {
  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  return (
    <div className={styles.contentHeaderContainer}>
      <h1 className={styles.contentTitle}>{title}</h1>

      {/* 콘텐츠 메타데이터 섹션 */}
      <div className={styles.metaInfo}>
        {/* 구독자 전용 여부 */}
        {accessType === 'SUBSCRIBER' && (
          <span className={styles.subscriberBadge}>구독자 전용</span>
        )}

        {/* 카테고리 목록 */}
        <div className={styles.categoryList}>
          {categories && categories.map(category => (
            <span key={category.categoryId} className={styles.categoryTag}>
              {category.name}
            </span>
          ))}
        </div>

        {/* 작성일시 */}
        <span className={styles.createdAt}>작성일: {formatDate(createdAt)}</span>

        {/* 수정, 삭제 버튼 (작성자 본인일 경우에만 보이기) */}
        {isAuthor && (
          <div className={styles.actionButtons}>
            <button onClick={onEdit} className={styles.editButton}>수정</button>
            <button onClick={onDelete} className={styles.deleteButton}>삭제</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ContentHeader;
