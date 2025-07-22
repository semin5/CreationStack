import { useNavigate } from 'react-router-dom';
import { useState } from 'react';

import styles from './ContentCard.module.css';
import SubsIcon from '../../assets/img/subs_icon.svg';
import { UnauthorizedModal } from '../UnauthorizedModal';
import { checkContentAccess } from '../../api/contentAPI';

export const ContentCard = ({ contentId, thumbnailUrl, creatorNickname, title, likes, isPaid, categoryNames = [] }) => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);

  const handleCardClick = async () => {
    try {
      await checkContentAccess(contentId);
      navigate(`/content/${contentId}`);
    } catch (err) {
      if (err.response?.status === 403) {
        setShowModal(true);
      } else {
        console.error('콘텐츠 접근 오류: ', err);
      }
    }
  };

  return (
    <>
      <div onClick={handleCardClick} className={styles.card} style={{ cursor: 'pointer' }}>
        <div className={styles.thumbnailWrapper}>
          <img src={thumbnailUrl} alt={title} className={styles.thumbnail} />
          {isPaid && <img src={SubsIcon} alt="유료 콘텐츠" className={styles.subsIcon} />}
        </div>

        <div className={styles.contentInfo}>
          <div className={styles.creator}>{creatorNickname}</div>
          <div className={styles.title}>{title}</div>
          <div className={styles.meta}>
            <span className={styles.likes}>❤️ ({likes})</span>
            <div className={styles.categories}>
              {categoryNames.map((category, index) => (
                <span key={index} className={styles.category}>
                  {category}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {showModal && creatorNickname && (
        <UnauthorizedModal
        open={true} creatorNickname={creatorNickname}
        onClose={() => setShowModal(false)} />
      )}
    </>
  );
};

export default ContentCard;
