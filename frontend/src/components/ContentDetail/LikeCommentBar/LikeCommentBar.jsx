import React from 'react';
import styles from './LikeCommentBar.module.css';

const LikeCommentBar = ({ likeCount, commentCount, isLiked, onLikeClick }) => {
  return (
    <div className={styles.bar}>
      <button onClick={onLikeClick} className={`${styles.actionButton} ${isLiked ? styles.liked : ''}`}>
        <span className={styles.icon}>{isLiked ? '❤️' : '🤍'}</span>
        <span>{likeCount}</span>
      </button>
      <div className={styles.commentInfo}>
        <span className={styles.icon}>💬</span>
        <span>{commentCount}</span>
      </div>
    </div>
  );
};

export default LikeCommentBar;
