import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CommentItem from '../../components/Comment/CommentItem';
import styles from '../../styles/comment/replyList.module.css';
import btnstyles from '../../styles/comment/commentBtn.module.css';

const ReplyList = ({ contentId, onCommentCountChange }) => {
  const [comments, setComments] = useState([]);
  const [editingTargetId, setEditingTargetId] = useState(null);
  const [editContent, setEditContent] = useState('');
  const [newComment, setNewComment] = useState('');
  const [replyTargetId, setReplyTargetId] = useState(null);
  const [replyContents, setReplyContents] = useState({});
  const [loading, setLoading] = useState(false);

  const userId = Number(localStorage.getItem('userId'));

  const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    console.log(localStorage.getItem('accessToken'));
    return {
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    };
  };

  const fetchComments = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`/api/contents/${contentId}/comments`, getAuthHeaders());
      setComments(res.data);

      const topLevelCount = res.data.filter(c => !c.parentCommentId).length;
      if (onCommentCountChange) {
        onCommentCountChange(topLevelCount);
      }
    } catch (err) {
      alert('댓글 불러오기 실패');
    } finally {
      setLoading(false);
    }
  };

  const safeFetchComments = async () => {
    const scrollY = window.scrollY;
    await fetchComments(); // 기존 댓글 목록 불러오기
    setTimeout(() => {
      window.scrollTo({ top: scrollY });
    }, 0); // DOM 렌더링 후에 스크롤 복원
  };

  useEffect(() => {
    if (contentId) fetchComments();
  }, [contentId]);

  // 댓글 등록
  const handleNewComment = async e => {
    e.preventDefault();
    if (!newComment.trim() || !userId) return alert('댓글 내용을 입력해주세요');

    const token = localStorage.getItem('accessToken');

    try {
      await axios.post(
        `/api/contents/${contentId}/comments`,
        {
          contentText: newComment,
          parentCommentId: null,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          withCredentials: true,
        }
      );
      setNewComment('');
      await safeFetchComments();
    } catch (err) {
      console.error('댓글 등록 오류:', err);
      alert('댓글 등록 실패');
    }
  };

  const handleReplyChange = (parentId, value) => {
    setReplyContents(prev => ({ ...prev, [parentId]: value }));
  };

  // 답글 등록
  const handleReplySubmit = async parentId => {
    const content = replyContents[parentId];
    if (!content?.trim()) return alert('답글을 입력해주세요');
    try {
      await axios.post(
        `/api/contents/${contentId}/comments`,
        {
          contentText: content,
          parentCommentId: parentId,
        },
        getAuthHeaders()
      );
      setReplyContents(prev => {
        const copy = { ...prev };
        delete copy[parentId];
        return copy;
      });
      setReplyTargetId(null);
      await safeFetchComments();
    } catch (err) {
      console.error('답글 등록 오류:', err);
      alert('답글 등록 실패');
    }
  };

  // 수정
  const handleEditSubmit = async commentId => {
    if (!editContent.trim()) return;
    if (!window.confirm('댓글을 수정하시겠습니까?')) return;

    try {
      await axios.put(
        `/api/contents/${contentId}/comments/${commentId}`,
        {
          contentText: editContent,
        },
        getAuthHeaders()
      );
      setEditingTargetId(null);
      setEditContent('');
      await safeFetchComments();
    } catch {
      alert('수정 실패');
    }
  };

  //좋아요
  const handleLike = async commentId => {
    try {
      const token = localStorage.getItem('accessToken');
      await axios.post(`/api/contents/${contentId}/comments/${commentId}/like`, null, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      await safeFetchComments();
    } catch (error) {
      alert('좋아요 처리 실패');
      console.error(error);
      fetchComments();
    }
  };

  //삭제
  const handleDelete = async commentId => {
    if (!window.confirm('삭제할까요?')) return;

    try {
      const res = await axios.delete(
        `/api/contents/${contentId}/comments/${commentId}?userId=${userId}`,
        getAuthHeaders()
      );
      await safeFetchComments();
    } catch (err) {
      alert('삭제 실패');
    }
  };

  const totalCommentCount = comments.filter(c => !c.parentCommentId).length;

  if (loading) return <div className={styles.loading}>댓글을 불러오는 중...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.commentHeader}>
        <h2>댓글 {totalCommentCount}</h2>
      </div>

      <div className={styles.newComment}>
        <h3>댓글 작성</h3>
        <textarea
          value={newComment}
          onChange={e => setNewComment(e.target.value)}
          placeholder="댓글을 입력하세요..."
          rows="4"
        />
        <div className={styles.newCommentActions}>
          <button type="button" onClick={handleNewComment} className={btnstyles.btnSubmit}>
            댓글 작성
          </button>
        </div>
      </div>

      <div className={styles.commentList}>
        {/*댓글목록*/}
        {comments
          .filter(c => !c.parentCommentId && c.commentId !== undefined)
          .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
          .map(comment => (
            <div key={`comment-${comment.commentId}`} className={styles.commentItem}>
              <CommentItem
                comment={comment}
                isReply={false}
                editingTargetId={editingTargetId}
                replyTargetId={replyTargetId}
                editContent={editContent}
                onEditChange={e => setEditContent(e.target.value)}
                onEditSubmit={handleEditSubmit}
                onEditStart={comment => {
                  setReplyTargetId(null);
                  setEditingTargetId(`comment-${comment.commentId}`);
                  setEditContent(comment.contentText);
                }}
                onEditCancel={() => {
                  setEditingTargetId(null);
                  setEditContent('');
                }}
                onLike={handleLike}
                onDelete={handleDelete}
                onReplyToggle={id => {
                  setEditingTargetId(null);
                  setReplyTargetId(prev => (prev === `reply-${id}` ? null : `reply-${id}`));
                }}
                replyContent={replyContents[comment.commentId]}
                onReplyChange={handleReplyChange}
                onReplySubmit={handleReplySubmit}
                onReplyCancel={id => {
                  setReplyTargetId(null); // 답글 폼 닫기
                  setReplyContents(prev => {
                    const copy = { ...prev };
                    delete copy[id];
                    return copy;
                  });
                }}
                userId={userId}
              />
              {/*답글목록*/}
              {comments
                .filter(reply => reply.parentCommentId === comment.commentId && reply.commentId !== undefined)
                .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                .map(reply => (
                  <div key={`reply-${reply.commentId}`} className={styles.replies}>
                    <CommentItem
                      comment={reply}
                      isReply={true}
                      editingTargetId={editingTargetId}
                      editContent={editContent}
                      onEditChange={e => setEditContent(e.target.value)}
                      onEditSubmit={handleEditSubmit}
                      onEditStart={comment => {
                        setReplyTargetId(null);
                        setEditingTargetId(`comment-${comment.commentId}`);
                        setEditContent(comment.contentText);
                      }}
                      onEditCancel={() => {
                        setEditingTargetId(null);
                        setEditContent('');
                      }}
                      onLike={handleLike}
                      onDelete={handleDelete}
                      replyTargetId={replyTargetId}
                      onReplyToggle={id => {
                        setEditingTargetId(null);
                        setReplyTargetId(prev => (prev === `reply-${id}` ? null : `reply-${id}`));
                      }}
                      replyContent={replyContents[reply.commentId]}
                      onReplyChange={handleReplyChange}
                      onReplySubmit={handleReplySubmit}
                      onReplyCancel={id => {
                        setReplyTargetId(null); // 답글 폼 닫기
                        setReplyContents(prev => {
                          const copy = { ...prev };
                          delete copy[id];
                          return copy;
                        });
                      }}
                      userId={userId}
                    />
                  </div>
                ))}
            </div>
          ))}
      </div>
    </div>
  );
};

export default ReplyList;
