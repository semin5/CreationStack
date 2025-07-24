import React from 'react';
import styles from '../../../pages/CreatorManagement/CreatorManagementPage.module.css'; // 페이지 CSS 임포트

export const DashBoardSection = ({ creator }) => {
  const { subscriberCount, newsubscriberCount } = creator;
  return (
    <div className={styles.dashBoardSection}>
      <div className={styles.dashBoardTitle}>크리에이터 대시보드</div>

      <div className={styles.cardsContainer}>
        <div className={styles.memberCountCard}>
          <div className={styles.overlapGroupCard}>
            <div className={styles.cardTitle}>구독자 수</div>
            <div className={styles.countText}>{subscriberCount}</div>
          </div>
        </div>

        <div className={styles.newSubscriberCard}>
          <div className={styles.overlapGroupCard}>
            <div className={styles.cardTitle}>신규 구독자 수</div>
            <div className={styles.countText2}>{newsubscriberCount}</div> {/* countText2 사용 */}
          </div>
        </div>

        <div className={styles.profitCard}>
          <div className={styles.overlapGroupCard}>
            <div className={styles.cardTitle}>이번 달 수익</div>
            <div className={styles.profitText}>18,750,000</div>
          </div>
        </div>
      </div>
    </div>
  );
};
