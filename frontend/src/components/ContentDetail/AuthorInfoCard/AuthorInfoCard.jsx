import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './AuthorInfoCard.module.css'; // AuthorInfoCard.module.css 임포트

const AuthorInfoCard = ({ creatorId, nickname, job, profileImageUrl }) => {
  const navigate = useNavigate();

  const handleCreatorPageClick = () => {
    // 크리에이터 메인 페이지로 이동 (닉네임을 URL 파라미터로 전달)
    // 백엔드에서 닉네임으로 크리에이터를 조회하는 엔드포인트가 필요합니다.
    navigate(`/creator-main/${nickname}`);
  };

  return (
    // 전체 div를 클릭 가능하도록 변경
    <div className={styles.authorInfoCardContainer} onClick={handleCreatorPageClick}>
      <div className={styles.profileSection}>
        <img
          src={profileImageUrl || "https://placehold.co/50x50/cccccc/333333?text=No+Img"} // 기본 이미지
          alt={`${nickname} 프로필`}
          className={styles.profileImage}
        />
        <div className={styles.textInfo}>
          <span className={styles.nickname}>{nickname || "알 수 없는 크리에이터"}</span>
          <span className={styles.job}>{job || "직업 정보 없음"}</span> {/* job이 없으면 기본값 */}
        </div>
      </div>
      {/* "크리에이터 페이지로 이동" 버튼 라벨은 이제 전체 카드 클릭으로 대체되므로 제거 */}
      {/* <button onClick={handleCreatorPageClick} className={styles.goToCreatorPageButton}>
        크리에이터 페이지로 이동
      </button> */}
    </div>
  );
};

export default AuthorInfoCard;
