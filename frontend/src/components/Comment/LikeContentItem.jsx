import React from 'react';
import styles from '../../styles/comment/likeContentItem.module.css';
import { useNavigate } from 'react-router-dom';

const LikeContentItem = ({ post, onUnlike, userId }) => {
  const formattedDate = new Date(post.createdAt).toLocaleDateString('ko-KR');
  const navigate = useNavigate();

  const goToDetail = () => {
    navigate(`/content/${post.contentId}`);
  };

  return (
    <div className={styles.item} onClick={goToDetail} style={{ cursor: 'pointer' }}>
      <div className={styles.left}>
        <div className={styles.profile}>
          {post.profileImageUrl ? (
            <img src={post.profileImageUrl} alt="프로필" className={styles.profileImage} />
          ) : (
            <div>{post.creatorName?.[0] || '?'}</div>
          )}
        </div>
        <div className={styles.content}>
          <div className={styles.meta}>
            <span className={styles.nickname}>{post.creatorName}</span>
            <span className={styles.job}>{post.job}</span>
            <span className={styles.date}>{formattedDate}</span>
          </div>
          <h3 className={styles.title}>{post.title}</h3>
          <div className={styles.tags}>
            {post.job && <span className={styles.tag}>{post.job}</span>}
            {post.category && <span className={styles.tag}>{post.category}</span>}
          </div>
        </div>
      </div>

      {/* 좋아요 취소 버튼만 상세 페이지 이동  방지 처리 */}
      <button
        className={styles.heart}
        onClick={e => {
          e.stopPropagation();
          onUnlike(post.contentId, userId);
        }}
        title="좋아요 취소">
        ❤️
      </button>
    </div>
  );
};

export default LikeContentItem;
