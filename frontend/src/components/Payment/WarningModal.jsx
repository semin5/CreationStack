import React from 'react';
import styles from './WarningModal.module.css';

const WarningModal = ({ isOpen, onClose, isVisible = true, cardData, type, onConfirm }) => {
  if (!isOpen) return null;

  let title = '';
  let message = '';
  let confirmText = '확인';
  let showCancel = false;
  let showConfirm = true;

  switch (type) {
    case 'confirm-delete': // 결제수단 삭제 재확인
      title = '정말로 결제수단을 삭제하시겠습니까?';
      message = (
        <>
          이 결제수단을 삭제하면 더 이상 해당 카드로 결제하실 수 없습니다.
          <br />
          정말로 삭제하시겠습니까?
        </>
      );
      confirmText = '삭제';
      showCancel = true;
      break;
    case 'delete-success': // 결제수단 삭제 완료
      title = '삭제가 완료되었습니다.';
      message = '선택하신 결제수단이 정상적으로 삭제되었습니다.';
      showCancel = false;
      break;
    case 'delete-fail':
      title = '결제수단을 삭제할 수 없습니다.';
      message = (
        <>
          해당 결제수단은 현재 구독 결제에 사용중이어서 삭제할 수 없습니다.
          <br />
          구독을 해지하거나 다른 결제수단으로 변경한 후 삭제해 주세요.
        </>
      );
      showCancel = false;
      break;
    case 'method-fail': // 결제수단 삭제 실패
      title = '결제수단이 등록되지 않았습니다.';
      message = (
        <>
          구독을 진행하려면 결제수단을 등록해야 합니다. <br />
          결제수단을 등록해주세요.
        </>
      );
      showCancel = false;
      break;
    case 'register-success': // 결제수단 등록 완료
      title = '결제수단이 등록되었습니다.';
      message = (
        <>
          결제수단 등록이 완료되었습니다.
          <br />
          결제를 진행해주세요.
        </>
      );
      showCancel = false;
      showConfirm = true;
      break;
    case 'register-fail': // 결제수단 등록 실패
      title = '결제수단 등록에 실패했습니다.';
      message = (
        <>
          결제수단 등록에 실패했습니다.
          <br />
          다시 시도해주세요.
        </>
      );
      showCancel = false;
      break;
    case 'payment-fail': // 결제 실패
      title = '결제 실패했습니다.';
      message = (
        <>
          결제 실패했습니다.
          <br />
          다른 결제수단으로 재결제 바랍니다.
        </>
      );
      showCancel = false;
      break;
    default:
      break;
  }

  return (
    <div className={styles.modalOverlay}>
      <div className={`${styles.modalContent} ${styles.warning_popup} ${isVisible ? styles.fadeIn : styles.fadeOut}`}>
        <div className={styles.modal}>
          <div className={styles.popupHeader}>
            <h2 className={styles.titleText}>{title}</h2>
          </div>
          <p className={styles.subText}>{message}</p>
          <div className={styles.separator} />
          <div className={styles.bottomButton}>
            {showCancel && (
              <button className={`${styles.button} ${styles.cancel}`} onClick={onClose}>
                취소
              </button>
            )}
            {showConfirm && (
              <button
                className={styles.button}
                onClick={() => {
                  if (type === 'confirm-delete') {
                    onConfirm?.(cardData); // optional chaining 사용
                  } else if (type === 'register-success' || type === 'register-fail') {
                    onClose();
                  } else if (type === 'delete-success' || type === 'delete-fail') {
                    onClose();
                  } else if (type === 'payment-fail' || type === 'method-fail') {
                    onClose();
                  } else {
                    onConfirm?.();
                    onClose();
                  }
                }}>
                {confirmText}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default WarningModal;
