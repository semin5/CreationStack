import axios from 'axios';
import PortOne from '@portone/browser-sdk/v2';
import { v4 as uuidv4 } from 'uuid';
axios.defaults.withCredentials = true;
/*
PortOne 관련 API
savePaymentMethod : 결제수단 DB 저장 API
requestIssueBillingKey : 포트원 빌링키 발급 SDK 요청
readAllPaymentMethod : 모든 결제수단 조회 API
deletePaymentMethod : 결제수단 삭제 API
requestPayment : 결제 요청 API
*/

// 등록된 모든 결제수단 조회 API
export const readAllPaymentMethod = async accessToken => {
  //accessToken 전달해서 인증하겠지만 지금은 userId 하드코딩
  try {
    const response = await axios.get('http://localhost:8080/api/payments', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  } catch (error) {
    return error;
  }
};

//등록된 결제수단 DB 저장 API
export const savePaymentMethod = async (billingKey, accessToken) => {
  try {
    const response = await axios.post(
      'http://localhost:8080/api/billings/card',
      {
        billingKey: billingKey,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

//포트원 SDK 호출(결제수단 등록)
export const registerBillingKey = async (storeId, channelKey, name, email) => {
  try {
    const customerId = `user-${uuidv4()}`;

    // 결제수단 사용자 정보
    const customer = {
      customerId: `user-${uuidv4()}`,
      fullName: name,
      email: email,
    };

    const response = await PortOne.requestIssueBillingKey({
      storeId: storeId, //상점 아이디. 포트원 계정에 생성된 상점 식별하는 고유값
      channelKey: channelKey, //채널 키. 포트원에 등록된 결제 채널
      billingKeyMethod: 'CARD', //빌링키 발급 수단
      issueName: '정기결제용 카드 등록', //카드 등록 목적
      issueId: `issue-${customerId}-${Date.now()}`, //카드 등록 요청에 대한 고유한 ID
      customer: customer, // 결제수단 사용자 정보
      offerPeriod: {
        interval: '1y', //유효기간 1년
      },
      popup: {
        center: true, //sdk 팝업 위치 center 고정
      },
    });
    return response;
  } catch (error) {
    throw error;
  }
};

// 결제수단 삭제 deleteCardMethod
export const deletePaymentMethod = async (paymentMethodId, reason, accessToken) => {
  try {
    const response = await axios.post(
      'http://localhost:8080/api/billings/keys',
      {
        paymentMethodId: paymentMethodId,
        reason: reason,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

// 현재 로그인한 사용자 정보 조회 API
export const getUserInfo = async accessToken => {
  // 현재 로그인한 사용자 정보 조회
  try {
    const response = await axios.get('http://localhost:8080/api/user/me', {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  } catch (error) {
    return error;
  }
};

// 결제 진행
export const requestPayment = async (paymentInfo, accessToken) => {
  try {
    const saveSubscription = await axios.post(
      'http://localhost:8080/api/subscriptions/pending',
      {
        paymentMethodId: paymentInfo.paymentMethodId,
        creatorId: paymentInfo.creatorId,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const savePayment = await axios.post(
      'http://localhost:8080/api/billings/payments',
      {
        paymentMethodId: paymentInfo.paymentMethodId,
        subscriptionId: saveSubscription.data.subscriptionId,
        amount: paymentInfo.amount,
        creatorId: saveSubscription.data.creatorId,
        orderName: paymentInfo.creatorNickname +'정기구독권',
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    const updateSubscriptionStatus = await axios.post(
      `http://localhost:8080/api/subscriptions/${saveSubscription.data.subscriptionId}/activate`,
      {
        paymentId: savePayment.data.paymentId,
      },
      {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    return updateSubscriptionStatus;
  } catch (error) {
    throw error;
  }
};
