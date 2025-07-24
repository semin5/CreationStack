import React, { useState, useEffect } from 'react';
import styles from './mypage.module.css';
import { Link, useNavigate } from 'react-router-dom';
import { getMyProfile, deleteMyAccount } from '../../api/user';
import { LeaveMemberModal } from '../../components/Member/LeaveMemberModal';

export const MyPage = () => {
  const [user, setUser] = useState(null);
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await getMyProfile();
        setUser(response.data.data);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };
    fetchUserData();
  }, []);

  const openModal = () => {
    setIsModalOpen(true);
  };

  // 모달을 닫는 함수
  const closeModal = () => {
    setIsModalOpen(false);
  };

  // 모달의 '확인'을 눌렀을 때 실행될 실제 회원 탈퇴 처리 함수
  const handleConfirmUnregister = async () => {
    try {
      await deleteMyAccount();
      alert('회원 탈퇴가 완료되었습니다. 이용해주셔서 감사합니다.');
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken'); // refreshToken도 함께 삭제
      navigate('/');
    } catch (error) {
      console.error('Failed to unregister:', error);
      alert('회원 탈퇴 중 오류가 발생했습니다. 다시 시도해주세요.');
    } finally {
      closeModal(); // 성공하든 실패하든 모달을 닫음
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.myCreatorPage}>
      <div className={styles.teamSectionWrapper}>
        <div className={styles.teamSection}>
          <div className={styles.mypageSection}>
            <div className={styles.dashboardSection}>
              <div className={styles.profileInfoGroup}>
                <img
                  className={styles.profileImage}
                  alt="Profile"
                  src={user.profileImageUrl || 'https://c.animaapp.com/md5nv2zm9suaL3/img/profileimage.png'}
                />
                <div className={styles.userInformation}>
                  <div className={`${styles.baseTextStyles} ${styles.nicknameText}`}>{user.nickname}</div>
                  <div className={`${styles.baseTextStyles} ${styles.jobText}`}>{user.jobName || ''}</div>
                  <a className={`${styles.baseTextStyles} ${styles.emailText}`} href={`mailto:${user.email}`}>
                    {user.email}
                  </a>
                  <p className={`${styles.baseTextStyles} ${styles.bioText}`}>{user.bio}</p>
                </div>
              </div>

              <Link to="/profile/edit" className={styles.profileEditButton}>
                <div className={`${styles.baseTextStyles} ${styles.div}`}>프로필 수정</div>
              </Link>
            </div>

            <div className={styles.menuListSection}>
              {user.role === 'CREATOR' ? (
                <Link to={`/creator-main/${user.nickname}`} className={styles.labelWrapper}>
                  <div className={`${styles.baseTextStyles} ${styles.label2}`}>내 프로필 보기</div>
                </Link>
              ) : (
                <Link to={`/user-main/${user.nickname}`} className={styles.labelWrapper}>
                  <div className={`${styles.baseTextStyles} ${styles.label2}`}>내 프로필 보기</div>
                </Link>
              )}

              {user.role === 'CREATOR' && (
                <Link to="/creator-management" className={styles.labelWrapper}>
                  <div className={`${styles.baseTextStyles} ${styles.label2}`}>크리에이터 관리 페이지</div>
                </Link>
              )}

              <Link to="/subscription-manage" className={styles.labelWrapper}>
                <div className={`${styles.baseTextStyles} ${styles.label2}`}>구독 관리</div>
              </Link>
              <Link to="/favorites" className={styles.labelWrapper}>
                <div className={`${styles.baseTextStyles} ${styles.label2}`}>좋아요한 콘텐츠 목록</div>
              </Link>
              <Link to="/payments" className={styles.labelWrapper}>
                <div className={`${styles.baseTextStyles} ${styles.label2}`}>결제수단 관리</div>
              </Link>
              <div className={styles.labelWrapper} onClick={openModal} style={{ cursor: 'pointer' }}>
                <div className={`${styles.baseTextStyles} ${styles.label2}`}>회원 탈퇴</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <LeaveMemberModal isOpen={isModalOpen} onClose={closeModal} onConfirm={handleConfirmUnregister} />
    </div>
  );
};
