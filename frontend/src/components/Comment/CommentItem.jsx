import React from 'react';
import styles from '../../styles/comment/commentItem.module.css';
import btnstyles from '../../styles/comment/commentBtn.module.css';

const CommentItem = ({
  comment,
  isReply,
  editingTargetId,
  editContent,
  onEditChange,
  onEditSubmit,
  onEditStart,
  onEditCancel,
  onLike,
  onDelete,
  replyTargetId,
  onReplyToggle,
  replyContent,
  onReplyChange,
  onReplySubmit,
  onReplyCancel,
  userId,
}) => {
  const isEditing =
    editingTargetId === `comment-${comment.commentId}` && replyTargetId !== `reply-${comment.commentId}`;
  const isReplying =
    replyTargetId === `reply-${comment.commentId}` && editingTargetId !== `comment-${comment.commentId}`;

  const isOwner = Number(comment.userId) === Number(userId);

  const isLiked = comment.liked === true;
  const likeCount = comment.likeCount || 0;

  console.log(`[Comment ${comment.commentId}]`);
  console.log('userId (local):', userId);
  console.log('comment.userId:', comment.userId);
  console.log('isOwner:', isOwner);

  return (
    <div className={`${styles.commentItem} ${isReply ? styles.reply : ''}`}>
      {comment.profileImageUrl ? (
        <img src={comment.profileImageUrl} alt="프로필 이미지" className={styles.profileImage} />
      ) : (
        <div className={styles.avatarCircle}>{comment.nickname ? comment.nickname[0].toUpperCase() : '익'}</div>
      )}

      <div className={styles.commentMain}>
        <div className={styles.commentHeader}>
          <span className={styles.username}>{comment.nickname}</span>
          <span className={styles.userRole}>{comment.job}</span>
          <span className={styles.date}>
            {comment.createdAt ? new Date(comment.createdAt.replace(' ', 'T')).toLocaleString('ko-KR') : ''}
          </span>
        </div>

        {/* 댓글 내용 or 수정 입력창 */}
        {isEditing ? (
          <div className={styles.editForm}>
            <textarea value={editContent} onChange={onEditChange} rows="4" className={styles.editTextarea} />
            <div className={styles.editActions}>
              <button type="button" onClick={() => onEditSubmit(comment.commentId)} className={btnstyles.btnSubmit}>
                수정
              </button>
              <button type="button" onClick={() => onEditCancel(comment.commentId)} className={styles.cancelBtn}>
                취소
              </button>
            </div>
          </div>
        ) : (
          <div className={styles.commentContent}>
            <p className={`${styles.contentText} ${comment.isDeleted ? styles.deleted : ''}`}>
              {comment.isDeleted ? '삭제된 댓글입니다' : comment.contentText}
            </p>
          </div>
        )}

        {/* 댓글 하단 버튼들 (삭제된 댓글이면 숨김) */}
        {!comment.isDeleted && (
          <div className={styles.commentFooter}>
            {/* 좋아요 버튼 */}
            <button
              type="button"
              key={`like-${comment.commentId}-${isLiked}`} // key로 강제 리렌더링 유도
              onClick={() => onLike(comment.commentId)}
              className={`${styles.actionButton} ${isLiked ? styles.liked : ''}`}>
              {isLiked ? '❤️' : '🤍'} {likeCount}
            </button>

            {/* 답글 버튼 */}
            {!isReply && (
              <button type="button" onClick={() => onReplyToggle(comment.commentId)} className={styles.actionButton}>
                답글
              </button>
            )}

            {/* 수정/삭제 버튼 (작성자만) */}
            {isOwner && (
              <>
                <button type="button" onClick={() => onEditStart(comment)} className={styles.actionButton}>
                  수정
                </button>
                <button type="button" onClick={() => onDelete(comment.commentId)} className={styles.actionButton}>
                  삭제
                </button>
              </>
            )}
          </div>
        )}

        {/* 답글 입력창 (수정 중일 때는 숨김) */}
        {!comment.isDeleted && isReplying && (
          <div className={styles.replyForm}>
            <textarea
              value={replyContent || ''}
              onChange={e => onReplyChange(comment.commentId, e.target.value)}
              placeholder="답글을 입력하세요..."
              rows="4"
              className={styles.editTextarea}
            />
            <div className={styles.editActions}>
              <button type="button" onClick={() => onReplySubmit(comment.commentId)} className={btnstyles.btnSubmit}>
                답글 작성
              </button>
              <button type="button" onClick={() => onReplyCancel(comment.commentId)} className={styles.cancelBtn}>
                취소
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommentItem;
