import React from 'react';
import styles from './UnifiedCreatorCard.module.css';
import { useNavigate } from 'react-router-dom';

export const UnifiedCreatorCard = ({ creator }) => {
  const navigate = useNavigate();

  const handleCardClick = async () => {
    navigate(`/creator-main/${creator.name}`);
  };

  return (
    <>
      <div onClick={handleCardClick} className={styles.creatorCard} style={{ cursor: 'pointer' }}>
        <div className={styles.profileImage} style={{ backgroundImage: `url(${creator.profileImageUrl})` }} />
        <div className={styles.textSection}>
          <div className={styles.name}>{creator.name}</div>
          <div className={styles.job}>{creator.job}</div>
          <div className={styles.subscriberCount}>구독자 수 {creator.subscriberCount}명</div>
          <p className={styles.description}>{creator.description}</p>
        </div>
      </div>
    </>
  );
};

export default UnifiedCreatorCard;
