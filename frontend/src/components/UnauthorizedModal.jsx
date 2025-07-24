import React, { useEffect, useRef } from 'react';
import styles from './ManageSubscriptionPage/SubscriptionModal/SubscriptionModal.module.css'; // 동일 스타일 재사용

// 권한 없음 안내 모달
export const UnauthorizedModal = ({ onClose, creatorNickname }) => {
  const modalRef = useRef();

  const handleSubscribeClick = () => {
    window.location.href = `/payments/summary/${encodeURIComponent(creatorNickname)}`;
  };

  const handleOverlayClick = e => {
    if (e.target === modalRef.current) {
      onClose();
    }
  };

  const handleKeyDown = e => {
    if (e.key === 'Escape') {
      onClose();
    }
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <div className={styles.overlay} ref={modalRef} onClick={handleOverlayClick}>
      <div className={styles.modal}>
        <h2 className={styles.title}>구독이 필요한 콘텐츠입니다.</h2>
        <p className={styles.description}>
          이 콘텐츠는 <strong>{creatorNickname}</strong> 크리에이터를 
          <br />
          구독한 사용자만 볼 수 있습니다.
          <br />
          구독하시겠습니까?
        </p>
        <div className={styles.actions}>
          <button className={styles.cancelBtn} onClick={onClose}>
            닫기
          </button>
          <button className={styles.confirmBtn} onClick={handleSubscribeClick}>
            구독하기
          </button>
        </div>
      </div>
    </div>
  );
};
