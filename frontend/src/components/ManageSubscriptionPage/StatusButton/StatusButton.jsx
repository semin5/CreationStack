import React from 'react';
import styles from './StatusButton.module.css';

// 사용자 구독 목록 조회에서 구독 상태 버튼
export const StatusButton = ({ status, className, onClick }) => {
  const config = {
    ACTIVE: {
      label: '구독 중',
    },
    CANCELLED: {
      label: '구독 해지됨',
    },
    EXPIRED: {
      label: '구독 만료됨',
    },
  };

  const { label } = config[status];

  return (
    <div
      className={`${styles['status-button']} ${styles[status.toLowerCase()]} ${className || ''}`}
      style={{
        cursor: 'pointer',
      }}
      onClick={onClick}>
      <div className={styles['label']}>{label}</div>
    </div>
  );
};
