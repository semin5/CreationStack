// src/api/likeList.js
import axios from 'axios';

const likeListApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '',
  withCredentials: true,
});

// 인터셉터: 토큰 자동 설정
likeListApi.interceptors.request.use(config => {
  const accessToken = localStorage.getItem('accessToken');
  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }
  return config;
});

// 좋아요한 콘텐츠 목록 조회
export const fetchLikedContents = async page => {
  const response = await likeListApi.get('/api/content/liked', {
    params: {
      page,
    },
  });
  return response.data;
};

// 좋아요 취소 (토글 API)
export const toggleLikeContent = async (contentId, userId) => {
  const response = await likeListApi.post(`/api/content/${contentId}/like`, null, {
    params: { userId },
  });
  return response.data;
};
