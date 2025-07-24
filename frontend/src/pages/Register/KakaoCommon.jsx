import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../../components/Member/Button';
import { Card, CardContent } from '../../components/Member/Card';
import { Input } from '../../components/Member/Input';
import { Label } from '../../components/Member/Label';
import { validateField } from '../../utils/validationUtils';
import styles from './KakaoCommon.module.css';
import { signupUser, checkNickname } from '../../api/auth.js';

export const KakaoCommon = ({ onBack, kakaoInfo }) => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    email: kakaoInfo?.email || '',
    name: '',
    nickname: kakaoInfo?.nickname || '',
  });

  const [nicknameStatus, setNicknameStatus] = useState({ message: '', isAvailable: null });
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const nickname = formData.nickname.trim();
    if (nickname.length < 2) {
      setNicknameStatus({ message: '', isAvailable: null });
      return;
    }
    const handler = setTimeout(async () => {
      try {
        const result = await checkNickname(nickname);
        setNicknameStatus({ message: result.message, isAvailable: result.available });
      } catch (error) {
        setNicknameStatus({ message: '확인 중 오류 발생', isAvailable: false });
      }
    }, 500);
    return () => clearTimeout(handler);
  }, [formData.nickname]);

  const handleInputChange = e => {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));

    if (id !== 'email') {
      const validation = validateField(id, value);
      setValidationErrors(prev => ({
        ...prev,
        [id]: validation.isValid ? '' : validation.message,
      }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    1;
    const nameValidation = validateField('name', formData.name);
    const nicknameValidation = validateField('nickname', formData.nickname);

    const errors = {};
    if (!nameValidation.isValid) errors.name = nameValidation.message;
    if (!nicknameValidation.isValid) errors.nickname = nicknameValidation.message;

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    if (nicknameStatus.isAvailable === false) {
      alert('이미 사용 중인 닉네임입니다. 다른 닉네임을 입력해주세요.');
      return;
    }

    if (!formData.name.trim()) {
      alert('이름을 입력해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const requestBody = {
        email: formData.email,
        username: formData.name.trim(),
        nickname: formData.nickname.trim(),
        role: 'USER',
        platform: 'KAKAO',
        platformId: kakaoInfo?.platformId,
      };

      const result = await signupUser(requestBody);

      if (result.success) {
        // response.ok → result.success 변경
        alert('카카오 계정으로 회원가입이 완료되었습니다!');

        if (result.data?.tokens) {
          localStorage.setItem('accessToken', result.data.tokens.accessToken);
          localStorage.setItem('refreshToken', result.data.tokens.refreshToken);
          navigate('/');
          window.location.reload();
        } else {
          navigate('/login');
        }
      } else {
        alert(`회원가입 실패: ${result.message}`);
      }
    } catch (error) {
      alert('회원가입 처리 중 오류가 발생했습니다.');
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLoginClick = () => {
    navigate('/login');
  };

  const formFields = [
    {
      id: 'email',
      label: '이메일 주소',
      value: formData.email,
      placeholder: '',
      required: false,
      disabled: true,
      isEmail: true,
    },
    {
      id: 'name',
      label: '이름',
      value: formData.name,
      placeholder: '이름을 입력해주세요',
      required: true,
    },
    {
      id: 'nickname',
      label: '닉네임',
      value: formData.nickname,
      placeholder: '닉네임을 입력해주세요',
      required: true,
    },
  ];

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <form onSubmit={handleSubmit}>
          <CardContent className={styles.cardContent}>
            {/* Header Section */}
            <div className={styles.header}>
              <div className={styles.titleSection}>
                <div className={styles.welcomeText}>
                  <span>Welcome to </span>
                  <span className={styles.brandName}>창조스택</span>
                </div>
                <div className={styles.mainTitle}>회원가입</div>
              </div>

              <div className={styles.loginSection}>
                <div className={styles.loginPrompt}>계정이 있으신가요?</div>
                <button type="button" className={styles.loginLink} onClick={handleLoginClick}>
                  로그인
                </button>
              </div>
            </div>

            {/* Form Fields */}
            <div className={styles.formFields}>
              {formFields.map(field => (
                <div key={field.id} className={styles.fieldContainer}>
                  <Label htmlFor={field.id} className={styles.fieldLabel}>
                    {field.label} {field.required && <span className={styles.required}>*</span>}
                  </Label>

                  {field.isEmail ? (
                    <div className={styles.emailDisplay}>{field.value}</div>
                  ) : (
                    <>
                      <Input
                        id={field.id}
                        value={field.value}
                        onChange={handleInputChange}
                        placeholder={field.placeholder}
                        disabled={field.disabled}
                        className={styles.input}
                        required={field.required}
                      />
                      {/* 유효성 검사 에러 메시지 */}
                      {validationErrors[field.id] && (
                        <span className={`${styles.statusMessage} ${styles.unavailable}`}>
                          {validationErrors[field.id]}
                        </span>
                      )}
                      {/* 닉네임 중복 확인 메시지 */}
                      {field.id === 'nickname' && nicknameStatus.message && !validationErrors[field.id] && (
                        <span
                          className={`${styles.statusMessage} ${
                            nicknameStatus.isAvailable ? styles.available : styles.unavailable
                          }`}>
                          {nicknameStatus.message}
                        </span>
                      )}
                    </>
                  )}
                </div>
              ))}
            </div>

            {/* Submit Section */}
            <div className={styles.submitSection}>
              <div className={styles.buttonContainer}>
                {onBack && (
                  <button type="button" className={styles.backButton} onClick={onBack}>
                    이전
                  </button>
                )}
                <Button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                  {isSubmitting ? '처리 중...' : '회원가입'}
                </Button>
              </div>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
};
