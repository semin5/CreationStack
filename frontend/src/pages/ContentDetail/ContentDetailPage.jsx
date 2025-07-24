import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

// API 함수 임포트
import { getContentById, deleteContent, getContentsByCreator as fetchRelatedContents } from '../../api/contentAPI';

// 컴포넌트 임포트
import ContentHeader from '../../components/ContentDetail/ContentHeader/ContentHeader';
import AuthorInfoCard from '../../components/ContentDetail/AuthorInfoCard/AuthorInfoCard';
import ContentBody from '../../components/ContentDetail/ContentBody/ContentBody';
import FileDownloadList from '../../components/ContentDetail/FileDownloadList/FileDownloadList';
import LikeCommentBar from '../../components/ContentDetail/LikeCommentBar/LikeCommentBar';
import RelatedContentList from '../../components/ContentDetail/RelatedContentList/RelatedContentList';
import ReplyList from './ReplyList';
import styles from './ContentDetailPage.module.css';
import { toggleContentLike } from '../../api/contentAPI';
import { getMyProfile } from '../../api/user';

export const ContentDetailPage = () => {
  const { contentId } = useParams();
  const navigate = useNavigate();

  const [content, setContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [likeCount, setLikeCount] = useState(content?.likeCount || 0);
  const [isLiked, setIsLiked] = useState(null);
  const [error, setError] = useState(null);
  const [commentCount, setCommentCount] = useState(0);
  const [loginUser, setLoginUser] = useState(null);
  const [isAuthor, setIsAuthor] = useState(false);

  // 1. 콘텐츠 상세 정보 불러오기
  useEffect(() => {
    const fetchContent = async () => {
      try {
        setLoading(true);
        const data = await getContentById(contentId);
        setContent(data);
        setLikeCount(data.likeCount || 0);
        setIsLiked(data.liked !== undefined ? data.liked : false);
        setCommentCount(data.commentCount || 0);

        const userRes = await getMyProfile();
        setLoginUser(userRes.data);

        setIsAuthor(userRes.data.userId === data.creatorId);
      } catch (err) {
        console.error('콘텐츠 상세 조회 실패:', err);
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchContent();
  }, [contentId]);

  // 좋아요 클릭 시 호출
  const handleLikeClick = async () => {
    try {
      await toggleContentLike(contentId);
      const response = await axios.get(`/api/content/${contentId}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` },
      });

      const updated = response.data;

      setLikeCount(updated.likeCount);
      setIsLiked(updated.isLiked ?? updated.liked);
    } catch (error) {
      console.error('좋아요 처리 실패:', error);
    }
  };

  // 3. 수정/삭제 버튼 핸들러 (이제 항상 보이지만, 백엔드에서 권한 확인)
  const handleEdit = () => {
    navigate(`/content-edit/${contentId}`); // 콘텐츠 수정 페이지로 이동
  };

  const handleDelete = async () => {
    if (window.confirm('정말로 이 콘텐츠를 삭제하시겠습니까?')) {
      try {
        await deleteContent(contentId);
        alert('콘텐츠가 성공적으로 삭제되었습니다.');
        navigate('/creator-management'); // 삭제 후 크리에이터 관리 페이지로 이동
      } catch (err) {
        console.error('콘텐츠 삭제 실패:', err);
        alert('콘텐츠 삭제에 실패했습니다: ' + (err.message || '알 수 없는 오류'));
      }
    }
  };

  if (loading) return <div className={styles.loadingMessage}>콘텐츠를 불러오는 중...</div>;
  if (error) return <div className={styles.errorMessage}>콘텐츠를 불러오는데 실패했습니다: {error.message}</div>;
  if (!content) return <div className={styles.noContentMessage}>콘텐츠를 찾을 수 없습니다.</div>;

  console.log('content 정보', content);

  return (
    <div className={styles.pageWrapper}>
      {/* 1. 제목, 구독자전용여부, 카테고리, 작성일시, 수정/삭제 버튼 */}
      <ContentHeader
        title={content.title}
        categories={content.categories}
        createdAt={content.createdAt}
        accessType={content.accessType}
        isAuthor={isAuthor}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* 3. 크리에이터 페이지로 이동 버튼 (프로필 이미지 + 닉네임 + 직업) */}
      <AuthorInfoCard
        creatorId={content.creatorId}
        nickname={content.creatorNickname} // DTO에서 creatorNickname으로 변경됨
        job={content.creatorJob || '직업 정보 없음'} // DTO에 없으면 기본값
        profileImageUrl={content.creatorProfileUrl}
      />
      {/* <ContentBody thumbnailUrl={content.thumbnailUrl} description={content.content} />
      <FileDownloadList files={content.fileUrls} /> */}

      {/* 4. 본문내용 (마크다운 렌더링 적용) */}
      <ContentBody content={content.content} thumbnailUrl={content.thumbnailUrl} />

      {/* 5. 첨부파일 헤딩 텍스트 + 6. 첨부파일 목록 */}
      {content.attachments && content.attachments.length > 0 && (
        <>
          <h3 className={styles.attachmentHeading}>첨부파일</h3>
          <FileDownloadList
            files={content.attachments.map(att => ({
              url: att.fileUrl,
              name: att.originalFileName,
            }))}
          />
        </>
      )}

      <LikeCommentBar
        likeCount={likeCount}
        commentCount={commentCount}
        isLiked={isLiked}
        onLikeClick={handleLikeClick}
      />

      <ReplyList contentId={contentId} onCommentCountChange={setCommentCount} />

      {/* 8. <내닉네임>의 다른 콘텐츠 \n 내 콘텐츠 목록 표출 */}
      {/* RelatedContentList 컴포넌트 추가 */}
      <RelatedContentList
        creatorId={content.creatorId}
        creatorNickname={content.creatorNickname}
        currentContentId={content.contentId} // 현재 콘텐츠 ID를 prop으로 전달
      />
    </div>
  );
};
