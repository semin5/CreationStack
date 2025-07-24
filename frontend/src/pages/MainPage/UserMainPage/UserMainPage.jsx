import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

import styles from './UserMainPage.module.css';
import { UserInfo } from '../../../components/MainPage/UserInfo/UserInfo';
import CreatorCardList from '../../../components/CreatorCard/CreatorCardList';
import logo from '../../../assets/img/logo.svg';
import { getPublicUserProfile } from '../../../api/profile';
import { getSubscriptionsByNickname } from '../../../api/subscription';

export const UserMainPage = () => {
  const { nickname } = useParams(); // URL에서 닉네임 추출
  const [user, setUser] = useState(null);
  const [creators, setCreators] = useState([]);

  useEffect(() => {
    if (!nickname) return;

    const fetchUserData = async () => {
      try {
        const userData = await getPublicUserProfile(nickname);
        setUser(userData);
        const creatorsData = await getSubscriptionsByNickname(userData.nickname);
        setCreators(creatorsData);
      } catch (error) {
        console.error('사용자 정보 또는 구독 목록 불러오기 실패', error);
      }
    };

    fetchUserData();
  }, [nickname]);

  if (!user || !creators) return null;

  return (
    <div className={styles.userMainPage}>
      <UserInfo
        user={{
          profileImage: user.profileImageUrl ?? logo,
          nickname: user.nickname,
          bio: user.bio,
        }}
      />
      <div className={styles.content}>
        <h1 className={styles.title}>구독한 크리에이터 목록</h1>
        <CreatorCardList creators={creators} />
      </div>
    </div>
  );
};
