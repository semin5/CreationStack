import React from 'react';
import styles from './SubscriptionDetails.module.css';

function SubscriptionDetails({ subscriptionDetails, benefits }) {
  return (
    <>
      <div className={styles.subscription_detail}>
        {subscriptionDetails.map((detail, index) => (
          <div key={index} className={styles.detail_row}>
            <p className={styles.detail_label}>{detail.label}</p>
            <p
              className={
                detail.highlight ? styles.highlighted_value : detail.bold ? styles.bold_value : styles.detail_value
              }>
              {detail.value}
            </p>
            <div className={styles.separator} />
          </div>
        ))}
      </div>
      {/* Benefits List */}
      <div className={styles.benefits_box}>
        <h3 className={styles.benefits_title}>구독 혜택</h3>
        <ul className={styles.benefits_list}>
          {benefits.map((benefit, index) => (
            <li key={index} className={styles.benefit_item}>
              <span className={styles.check}>✔</span>
              <span>{benefit}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}

export default SubscriptionDetails;
