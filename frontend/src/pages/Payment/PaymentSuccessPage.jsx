import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import SubscriptionDetails from '../../components/Payment/SubscriptionDetails';
import styles from './PaymentPage.module.css';
import { useNavigate } from 'react-router-dom';

function PaymentSuccessPage() {
  const location = useLocation();
  const { creator } = location.state || {};
  const navigate = useNavigate();

  const subscriptionDetails = [
    { label: '구독 상품', value: creator.name+' 정기 구독권' },
    { label: '가격', value: '₩4,900/월', highlight: true },
    { label: '총 결제 금액', value: '₩4,900', bold: true },
  ];

  const benefits = ['독점 콘텐츠 제공', '광고 제거', '라이브 방송 참여'];

  const handleCreatorPage = () => {
navigate(`/creator-main/${creator.name}`, { replace: true });
  }

  return (
    <div className={styles.summary_container}>
      <div className={styles.card}>
        <div className={styles.card_content}>
          {/* Header */}
          <div className={styles.summary_header}>
            <h1 className={styles.summary_title}>결제 완료</h1>
            <p className={styles.summary_subtitle}>구독 정보를 확인하세요</p>
          </div>

          {/* Creator Information */}
          <div className={styles.creator_info}>
            <img className={styles.creator_image} src={creator.image} alt="Creator" />
            <div className={styles.creator_detail}>
              <p className={styles.creator_name}>{creator.name}</p>
              <p className={styles.creator_role}>크리에이터</p>
            </div>
          </div>

          <SubscriptionDetails subscriptionDetails={subscriptionDetails} benefits={benefits} />

          {/* Action Buttons */}
          <button className={styles.backButton}>
            <span className={styles.icon}>←</span>
            <span onClick={handleCreatorPage}>이전으로</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default PaymentSuccessPage;
