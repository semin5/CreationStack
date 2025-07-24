import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

import styles from './UserInfo.module.css';
import CreatorIcon from '../../../assets/img/creator-icon.svg';

// 사용자 메인페이지에서 사용자 정보
// 대상 페이지의 사용자가 크리에이터인지에따라 다르게 생성(로그인한 사용자 기준 아님)
export const UserInfo = ({ user, onUnsubscribeClick, onNoticeClick }) => {
  const { profileImage, nickname, bio, role, job, subscriberCount, isSubscribed } = user;

  const navigate = useNavigate();

  const handleSubscribeClick = e => {
    e.stopPropagation(); // 부모 div 클릭 막기
    if (isSubscribed) {
      onUnsubscribeClick?.(); // 모달 열기 (상위에서 상태 제어)
    } else {
      navigate(`/payments/summary/${encodeURIComponent(nickname)}`); // 결제 요약 페이지 이동
    }
  };
  const handleNoticeClick = e => {
    e.stopPropagation;
    if (isSubscribed) {
      navigate(`/creator/notice/${encodeURIComponent(nickname)}`);
    } else {
      onNoticeClick?.();
    }
  };

  return (
    <div className={styles.container}>
      {/* 프로필 이미지 */}
      <img src={profileImage} alt={`${nickname} 프로필`} className={styles.profileImage} />

      {/* 닉네임 */}
      <div className={styles.nicknameWrapper}>
        <span className={styles.nickname}>{nickname}</span>
        {role === 'CREATOR' && <img src={CreatorIcon} alt="크리에이터 뱃지" className={styles.creatorBadge} />}
      </div>

      {/* 크리에이터일 경우 구독자 수 / 직업 표시 */}
      {role === 'CREATOR' && (
        <>
          <div className={styles.subscriberCount}>구독자 수 {subscriberCount}명</div>
          <div className={styles.job}>{job}</div>
        </>
      )}

      {/* bio */}
      <p className={styles.bio}>{bio}</p>

      {/* 크리에이터일 경우 버튼 */}
      {role === 'CREATOR' && (
        <div className={styles.buttonGroup}>
          <button className={styles.noticeButton} onClick={handleNoticeClick}>
            공지방
          </button>
          <button className={styles.subscribeButton} onClick={handleSubscribeClick}>
            {isSubscribed ? '구독중' : '구독하기'}
          </button>
        </div>
      )}

      <hr className={styles.divider} />
    </div>
  );
};
