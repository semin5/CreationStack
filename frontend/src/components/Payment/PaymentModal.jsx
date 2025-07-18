// components/PaymentModal.jsx
import React, { useEffect,useState, useRef, useLayoutEffect } from "react";
import styles from "./PaymentModal.module.css";



const CARD_WIDTH = 480; // 카드 1개 너비(px)
const SWIPE_THRESHOLD = 250; // 슬라이드 전환 임계치

const PaymentModal = ({ isOpen, onClose, cardData }) => {
const [currentIndex, setCurrentIndex] = useState(0);
  const [dragX, setDragX] = useState(0);
  const [dragging, setDragging] = useState(false);
const containerRef = useRef(null); // 👉 슬라이더 컨테이너 ref
  const startX = useRef(0);
const [offset, setOffset] = useState(null);
const cardRef = useRef(null);
useEffect(() => {
  document.body.style.overflow = isOpen ? "hidden" : "auto";
  return () => {
    document.body.style.overflow = "auto";
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
    startX.current = e.type.startsWith("touch")
      ? e.touches[0].clientX
      : e.clientX;
  }
  function handleDragMove(e) {
    if (!dragging) return;
    const clientX = e.type.startsWith("touch")
      ? e.touches[0].clientX
      : e.clientX;
    setDragX(clientX - startX.current);
  }
  function handleDragEnd() {
    setDragging(false);
    if (dragX > SWIPE_THRESHOLD && currentIndex > 0) {
      setCurrentIndex((i) => i - 1);
    } else if (dragX < -SWIPE_THRESHOLD && currentIndex < cardData.length - 1) {
      setCurrentIndex((i) => i + 1);
    }
    setDragX(0);
  }

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={`${styles.modalContent} ${styles.paymentMethodPopup}`}
        onClick={(e) => e.stopPropagation()}
      >
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
                      ref={containerRef} 
          >
            {/* <div
              className={styles.cardSliderTrack}
              style={{
                transform: `translateX(${-currentIndex * CARD_WIDTH + dragX + offset}px)`,
                transition: dragging ? 'none' : 'transform 0.4s cubic-bezier(.39,.58,.57,1.13)',
              }}
            >
              {cardData.map((card, idx) => (
                <div className={styles.cardItem} key={idx}>
                  <div className={styles.cardContent}>
                    <div className={styles.cardBrand}>{card.brand}</div>
                    <div className={styles.cardNumber}>{card.number}</div>
                    <div className={styles.cardExpired}>유효기간: {card.expired}</div>
                  </div>
                </div>
              ))}
            </div> */}
                      
<div
  className={styles.cardSliderTrack}
  style={{
    transform: `translateX(${-currentIndex * CARD_WIDTH + dragX + (offset ?? 0)}px)`,
    transition: dragging ? 'none' : 'transform 0.4s cubic-bezier(.39,.58,.57,1.13)',
  }}
>
  {cardData.map((card, idx) => (
    <div className={styles.cardItem} key={idx} ref={idx === 0 ? cardRef : null}>
      <div className={styles.cardContent}>
        <div className={styles.cardBrand}>{card.brand}</div>
        <div className={styles.cardNumber}>{card.number}</div>
        <div className={styles.cardExpired}>유효기간: {card.expired}</div>
      </div>
    </div>
  ))}
</div>
          </div>

          {/* 선택된 카드 */}
          <div className={styles.selectedCardInfo}>
            <p className={styles.selectedLabel}>선택된 카드</p>
            <div className={styles.selectedCardBox}>
              <div className={styles.selectedCardName}>신한은행</div>
              <div className={styles.selectedCardNumber}>**** **** **** 1234</div>
            </div>
          </div>

          {/* 결제 버튼 */}
          <div className={styles.bottomButton}>
            <button className={styles.button} onClick={() => alert("결제 진행")}>
              결제하기
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;