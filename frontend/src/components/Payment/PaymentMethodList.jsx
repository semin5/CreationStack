import React, { useEffect, useState } from 'react';
import styles from './paymentMethod.module.css';

function formatCardNumber(number) {
  if (typeof number !== 'string') return '';
  return number.match(/.{1,4}/g).join('-');
}

function getCardCompanyLogo(company) {
  switch (company?.toUpperCase()) {
    case 'Shinhan Card':
    case '신한카드':
      return '/img/card_logo/shinhan_logo.png';
    case 'Hyundai Card':
    case '현대카드':
      return '/img/card_logo/hyundai_logo.png';
    case 'KB Kookmin Card':
    case '국민카드':
      return '/img/card_logo/kb_logo.png';
    case 'Hana Card':
    case '하나카드':
      return '/img/card_logo/hana_logo.png';
    case 'NH Nonghyup Card':
    case '농협카드':
      return '/img/card_logo/nh_logo.png';
    case 'BC Card':
    case '비씨카드':
      return '/img/card_logo/bc_logo.png';
    case 'Woori Card':
    case '우리카드':
      return '/img/card_logo/woori_logo.png';
    case 'Toss Bank':
    case '토스뱅크':
      return '/img/card_logo/toss_logo.png';
    case '카카오뱅크카드':
      return '/img/card_logo/kakao_logo.png';
    default:
      return '/img/default_card_logo.png';
  }
}

// 카드 리스트(결제수단관리))
function PaymentMethodList({ cards, onDeleteCard }) {
  return (
    <div className={styles.card_container}>
      {cards.length === 0 ? (
        <div className={styles.card_list_wrapper}>
          <div className={styles.card_box}>
            <p className={`${styles.card_box_text} ${styles.empty_message}`}>
              아래 카드 등록 버튼을 클릭해 결제 수단을 등록해주세요.
            </p>
          </div>
        </div>
      ) : (
        cards.map((card, idx) => (
          <div key={idx} className={styles.card_list_wrapper}>
            <div className={styles.card_box}>
              <div className={styles.card_logo}>
                <img src={getCardCompanyLogo(card.cardName)} alt={card.cardName} />
              </div>
              <p className={styles.card_box_text}>
                <strong>{card.cardName}</strong>
              </p>
              <p className={styles.card_box_text}>{formatCardNumber(card.cardNumber)}</p>

              <div className={styles.card_brand}>
                {card.cardBrand === 'MASTER' && <img src="/img/card_logo/mastercard_logo.png" alt="MasterCard" />}
                {card.cardBrand === 'VISA' && <img src="/img/card_logo/visa_logo.png" alt="Visa" />}
              </div>
            </div>
            <button className={styles.card_delete_button} onClick={() => onDeleteCard(card)}>
              삭제
            </button>
          </div>
        ))
      )}

      {/* {cards.length === 0 && <p>등록된 카드가 없습니다.</p>}
      {cards.map((card, idx) => (
        <div key={idx} className={styles.card_list_wrapper}>
          <div className={styles.card_box}>
            <div className={styles.card_logo}>
              <img src={getCardCompanyLogo(card.cardName)} alt={card.cardName} />
            </div>
            <p className={styles.card_box_text}>
              <strong>{card.cardName}</strong>
            </p>
            <p className={styles.card_box_text}>{formatCardNumber(card.cardNumber)}</p>

            <div className={styles.card_brand}>
              {card.cardBrand === 'MASTER' && <img src="/img/card_logo/mastercard_logo.png" alt="MasterCard" />}
              {card.cardBrand === 'VISA' && <img src="/img/card_logo/visa_logo.png" alt="Visa" />}
            </div>
          </div>
          <button className={styles.card_delete_button} onClick={() => onDeleteCard(card)}>
            삭제
          </button>
        </div>
      ))} */}
    </div>
  );
}

export default PaymentMethodList;
