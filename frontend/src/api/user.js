import axios from 'axios';

const BASE_URL = 'http://localhost:8080';

async function requestApi(apiCall) {
  try {
    return await apiCall();
  } catch (error) {
    if (error.response && error.response.status === 403) {
      console.log('Access token expired. Attempting to refresh...');
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        if (!refreshToken) throw new Error('No refresh token found.');

        const refreshResponse = await axios.post(`${BASE_URL}/api/auth/refresh`, { refreshToken });
        const newAccessToken = refreshResponse.data.data.accessToken;
        const myProfile = await axios.get(`${BASE_URL}/api/user/me`, {
          headers: { Authorization: `Bearer ${newAccessToken}` },
        });
        localStorage.setItem('userId', myProfile.data.data.userId);

        localStorage.setItem('accessToken', newAccessToken);
        console.log('Token refreshed. Retrying original request...');

        error.config.headers['Authorization'] = `Bearer ${newAccessToken}`;
        return await axios(error.config);
      } catch (refreshError) {
        console.error('Failed to refresh token:', refreshError);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
}

export const getMyProfile = () => {
  return requestApi(() => {
    const accessToken = localStorage.getItem('accessToken');
    return axios.get(`${BASE_URL}/api/user/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  });
};

export const updateMyProfile = profileData => {
  return requestApi(() => {
    const accessToken = localStorage.getItem('accessToken');
    return axios.put(`${BASE_URL}/api/user/me`, profileData, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  });
};

export const deleteMyAccount = () => {
  return requestApi(() => {
    const accessToken = localStorage.getItem('accessToken');
    return axios.delete(`${BASE_URL}/api/user/me`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
  });
};
