import React from 'react';
import { Button } from '../../components/Member/Button';
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '../../components/Member/dialog';
import styles from './LeaveMemberModal.module.css';

export const LeaveMemberModal = ({ isOpen, onClose, onConfirm }) => {
  if (!isOpen) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[599px] p-0 shadow-[0px_2px_4px_#4318d133]">
        <div className="px-[35px] pt-[30px] pb-[35px]">
          <DialogTitle className={styles.title}>정말 탈퇴하시겠습니까?</DialogTitle>

          <DialogDescription className={styles.description}>
            탈퇴하시면 지금까지 구독한 정보가 삭제되어, <br />
            더이상 구독한 크리에이터의 콘텐츠를 볼 수 없습니다.
          </DialogDescription>

          <div className={styles.buttonContainer}>
            <Button variant="outline" className={styles.cancelButton} onClick={onClose}>
              취소
            </Button>

            <Button className={styles.confirmButton} onClick={onConfirm}>
              확인
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
