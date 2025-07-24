import React, { useEffect, useState } from 'react';
import axios from 'axios';

import { DashBoardSection } from './component/DashBoardSection';
import { PopularContent } from './component/PopularContent';
import { MyContent } from './component/MyContent';
import styles from './CreatorManagementPage.module.css'; // 페이지 전체 스타일

const CreatorManagementPage = () => {

  const token = localStorage.getItem('accessToken');
  const [creator, setCreator] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. 크리에이터 정보 불러오기
    axios
      .get(`/api/user/public/creator-manage`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then(res => {
        const data = res.data;
        setCreator(data);
      })
      .catch(err => {
        console.error('크리에이터 정보 불러오기 실패', err);
      })
      .finally(() => setLoading(false));
  }, []);

  if (loading || !creator) return <div>로딩 중...</div>;

  return (
    <div className={styles.creatorManagementPageContainer}>
      <DashBoardSection
        creator={{
          subscriberCount: creator.subsCount ?? 0,
          newsubscriberCount: creator.newSubsCount ?? 0,
        }}
      />
      <PopularContent/>
      <MyContent />
    </div>
  );
};

export default CreatorManagementPage;
