// src/api/profile.js
import axios from 'axios';

export const getPublicCreatorProfile = async (nickname, accessToken) => {
  try {
    const response = await axios.get(`http://localhost:8080/api/user/public/${encodeURIComponent(nickname)}`, {
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response;
  } catch (error) {
    return error;
  }
};

export const getPublicUserProfile = async nickname => {
  try {
    const token = localStorage.getItem('accessToken');
    const headers = {
      'Content-Type': 'application/json',
    };
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }

    const response = await axios.get(`/api/user/public/${nickname}`, { headers });

    return response.data;
  } catch (error) {
    console.error('공개 프로필 조회 실패:', error);
    throw error;
  }
};
