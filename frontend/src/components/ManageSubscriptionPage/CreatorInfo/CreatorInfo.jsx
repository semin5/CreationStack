import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './CreatorInfo.module.css';

import { StatusButton } from '../StatusButton/StatusButton';
import { SubscriptionModal } from '../SubscriptionModal/SubscriptionModal';
import { cancelSubscription } from '../../../api/subscription';

// 사용자 구독 목록에서 크리에이터 정보
export const CreatorInfo = ({ subscriptionId, className, creatorNickname, profileImage, subsCount, bio, userStatus, date }) => {
  // 상태별 메시지 + 버튼 정의
  const [status, setStatus] = useState(userStatus);

  const formatDate = isoString => {
    if (!isoString) return '';
    const date = new Date(isoString);
    return `${date.getFullYear()}년 ${String(date.getMonth() + 1).padStart(2, '0')}월 ${String(date.getDate()).padStart(
      2,
      '0'
    )}일`;
  };

  const statusConfig = {
    ACTIVE: { message: `다음 결제 예정일: ${formatDate(date)}` },
    CANCELLED: { message: `만료 예정일: ${formatDate(date)}` },
    EXPIRED: { message: '유효기간이 만료되어, 구독 해지되었습니다.' },
  };

  const statusInfo = statusConfig[status] || {};

  const [modalType, setModalType] = useState(null);
  const navigate = useNavigate();

  const handleStatusClick = e => {
    e.stopPropagation(); // 부모 div 클릭 막기
    if (status === 'ACTIVE') setModalType('cancel');
    else if (status === 'CANCELLED' || status === 'EXPIRED') setModalType('resume');
  };

  const handleClickCreator = () => {
    navigate(`/creator-main/${creatorNickname}`);
  };

  const handleConfirm = async () => {

    if (modalType === 'resume') {
      navigate(`/payments/summary/${creatorNickname}`);
      return;
    }

    if (modalType === 'cancel') {
      try {
        // 구독 해지 API 호출
        await cancelSubscription(subscriptionId);

        // TODO: 해지 후 UI 상태 갱신 (예: 새 상태 요청 or 상태 변수 변경)
        console.log('구독 해지 성공');
        setStatus('CANCELLED');
      } catch (err) {
        console.error('구독 해지 실패', err);
      } finally {
        setModalType(null);
      }
    }
  };

  return (
    <>
      <div className={styles['creatorInfo']} onClick={handleClickCreator}>
        <div className={`${styles['profile-image-wrapper']} ${className}`}>
          <img src={profileImage} alt="프로필" className={styles['profile-image']} />
        </div>

        <div className={styles['group']}>
          <div className={styles['creator-name']}>{creatorNickname}</div>
          <div className={styles['subscriber-count']}>구독자 수 : {subsCount} 명</div>
          <p className={styles['p']}>{bio}</p>
          <div className={styles['status-message']}>{statusInfo.message}</div>
        </div>

        <div className={styles['button-area']}>
          <StatusButton status={status} className={styles['button']} onClick={handleStatusClick} />
        </div>
      </div>

      {modalType && <SubscriptionModal type={modalType} onClose={() => setModalType(null)} onConfirm={handleConfirm} />}
    </>
  );
};
