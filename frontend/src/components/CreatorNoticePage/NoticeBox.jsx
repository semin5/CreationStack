import React, { useEffect, useState } from 'react';
import styles from './NoticeBox.module.css';
import Picker from '@emoji-mart/react';
import { toggleReaction, getReactions } from '@/api/notice.js';

const NoticeBox = ({ notice, creator, showDate, loginUser }) => {
  const [reactions, setReactions] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [userEmoji, setUserEmoji] = useState(notice.userReactedEmoji || null);
  const [noticeId, setNoticeId] = useState(notice.noticeId || null);

  useEffect(() => {
    setReactions(notice.reactions || []);
    setUserEmoji(notice.userReactedEmoji || null);
  }, [notice.initialReactions, notice.userReactedEmoji]);

  const handleEmojiClick = async emoji => {
    try {
      await toggleReaction(noticeId, emoji);
      setUserEmoji(prev => (prev === emoji ? null : emoji));

      const updated = await getReactions(noticeId);
      setReactions(updated.data);
    } catch (error) {
      console.error('이모지 토글 실패:', error);
    }
  };

  const handlePickerSelect = emoji => {
    handleEmojiClick(emoji.native);
    setShowPicker(false);
  };

  const createdAt = new Date(notice.createdAt);
  const date = createdAt.toLocaleDateString('ko-KR');
  const time = createdAt.toTimeString().substring(0, 5);

  return (
    <div className={styles.notice}>
      {showDate && (
        <div className={styles.date}>
          <p>{date}</p>
        </div>
      )}
      <div className={styles.post_container}>
        <div className={styles.creator_img}>
          <img src={creator?.profileImageUrl} alt={`${creator?.nickname} 프로필 이미지`} />
        </div>
        <div className={styles.post_card}>
          <div className={styles.post_content_container}>
            <div className={styles.post_box}>
              <p className={styles.text}>{notice.content}</p>
            </div>
            {loginUser?.userId === creator?.userId && (
              <div className={styles.button_container}>
                <button className={styles.edit_button}>수정</button>
                <button className={styles.delete_button}>삭제</button>
              </div>
            )}
          </div>
          <div className={styles.post_footer}>
            <div className={styles.time}>{time}</div>
            <div className={styles.reaction}>
              {Array.isArray(reactions) &&
                reactions.map(reaction => (
                  <button
                    key={reaction.emoji}
                    onClick={() => handleEmojiClick(reaction.emoji)}
                    className={`${styles.emojiButton} ${reaction.emoji === userEmoji ? styles.active : ''}`}>
                    {reaction.emoji} {reaction.count}
                  </button>
                ))}
              <button className={styles.reaction_add_button} onClick={() => setShowPicker(prev => !prev)}>
                ➕
              </button>
              {showPicker && (
                <div className={styles.picker_container}>
                  <Picker onEmojiSelect={handlePickerSelect} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NoticeBox;
