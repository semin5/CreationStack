import { useNavigate } from 'react-router-dom';
import React, { useState } from 'react';
import { Card, CardContent } from '../../components/Member/Card';
import { Input } from '../../components/Member/Input';
import { Label } from '../../components/Member/Label';
import styles from './Login.module.css';
import logo from '../../assets/img/logo.svg'


export const LoginSection = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const leftSideContent = {
    title: '로그인',
    subtitle: '개발자 커뮤니티',
    description:
      '실무 경험과 지식을 공유하고 수익을 창출하며, 취업 준비생들이 이를 구독하여 실질적인 커리어 성장을 이룰 수 있도록 돕는 정적 콘텐츠 기반의 구독형 플랫폼입니다',
  };

  const handleInputChange = e => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // 실제 API 호출 (백엔드로 프록시됨)
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      if (response.ok) {
        const result = await response.json();
        const nickname = result.data.user.nickname;
        const accessToken = result.data.tokens.accessToken;
        const refreshToken = result.data.tokens.refreshToken;
        const userId = result.data.user.userId;

        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('userId', userId);

        alert(`${nickname}님 어서오세요.`);
        navigate('/');
        window.location.reload();
      } else {
        const error = await response.json();
        alert(`로그인 실패: ${error.message}`);
      }
    } catch (error) {
      alert('서버 오류가 발생했습니다.');
      console.error('Login error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKakaoLogin = () => {
    const KAKAO_REST_API_KEY = import.meta.env.VITE_KAKAO_REST_API_KEY;
    const KAKAO_REDIRECT_URI = import.meta.env.VITE_KAKAO_REDIRECT_URI;

    const kakaoLoginUrl = `https://kauth.kakao.com/oauth/authorize?client_id=${KAKAO_REST_API_KEY}&redirect_uri=${KAKAO_REDIRECT_URI}&response_type=code`;
    window.location.href = kakaoLoginUrl;
  };

  const handleSignupClick = () => {
    window.location.href = '/register';
  };

  return (
    <div className={styles.container}>
      <div className={styles.innerContainer}>
          {/* Blue background section */}
          <div className={styles.blueBackground} />
        <div className={styles.mainContent}>

          {/* Login card */}
          <Card className={styles.loginCard}>
            <CardContent className={styles.cardContent}>
              {/* Header section with welcome text and signup link */}
              <div className={styles.header}>
                <div className={styles.headerLeft}>
                  <div className={styles.welcomeText}>
                    <span>Welcome to </span>
                    <span className={styles.brandName}>창조스택</span>
                  </div>
                  <div className={styles.title}>로그인</div>
                </div>

                <div className={styles.headerRight}>
                  <div className={styles.signupPrompt}>계정이 없으신가요?</div>
                  <button className={styles.signupLink} onClick={handleSignupClick}>
                    회원가입
                  </button>
                </div>
              </div>

              {/* Kakao login button */}
              <button className={styles.kakaoButton} onClick={handleKakaoLogin}>
                <img
                  className={styles.kakaoIcon}
                  alt="Icon kakao"
                  src="https://c.animaapp.com/md45lq6rQTeTYg/img/icon---kakao.svg"
                />
                <span className={styles.kakaoText}>카카오로 로그인하기</span>
              </button>

              {/* Email and password inputs */}
              <form onSubmit={handleSubmit} className={styles.inputSection}>
                <div className={styles.inputContainer}>
                  <Label htmlFor="email" className={styles.inputLabel}>
                    이메일 주소
                  </Label>
                  <Input
                    id="email"
                    placeholder="이메일 주소를 입력해주세요"
                    className={styles.emailInput}
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                <div className={styles.inputContainer}>
                  <Label htmlFor="password" className={styles.inputLabel}>
                    비밀번호
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="비밀번호를 입력해주세요"
                    className={styles.passwordInput}
                    value={formData.password}
                    onChange={handleInputChange}
                    required
                  />
                </div>

                {/* Login button */}
                <button type="submit" className={styles.loginButton} disabled={isSubmitting}>
                  {isSubmitting ? '로그인 중...' : '로그인'}
                </button>
              </form>
            </CardContent>
          </Card>

          {/* Left side content with logo and description */}
          <div className={styles.leftSideContent}>
            <div className={styles.leftContentInner}>
              {/* Logo */}
              <div className={styles.logoSection}>
                <div className={styles.logoContainer}>
                  <div className={styles.logoInner}>
                    <img src={logo} />
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className={styles.contentSection}>
                <div className={styles.contentTitle}>
                  <div className={styles.titleText}>{leftSideContent.title}</div>
                </div>

                <div className={styles.subtitleContainer}>
                  <div className={styles.subtitleText}>{leftSideContent.subtitle}</div>
                </div>

                <div className={styles.descriptionContainer}>
                  <div className={styles.descriptionText}>{leftSideContent.description}</div>
                </div>
              </div>

              {/* Illustration */}
              <div className={styles.illustration}>
                <img
                  className={styles.illustrationImage}
                  alt="Saly"
                  src="https://c.animaapp.com/md45lq6rQTeTYg/img/saly-1.png"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
