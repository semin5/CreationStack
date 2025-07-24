import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './UnifiedCreatorCard.module.css';

const UnifiedCreatorCard = ({ creator }) => {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate(`/creator-main/${creator.name}`);
  };

  return (
    <div className={styles.creatorCard} onClick={handleClick}>
      <div
        className={styles.profileImage}
        style={{ backgroundImage: `url(${creator.profileImageUrl})` }}
      />
      <div className={styles.textSection}>
        <div className={styles.name}>{creator.name}</div>
        <div className={styles.job}>{creator.job}</div>
        <div className={styles.subscriberCount}>
          구독자 수 {creator.subscriberCount}명
        </div>
        <p className={styles.description}>{creator.description}</p>
      </div>
    </div>
  );
};

export default UnifiedCreatorCard;
