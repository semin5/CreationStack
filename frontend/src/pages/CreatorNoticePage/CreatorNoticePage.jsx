import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import styles from './CreatorNoticePage.module.css';
import NoticeBox from '../../components/CreatorNoticePage/NoticeBox';
import { getNotices, getReactions, saveNotice, updateNotice, deleteNotice } from '../../api/notice';
import { getPublicCreatorProfile } from '../../api/profile';
import { getMySubscriptions } from '../../api/subscription';
import { getMyProfile } from '../../api/user';

function CreatorNoticePage() {
  const { creatorNickname } = useParams();
  const [notices, setNotices] = useState([]);
  const [creator, setCreator] = useState(null);
  const [loginUser, setLoginUser] = useState(null);

  useEffect(() => {
    fetchCreatorInfo();
    fetchLoginUser();
  }, []);

  useEffect(() => {
    if (creator) {
      fetchNotices();
    }
  }, [creator]);

  const fetchLoginUser = async () => {
    try {
      const res = await getMyProfile();
      setLoginUser(res.data.data);
    } catch (err) {
      console.error('로그인 사용자 정보 불러오기 실패', err);
    }
  };

  const fetchCreatorInfo = async () => {
    try {
      const res = await getPublicCreatorProfile(creatorNickname);
      setCreator(res.data);
    } catch (err) {
      console.error('크리에이터 정보 불러오기 실패', err);
    }
  };

  const fetchNotices = async () => {
    try {
      if (!creator) return;
      const noticeListRes = await getNotices(creator.userId);
      const noticeList = noticeListRes.data;

      const noticesWithReactions = await Promise.all(
        noticeList.map(async notice => {
          try {
            const reactionRes = await getReactions(notice.noticeId);
            const userReacted = reactionRes.data.find(r => r.reacted === true);

            return {
              ...notice,
              reactions: reactionRes.data,
              userReactedEmoji: userReacted ? userReacted.emoji : null,
            };
          } catch (err) {
            console.error(`리액션 로딩 실패 (noticeId: ${notice.noticeId})`, err);
            return {
              ...notice,
              reactions: [],
              userReactedEmoji: null,
            };
          }
        })
      );

      setNotices(noticesWithReactions);
    } catch (error) {
      console.error('공지 및 리액션 불러오기 실패:', error);
    }
  };

  // // 작성
  // const handleCreate = async () => {
  //   try {
  //     await saveNotice(creatorId, newNotice);
  //     alert('공지 작성 완료');
  //     setIsWriting(false);
  //     setNewNotice({ title: '', content: '', thumbnailUrl: '' });
  //     fetchNotices();
  //   } catch (err) {
  //     console.error('작성 실패', err);
  //   }
  // };

  // // 수정
  // const handleUpdate = async (noticeId, updatedNotice) => {
  //   try {
  //     await updateNotice(creatorId, noticeId, updatedNotice);
  //     alert('수정 완료');
  //     fetchNotices();
  //   } catch (err) {
  //     console.error('수정 실패', err);
  //   }
  // };

  // // 삭제
  // const handleDelete = async noticeId => {
  //   try {
  //     await deleteNotice(creatorId, noticeId);
  //     alert('삭제 완료');
  //     fetchNotices();
  //   } catch (err) {
  //     console.error('삭제 실패', err);
  //   }
  // };

  return (
    <div className={styles.notice_page}>
      {/* 크리에이터 섹션*/}
      <div className={styles.container}>
        {/* 프로필 이미지 */}
        {creator && (
          <>
            <div className={styles.profileWrapper}>
              <img src={creator.profileImageUrl} alt={`${creator.nickname} 프로필`} className={styles.profileImage} />
            </div>

            <div className={styles.nicknameWrapper}>
              <span className={styles.nickname}>{creator.nickname}</span>
            </div>

            <div className={styles.subscriberCount}>구독자 수 {creator.subscriberCount ?? 0}명</div>
            {creator.jobName && <div className={styles.subscriberCount}>직업: {creator.jobName}</div>}
            <p className={styles.bio}>{creator.bio}</p>
          </>
        )}
        {/* 크리에이터일 경우 버튼 */}
        {creator && loginUser && creator.userId === loginUser.userId && (
          <div className={styles.buttonGroup}>
            <button className={styles.write_button}>작성하기</button>
          </div>
        )}
      </div>

      {/*notice section*/}
      <div className={styles.notice_container}>
        {notices.map((notice, index) => {
          const createdAt = new Date(notice.createdAt);
          const currentDate = createdAt.toISOString().split('T')[0];

          const prevNotice = index > 0 ? notices[index - 1] : null;
          const prevDate = prevNotice ? new Date(prevNotice.createdAt).toISOString().split('T')[0] : null;

          const showDate = currentDate !== prevDate;
          console.log('creator:', creator);
          console.log('loginUser:', loginUser);

          return (
            <NoticeBox
              key={notice.noticeId}
              notice={notice}
              creator={creator}
              loginUser={loginUser}
              showDate={showDate}
            />
          );
        })}
      </div>
    </div>
  );
}

export default CreatorNoticePage;
