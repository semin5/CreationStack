import axios from 'axios';

/**
 * 현재 로그인한 사용자의 구독 목록 조회
 * @returns {Promise} 구독 정보 배열
 */
export const getMySubscriptions = async () => {
  try {
    const accessToken = localStorage.getItem('accessToken');

    const response = await axios.get('/api/users/me/subscriptions', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data.subscriptions;
  } catch (err) {
    console.log('구독 목록 조회 실패: '. err);
    throw err;
  }
};

// 현재 로그인한 사용자의 구독한 크리에이터 목록 조회
export const getSubscribedCreators = async () => {
  try {

    const response = await axios.get('/api/users/me/subscriptions');

    return response.data.subscriptions;
  } catch (err) {
    console.log('크리에이터 목록 조회 실패: '. err);
    throw err;
  }
};

// 구독 해지
export const cancelSubscription = async (subscriptionId) => {
  try {
    const accessToken = localStorage.getItem('accessToken');
    const response = await axios.patch(`/api/subscriptions/${subscriptionId}`, null, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  } catch (err) {
    console.log('구독 해지 실패: '. err);
    throw err;
  }
};


// 구독한 크리에이터 목록 조회
export const getSubscriptionsByNickname = async (nickname) => {
  try {
    const response = await axios.get(`/api/users/${encodeURIComponent(nickname)}/subscriptions`);
    return response.data;
  } catch (error) {
    console.error('구독한 크리에이터 목록 조회 실패:', error);
    throw error;
  }
};