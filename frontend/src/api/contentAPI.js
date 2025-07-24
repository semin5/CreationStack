// src/api/contentApi.js
import axios from 'axios';

// 콘텐츠 생성 요청 api 함수
export async function createContent(formData) {
  try {
    const accessToken = localStorage.getItem('accessToken'); // accessToken 가져오기
    if (!accessToken) {
      throw new Error('로그인 토큰이 없습니다. 로그인이 필요합니다.');
    }

    const response = await axios.post(`/api/content`, formData, {
      headers: {
        // FormData 사용 시 Content-Type은 axios가 자동 설정
        Authorization: `Bearer ${accessToken}`, // Authorization 헤더 추가
      },
    });
    return response.data;
  } catch (error) {
    console.error('콘텐츠 생성 API 호출 실패:', error);
    throw error.response?.data || error;
  }
}
// 콘텐츠 상세보기
export async function getContentById(contentId) {
  try {
    const accessToken = localStorage.getItem('accessToken'); // accessToken 가져오기 (선택적)

    const headers = {
      'Content-Type': 'application/json',
    };
    if (accessToken) {
      // 토큰이 있을 경우에만 Authorization 헤더 추가
      headers.Authorization = `Bearer ${accessToken}`;
    }

    const response = await axios.get(`/api/content/${contentId}`, {
      headers: headers,
    });
    return response.data;
  } catch (error) {
    console.error(`콘텐츠 ID ${contentId} 조회 실패:`, error);
    throw error.response?.data || error;
  }
}

// 내 콘텐츠 목록 조회 API 호출 함수
export async function getMyContents() {
  try {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await axios.get('/api/content/my', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('내 콘텐츠 조회 실패:', error);
    throw error.response?.data || error;
  }
}

// 로그인한 크리에이터의 조회수 TOP 3 콘텐츠 조회 API
export async function getMyTopViewedContents() {
  try {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) {
      throw new Error('로그인이 필요합니다.');
    }

    const response = await axios.get('/api/content/my/top-viewed', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    return response.data;
  } catch (error) {
    console.error('조회수 TOP 3 콘텐츠 조회 실패:', error);
    throw error.response?.data || error;
  }
}

// 콘텐츠 수정
export async function updateContent(contentId, formData) {
  try {
    const accessToken = localStorage.getItem('accessToken'); // accessToken 가져오기
    if (!accessToken) {
      throw new Error('로그인 토큰이 없습니다. 로그인이 필요합니다.');
    }

    const response = await axios.put(`/api/content/${contentId}`, formData, {
      headers: {
        // FormData 사용 시 Content-Type은 axios가 자동 설정
        Authorization: `Bearer ${accessToken}`, // Authorization 헤더 추가
      },
    });
    return response.data;
  } catch (error) {
    console.error(`콘텐츠 ID ${contentId} 수정 실패:`, error);
    throw error.response?.data || error;
  }
}

// 콘텐츠 삭제
export async function deleteContent(contentId) {
  try {
    const accessToken = localStorage.getItem('accessToken'); // accessToken 가져오기
    if (!accessToken) {
      throw new Error('로그인 토큰이 없습니다. 로그인이 필요합니다.');
    }

    const response = await axios.delete(`/api/content/${contentId}`, {
      headers: {
        Authorization: `Bearer ${accessToken}`, // Authorization 헤더 추가
      },
    });
    return response.data; // 204 No Content의 경우 data는 비어있을 수 있습니다.
  } catch (error) {
    console.error(`콘텐츠 ID ${contentId} 삭제 실패:`, error);
    throw error.response?.data || error;
  }
}

// 특정 크리에이터의 콘텐츠 목록을 조회하는 API 호출 함수
export async function getContentsByCreator(creatorId, excludeContentId = null) {
  try {
    let url = `/api/content/creator/${creatorId}`;

    // excludeContentId를 숫자로 변환 시도. 유효한 숫자가 아니면 null로 설정.
    const numericExcludeId = Number(excludeContentId);
    const finalExcludeId = isNaN(numericExcludeId) ? null : numericExcludeId;

    if (finalExcludeId !== null) {
      url += `?excludeContentId=${finalExcludeId}`;
    }

    const response = await axios.get(url, {
      headers: {
        'Content-Type': 'application/json',
      },
    });
    return response.data;
  } catch (error) {
    console.error(`크리에이터 ID ${creatorId}의 콘텐츠 목록 조회 실패:`, error);
    throw error.response?.data || error;
  }
}

// 콘텐츠 접근 권한 확인
export const checkContentAccess = async contentId => {
  const token = localStorage.getItem('accessToken');
  return axios.get(`/api/content/${contentId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

//콘텐츠 좋아요
export async function toggleContentLike(contentId) {
  try {
    const accessToken = localStorage.getItem('accessToken');
    if (!accessToken) throw new Error('로그인이 필요합니다.');

    const response = await axios.post(`/api/content/${contentId}/like`, null, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error(`콘텐츠 ID ${contentId} 좋아요 토글 실패:`, error);
    console.error('좋아요 처리 실패:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
}
