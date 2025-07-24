import React, { useEffect, useState } from 'react';
import styles from './SubscribedCardsSection.module.css';
import { PaginatedGrid } from '../../UsePagination/PaginatedGrid';

import { CreatorInfo } from '../CreatorInfo/CreatorInfo';
import { getMySubscriptions } from '../../../api/subscription';
import logo from '../../../assets/img/logo.svg';

// 사용자 구독 목록 조회에서 크리에이터 정보 리스트 섹션
// className, creatorNickname, subsCount, bio, userStatus, date
export const SubscribedCardsSection = () => {
  const [creators, setCreators] = useState([]);

  useEffect(() => {
    const fetchSubscriptions = async () => {
      try {
        const subs = await getMySubscriptions();

        const mapped = subs
        .filter(sub => sub.statusName !== 'PENDING')
        .map(sub => ({
          subscriptionId: sub.subscriptionId,
          creatorNickname: sub.creatorNickname,
          profileImage: sub.creatorProfileUrl || logo,
          subsCount: sub.subsCount || 0,
          bio: sub.bio || "",
          userStatus: sub.statusName,
          date: sub.nextPaymentAt,
        }));

        setCreators(mapped);
      } catch (err) {
        console.error('구독 목록 불러오기 실패', err);
      }
    };

    fetchSubscriptions();
  }, []);

  return (
    <PaginatedGrid
      items={creators}
      itemsPerPage={5}
      wrapperClassName={styles['subscribed-card']}
      renderItem={(c) => (
        <CreatorInfo
          key={c.subscriptionId}
          subscriptionId={c.subscriptionId}
          className="profile-image"
          creatorNickname={c.creatorNickname}
          subsCount={c.subsCount}
          bio={c.bio}
          userStatus={c.userStatus}
          date={c.date}
          profileImage={c.profileImage}
        />
      )}
    />
  );
};
