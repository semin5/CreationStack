import React from 'react';
import styles from './CommentSection.module.css';

const CommentSection = ({ contentId }) => {
  return (
    <div className={styles.wrapper}>
      <h3>댓글</h3>
      <div className={styles.placeholder}>※ 댓글 기능은 아직 구현 중입니다.</div>
    </div>
  );
};

export default CommentSection;
