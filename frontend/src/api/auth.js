import axios from 'axios';
const BASE_URL = 'http://localhost:8080';

export const logoutUser = async refreshToken => {
  return fetch('/api/auth/logout', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken }),
  });
};

export const checkNickname = async nickname => {
  const response = await fetch(`${BASE_URL}/api/user/check-nickname?nickname=${nickname}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};

export const signupUser = async userData => {
  const response = await fetch(`${BASE_URL}/api/user`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(userData),
  });

  const result = await response.json();
  if (!response.ok) {
    throw new Error(result.message || '회원가입에 실패했습니다.');
  }
  return result;
};

export const checkEmail = async email => {
  const response = await fetch(`${BASE_URL}/api/user/check-email?email=${email}`);
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
};
