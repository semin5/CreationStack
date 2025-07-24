// components/PaymentModal.jsx
import React, { useEffect, useState, useRef, useLayoutEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { requestPayment } from '../../api/payment';
import styles from './PaymentModal.module.css';

const CARD_WIDTH = 480; // 카드 1개 너비(px)
const SWIPE_THRESHOLD = 250; // 슬라이드 전환 임계치

const PaymentModal = ({ isOpen, onClose, cardData, creator, onSuccess, onFailure }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
  const containerRef = useRef(null); // 👉 슬라이더 컨테이너 ref
  const [selectedCard, setSelectedCard] = useState(null);
  const startX = useRef(0);
  const [offset, setOffset] = useState(null);
  const cardRef = useRef(null);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : 'auto';
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);

  useLayoutEffect(() => {
    if (isOpen && containerRef.current && cardRef.current) {
      const containerWidth = containerRef.current.offsetWidth;
      const cardWidth = cardRef.current.offsetWidth;
      const calculatedOffset = (containerWidth - cardWidth) / 2;
      setOffset(calculatedOffset);
    }
  }, [isOpen, cardData.length]);
  /** Drag/Swipe Handlers */
  function handleDragStart(e) {
    setDragging(true);
    startX.current = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
  }
  function handleDragMove(e) {
    if (!dragging) return;
    const clientX = e.type.startsWith('touch') ? e.touches[0].clientX : e.clientX;
    setDragX(clientX - startX.current);
  }
  function handleDragEnd() {
    setDragging(false);
    if (dragX > SWIPE_THRESHOLD && currentIndex > 0) {
      setCurrentIndex(i => i - 1);
    } else if (dragX < -SWIPE_THRESHOLD && currentIndex < cardData.length - 1) {
      setCurrentIndex(i => i + 1);
    }
    setDragX(0);
  }

  const handlePayment = async () => {
    try {
      // 결제 요청에 필요한 정보 구성 (예시)
      const paymentInfo = {
        paymentMethodId: selectedCard.paymentMethodId, // id값이 있다고 가정
        amount: 4900, // 결제 금액 예시
        creatorNickname: creator.name,
        creatorId: creator.id
      };
      
      const accessToken = localStorage.getItem("accessToken");
      const result = await requestPayment(paymentInfo, accessToken);
      onSuccess();
    } catch (error) {
      onFailure();
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={`${styles.modalContent} ${styles.paymentMethodPopup}`} onClick={e => e.stopPropagation()}>
        <div className={styles.modal}>
          {/* 헤더 */}
          <div className={styles.popupHeader}>
            <div className={styles.titleText}>결제 방법</div>
            <div className={styles.cancelButton} onClick={onClose}>
              ×
            </div>
          </div>

          {/* --- 카드 슬라이더 --- */}
          <div
            className={styles.cardSliderContainer}
            onMouseDown={handleDragStart}
            onMouseMove={dragging ? handleDragMove : undefined}
            onMouseUp={handleDragEnd}
            onMouseLeave={dragging ? handleDragEnd : undefined}
            onTouchStart={handleDragStart}
            onTouchMove={handleDragMove}
            onTouchEnd={handleDragEnd}
            style={{ cursor: dragging ? 'grabbing' : 'grab' }}
            ref={containerRef}>

            <div
              className={styles.cardSliderTrack}
              style={{
                transform: `translateX(${-currentIndex * CARD_WIDTH + dragX + (offset ?? 0)}px)`,
                transition: dragging ? 'none' : 'transform 0.4s cubic-bezier(.39,.58,.57,1.13)',
              }}>
              {cardData.map((card, idx) => (
                <div
                  className={styles.cardItem}
                  key={idx}
                  ref={idx === 0 ? cardRef : null}
                  onClick={() => setSelectedCard(card)}>
                  <div className={styles.cardContent}>
                    <div className={styles.cardName}>{card.cardName}</div>
                    <div className={styles.cardNumber}>{card.cardNumber}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 선택된 카드 */}
          <div className={styles.selectedCardInfo}>
            <p className={styles.selectedLabel}>선택된 카드</p>
            {selectedCard ? (
              <div className={`${styles.selectedCardBox} ${selectedCard ? styles.active : ''}`}>
                <div className={styles.selectedCardName}>{selectedCard.cardName}</div>
                <div className={styles.selectedCardNumber}>**** **** **** {selectedCard.cardNumber.slice(-4)}</div>
              </div>
            ) : (
              <div className={styles.selectedCardBox}>
                <div className={styles.selectedCardName}>카드를 선택해주세요</div>
                <div className={styles.selectedCardNumber}>----</div>
              </div>
            )}
          </div>

          {/* 결제 버튼 */}
          <div className={styles.bottomButton}>
            <button className={styles.button} onClick={handlePayment}>
              결제하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
