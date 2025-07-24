import React, { useEffect, useState } from 'react';
import styles from './paymentMethodManagementPage.module.css';
import PaymentMethodList from '../../components/Payment/PaymentMethodList';
import WarningModal from '../../components/Payment/WarningModal';
import {
  registerBillingKey,
  savePaymentMethod,
  readAllPaymentMethod,
  deletePaymentMethod,
  getUserInfo
} from '../../api/payment';

function PaymentMethodManagementPage() {
  const [cards, setCards] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState('confirm-delete'); // 'confirm-delete', 'delete-success', 'delete-fail'
  const [selectedCard, setSelectedCard] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(true);

  const storeId = import.meta.env.VITE_STORE_ID;
  const channelKey = import.meta.env.VITE_CHANNEL_KEY;

  // 컴포넌트가 마운트될 때 카드 정보 불러오기
  useEffect(() => {
    const fetchCards = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const res = await readAllPaymentMethod(accessToken);
        setCards(res);
      } catch (err) {
        console.error('카드 정보를 불러오는 데 실패했습니다.', err);
      }
    };
    fetchCards();
  }, []); // 빈 배열 → 최초 한 번만 실행됨

  // 결제수단 삭제 여부 팝업
  const handleCardDeleteClick = card => {
    setSelectedCard(card);
    setModalType('confirm-delete');
    setIsModalOpen(true);
  };

  // 팝업 닫기
  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedCard(null);
    setModalType(''); // 혹은 null, '' 등 초기 상태로 변경
  };

  // 결제수단 삭제 확인 후 삭제진행 + 완료/실패 팝업
  const handleDeleteConfirm = async card => {
    // 기존 모달 닫기
    setIsModalVisible(false);
    const reason = card.cardName + '을 삭제합니다.';

    // 300ms 후 새 모달 보여주기 (애니메이션 타이밍)
    setTimeout(async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const response = await deletePaymentMethod(card.paymentMethodId, reason, accessToken);

        if (card.paymentMethodId === response.paymentMethodId) {
          setCards(prev => prev.filter(c => c.paymentMethodId !== card.paymentMethodId));
          setModalType('delete-success');
        }
      } catch (error) {
        setModalType('delete-fail');
      }
      setIsModalVisible(true);
    }, 300); // CSS 애니메이션과 맞춤
  };

  //빌링키 발급 후 결제수단 조회해 보여주는 메소드
  const handleCardRegister = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      // 빌링키 발급 위한 현재 로그인한 사용자의 정보 조회
      const userInfoResponse = await getUserInfo(accessToken);
      // 빌링키 발급
      const issueResponse = await registerBillingKey(
        storeId,
        channelKey,
        userInfoResponse.data.username,
        userInfoResponse.data.email
      );

      // 포트원에서 실패 응답을 반환한 경우 (성공했더라도 내부적으로 실패 코드 전달 가능)
      if (
        issueResponse.code === 'FAILURE_TYPE_PG' ||
        issueResponse.message?.includes('사용자') ||
        issueResponse.message?.includes('취소')
      ) {
        return; // 사용자 취소 또는 결제 실패 → 아무것도 하지 않음
      }

      // 발급된 빌링키 이용한 결제수단 조회 (빌링키 발급단계에서 이루어진 결제수단 조회)
      const saveResponse = await savePaymentMethod(issueResponse.billingKey, accessToken);

      // 회원이 추가한 결제수단을 cards에 저장
      const { username, ...cardWithoutUsername } = saveResponse;

      setCards(prev => [...prev, cardWithoutUsername]);
    } catch (error) {
      console.log(error);

      // 실제 실패만 모달 표시
      setModalType('method-fail');
      setSelectedCard(null);
      setIsModalVisible(true);
      setIsModalOpen(true);
    }
  };

  return (
    <div className={styles.payment_container}>
      {/* 결제수단관리 헤더 */}
      <div className={styles.header}>
        <p className={styles.title}>결제수단 관리</p>
        <p className={styles.sub_title}>등록된 결제수단을 관리하고 새로운 결제수단을 추가할 수 있습니다</p>
      </div>

      {/* 등록된 카드 리스트 */}
      <PaymentMethodList cards={cards} onDeleteCard={handleCardDeleteClick} />

      {/* 카드 등록 버튼 */}
      <div className={styles.register}>
        <button className={styles.register_button} onClick={handleCardRegister}>
          <p>카드 등록</p>
        </button>
      </div>

      {/* 결제수단 삭제 관련 모달창 */}
      <WarningModal
        isOpen={isModalOpen}
        onClose={closeModal}
        type={modalType}
        isVisible={isModalVisible}
        cardData={selectedCard}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
}

export default PaymentMethodManagementPage;
