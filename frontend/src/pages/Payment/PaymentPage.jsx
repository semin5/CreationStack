// PaymentPage.jsx
import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import SubscriptionDetails from '../../components/Payment/SubscriptionDetails';
import PaymentModal from '../../components/Payment/PaymentModal';
import WarningModal from '../../components/Payment/WarningModal';
import { registerBillingKey, savePaymentMethod, readAllPaymentMethod, getUserInfo } from '../../api/payment';
import { getPublicCreatorProfile } from '../../api/profile';
import logo from '../../assets/img/logo.svg';

import styles from './PaymentPage.module.css';

function PaymentPage() {
  // 모달 열기/닫기 핸들러
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [isWarningModalOpen, setIsWarningModalOpen] = useState(false);
  const [modalType, setModalType] = useState('method-fail');
  const [selectedCard, setSelectedCard] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(true);
  const [cardData, setCards] = useState([]);
  const navigate = useNavigate();

  const openPayModal = () => setIsPayModalOpen(true);
  const closePayModal = () => setIsPayModalOpen(false);
  const openWarningModal = () => setIsWarningModalOpen(true);
  const closeWarningModal = () => setIsWarningModalOpen(false);

  const storeId = import.meta.env.VITE_STORE_ID;
  const channelKey = import.meta.env.VITE_CHANNEL_KEY;

  // 컴포넌트가 마운트될 때 카드 정보 불러오기
  useEffect(() => {
    const fetchCards = async () => {
      try {
        const accessToken = localStorage.getItem('accessToken');
        const res = await readAllPaymentMethod(accessToken); // API 호출
        setCards(res);
      } catch (err) {
        console.error('카드 정보를 불러오는 데 실패했습니다.', err);
      }
    };
    fetchCards();
  }, []); // 빈 배열 → 최초 한 번만 실행됨

  const { creatorNickname } = useParams();
  const [creator, setCreator] = useState(null);

  useEffect(() => {
    console.log(creatorNickname + "크리에이터에 대한 구독");
    const fetchCreator = async () => {
      const accessToken = localStorage.getItem('accessToken');
      try {
        const res = await getPublicCreatorProfile(creatorNickname, accessToken);
        console.log('API 응답 확인:', res);
        setCreator({
          id: res.data.userId,
          name: res.data.nickname,
          image: res.data.profileImageUrl || logo, // 기본값 일단 로고로 설정
        });
      } catch (err) {
        console.error('크리에이터 정보를 불러올 수 없습니다. : ', err);
      }
    };

    if (creatorNickname) fetchCreator();
  }, [creatorNickname]);

  if (!creator) return <div>크리에이터 정보를 찾을 수 없습니다.</div>;

  const subscriptionDetails = [
    { label: '구독 상품', value: creator.nickname } + '정기 구독권',
    { label: '가격', value: '₩4,900/월', highlight: true },
    { label: '총 결제 금액', value: '₩4,900', bold: true },
  ];

  const benefits = ['독점 콘텐츠 제공', '광고 제거', '라이브 방송 참여'];

  // 결제 진행 버튼 클릭
  const handlePayClick = () => {
    if (cardData.length === 0) {
      // 카드가 없으면 경고 모달 띄움
      setIsWarningModalOpen(true);
      setModalType('method-fail');
    } else {
      // 카드 있으면 결제 모달 열기
      setIsPayModalOpen(true);
    }
  };

  // 결제수단 등록
  const handleCardRegister = async () => {
    try {
      const accessToken = localStorage.getItem('accessToken');
      const userInfoResponse = await getUserInfo(accessToken);
      alert(userInfoResponse.username);
      const issueResponse = await registerBillingKey(
        storeId,
        channelKey,
        userInfoResponse.data.username,
        userInfoResponse.data.email
      );
      const saveResponse = await savePaymentMethod(issueResponse.billingKey, accessToken);

      // 카드 객체에서 username 제외
      const { username, ...cardWithoutUsername } = saveResponse;

      // 카드 리스트에 추가
      setCards([...cards, cardWithoutUsername]);

      // 모달 상태 전환
      setModalType('register-success');
      setIsWarningModalOpen(true);
    } catch (error) {
      setModalType('register-fail');
      setSelectedCard(null);
      setIsWarningModalOpen(true);
    }
  };

  // 결제 성공 시 결제완료 페이지 이동
  const handlePaymentSuccess = () => {
    navigate('/payments/success', {
      state: { creator },
    });
  };

  // 결제 실패 시 결제 실패 모달창 호출
  const handlePaymentFailure = () => {
    setIsPayModalOpen(false); // PaymentModal 닫기
    setModalType('payment-fail'); // WarningModal 메시지 타입 지정
    setIsWarningModalOpen(true); // WarningModal 열기
  };

  const handlePaymentMethod = () => {
    navigate('/payments');
  };

    const handleCreatorPage = () => {
navigate(`/creator-main/${creatorNickname}`, { replace: true });
  }

  return (
    <div className={styles.summary_container}>
      <div className={styles.card}>
        <div className={styles.card_content}>
          {/* Header */}
          <div className={styles.summary_header}>
            <h1 className={styles.summary_title}>결제 요약</h1>
            <p className={styles.summary_subtitle}>구독 정보를 확인하고 결제를 진행하세요</p>
          </div>

          {/* Creator Information */}
          <div className={styles.creator_info}>
            <img className={styles.creator_image} src={creator.image} alt="Creator" />
            <div className={styles.creator_detail}>
              <p className={styles.creator_name}>{creator.name}</p>
              <p className={styles.creator_role}>크리에이터</p>
            </div>
          </div>

          <SubscriptionDetails subscriptionDetails={subscriptionDetails} benefits={benefits} />

          {/* Payment Alert */}
          <div className={styles.alert}>
            <span className={styles.alert_icon}>⚠️</span>
            <div>
              <h5 className={styles.alert_title}>결제 안내</h5>
              <div className={styles.alert_description}>
                구독은 자동 갱신되며, 언제든지 구독을 취소할 수 있습니다. 취소 시 현재 구독 기간이 끝날 때까지 서비스를
                이용할 수 있습니다.
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <button className={styles.registerPayMethodButton} onClick={handlePaymentMethod}>
            <span className={styles.icon}>→</span>
            <span>결제 수단 등록</span>
          </button>

          <button className={styles.payButton} onClick={handlePayClick}>
            <span className={styles.icon}>→</span>
            <span>결제 진행</span>
          </button>

          <button className={styles.backButton}>
            <span className={styles.icon}>←</span>
            <span onClick={handleCreatorPage}>이전으로</span>
          </button>
        </div>
      </div>

      {/* 모달 렌더링 */}
      <PaymentModal
        isOpen={isPayModalOpen}
        onClose={closePayModal}
        cardData={cardData}
        creator={creator}
        onSuccess={handlePaymentSuccess}
        onFailure={handlePaymentFailure}
      />

      {/* 결제수단 미등록 알림 모달 */}
      <WarningModal
        isOpen={isWarningModalOpen}
        onClose={closeWarningModal}
        type={modalType}
        isVisible={isModalVisible}
        onConfirm={handleCardRegister}
      />
    </div>
  );
}

export default PaymentPage;
