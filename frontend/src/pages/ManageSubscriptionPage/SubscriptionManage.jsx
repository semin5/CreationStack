import React from 'react';
import { SubscribedCardsSection } from '../../components/ManageSubscriptionPage/SubscribedCardSection/SubscribedCardsSection';
import { Pagination } from '../../components/pagination';

import styles from './SubscriptionManage.module.css';

export const SubscriptionManage = () => {
  return (
    <div className={styles['subscription-manage']} data-model-id="189:1560">
      <div className={styles['subscribe-list-title']}>구독 관리</div>

      <SubscribedCardsSection />
    </div>
  );
};