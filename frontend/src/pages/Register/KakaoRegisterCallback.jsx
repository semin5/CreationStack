import React, { useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

const AuthCallback = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const accessToken = searchParams.get('accessToken');
    const refreshToken = searchParams.get('refreshToken');

    if (accessToken && refreshToken) {
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      navigate('/');
      window.location.reload();
    } else {
      alert('로그인에 실패하였습니다. 다시 시도해주세요.');
      navigate('/login');
    }
  }, [searchParams, navigate]);

  return <div>로그인 처리 중입니다...</div>;
};

export default AuthCallback;
