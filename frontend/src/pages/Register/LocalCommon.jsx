import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '../../components/Member/Card';
import { Input } from '../../components/Member/Input';
import { SimpleLabel } from '../../components/Member/SimpleLabel';
import { validateField, debounce } from '../../utils/validationUtils';
import { checkNickname, signupUser, checkEmail } from '../../api/auth';
import styles from './LocalCommon.module.css';

import Eye from '../../components/Member/Eye';
import EyeOff from '../../components/Member/EyeOff';

export const LocalCommon = ({ onBack }) => {
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    nickname: '',
    password: '',
    confirmPassword: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const [passwordVisibility, setPasswordVisibility] = useState({
    password: false,
    confirmPassword: false,
  });

  const [nicknameStatus, setNicknameStatus] = useState({
    message: '',
    isAvailable: null,
    isChecking: false,
  });

  const [emailStatus, setEmailStatus] = useState({
    message: '',
    isAvailable: null,
    isChecking: false,
  });

  const [validationErrors, setValidationErrors] = useState({});

  const [fieldStates, setFieldStates] = useState({});

  const debouncedNicknameCheck = useCallback(
    debounce(async nickname => {
      if (nickname.length < 2) {
        setNicknameStatus({ message: '', isAvailable: null, isChecking: false });
        return;
      }

      setNicknameStatus(prev => ({ ...prev, isChecking: true }));

      try {
        const result = await checkNickname(nickname);
        setNicknameStatus({
          message: result.message,
          isAvailable: result.available,
          isChecking: false,
        });
      } catch (error) {
        console.error('Nickname check failed:', error);
        setNicknameStatus({
          message: '확인 중 오류 발생',
          isAvailable: false,
          isChecking: false,
        });
      }
    }, 500),
    []
  );

  useEffect(() => {
    const nickname = formData.nickname.trim();
    if (nickname && !validationErrors.nickname) {
      debouncedNicknameCheck(nickname);
    } else {
      setNicknameStatus({ message: '', isAvailable: null, isChecking: false });
    }
  }, [formData.nickname, validationErrors.nickname, debouncedNicknameCheck]);

  const formFields = [
    {
      id: 'email',
      label: '이메일 주소',
      placeholder: '이메일 주소를 입력해주세요 (예: user@example.com)',
      required: true,
      hasButton: true,
      buttonText: '중복 확인',
    },
    {
      id: 'name',
      label: '이름',
      placeholder: '이름을 입력해주세요 (한글 또는 영문 2-20자)',
      required: true,
    },
    {
      id: 'nickname',
      label: '닉네임',
      placeholder: '닉네임을 입력해주세요 (2-10자)',
      required: true,
    },
    {
      id: 'password',
      label: '비밀번호',
      placeholder: '대소문자, 숫자, 특수문자 포함 8-20자',
      required: true,
      type: 'password',
    },
    {
      id: 'confirmPassword',
      label: '비밀번호 확인',
      placeholder: '비밀번호를 다시 입력해주세요',
      required: true,
      type: 'password',
    },
  ];

  const handleInputChange = e => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: value,
    }));

    setFieldStates(prev => ({
      ...prev,
      [id]: { ...prev[id], touched: true },
    }));

    if (id !== 'confirmPassword') {
      const validation = validateField(id, value);
      setValidationErrors(prev => ({
        ...prev,
        [id]: validation.isValid ? '' : validation.message,
      }));
    } else {
      if (formData.password && value && formData.password !== value) {
        setValidationErrors(prev => ({
          ...prev,
          confirmPassword: '비밀번호가 일치하지 않습니다',
        }));
      } else {
        setValidationErrors(prev => ({
          ...prev,
          confirmPassword: '',
        }));
      }
    }

    if (id === 'email') {
      setEmailStatus({ message: '', isAvailable: null, isChecking: false });
    }
  };

  const handleInputFocus = fieldId => {
    setFieldStates(prev => ({
      ...prev,
      [fieldId]: { ...prev[fieldId], focused: true },
    }));
  };

  const handleInputBlur = fieldId => {
    setFieldStates(prev => ({
      ...prev,
      [fieldId]: { ...prev[fieldId], focused: false, touched: true },
    }));
  };

  const togglePasswordVisibility = fieldId => {
    setPasswordVisibility(prev => ({
      ...prev,
      [fieldId]: !prev[fieldId],
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const allFieldStates = {};
    formFields.forEach(field => {
      allFieldStates[field.id] = { touched: true, focused: false };
    });
    setFieldStates(allFieldStates);

    const errors = {};

    const emailValidation = validateField('email', formData.email);
    const nameValidation = validateField('name', formData.name);
    const nicknameValidation = validateField('nickname', formData.nickname);
    const passwordValidation = validateField('password', formData.password);

    if (!emailValidation.isValid) errors.email = emailValidation.message;
    if (!nameValidation.isValid) errors.name = nameValidation.message;
    if (!nicknameValidation.isValid) errors.nickname = nicknameValidation.message;
    if (!passwordValidation.isValid) errors.password = passwordValidation.message;

    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = '비밀번호가 일치하지 않습니다';
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors);
      return;
    }

    if (emailStatus.isAvailable === false) {
      alert('이미 사용 중인 이메일입니다. 다른 이메일을 사용해주세요.');
      return;
    }

    if (nicknameStatus.isAvailable === false) {
      alert('이미 사용 중인 닉네임입니다. 다른 닉네임을 사용해주세요.');
      return;
    }

    setIsSubmitting(true);

    try {
      const userData = {
        email: formData.email.trim(),
        username: formData.name.trim(),
        nickname: formData.nickname.trim(),
        password: formData.password,
        role: 'USER',
      };

      const result = await signupUser(userData);
      console.log('result accesstoken: ', result.data.tokens.accessToken);
      alert('회원가입이 완료되었습니다!');
      window.location.href = '/login';
    } catch (error) {
      alert(`회원가입 실패: ${error.message}`);
      console.error('Registration error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const checkEmailDuplicate = async () => {
    const emailValidation = validateField('email', formData.email);
    if (!emailValidation.isValid) {
      setValidationErrors(prev => ({
        ...prev,
        email: emailValidation.message,
      }));
      setFieldStates(prev => ({
        ...prev,
        email: { touched: true },
      }));
      return;
    }

    setEmailStatus(prev => ({ ...prev, isChecking: true }));

    try {
      const result = await checkEmail(formData.email);
      setEmailStatus({
        message: result.message,
        isAvailable: result.available,
        isChecking: false,
      });
    } catch (error) {
      console.error('Email check error:', error);
      setEmailStatus({
        message: '확인 중 오류가 발생했습니다.',
        isAvailable: false,
        isChecking: false,
      });
    }
  };

  const handleLoginClick = () => {
    window.location.href = '/login';
  };

  const shouldShowError = fieldId => {
    return fieldStates[fieldId]?.touched && validationErrors[fieldId];
  };

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <CardContent className={styles.cardContent}>
          <div className={styles.header}>
            <div className={styles.headerLeft}>
              <div className={styles.welcomeText}>
                <span>Welcome to </span>
                <span className={styles.brandName}>창조스택</span>
              </div>
              <div className={styles.title}>회원가입</div>
            </div>
            <div className={styles.headerRight}>
              <div className={styles.loginPrompt}>계정이 있으신가요?</div>
              <button className={styles.loginLink} onClick={handleLoginClick}>
                로그인
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className={styles.formFields}>
              {formFields.map(field => (
                <div key={field.id} className={styles.fieldContainer}>
                  <div className={styles.labelWrapper}>
                    <SimpleLabel htmlFor={field.id} className={styles.fieldLabel}>
                      {field.label} {field.required && <span className={styles.required}>*</span>}
                    </SimpleLabel>

                    {/* 유효성 검사 에러 메시지 */}
                    {shouldShowError(field.id) && (
                      <span className={`${styles.statusMessage} ${styles.unavailable}`}>
                        {validationErrors[field.id]}
                      </span>
                    )}

                    {/* 이메일 중복 확인 메시지 */}
                    {field.id === 'email' && emailStatus.message && !shouldShowError(field.id) && (
                      <span
                        className={`${styles.statusMessage} ${
                          emailStatus.isAvailable ? styles.available : styles.unavailable
                        }`}>
                        {emailStatus.isChecking ? '확인 중...' : emailStatus.message}
                      </span>
                    )}

                    {/* 닉네임 중복 확인 메시지 */}
                    {field.id === 'nickname' && nicknameStatus.message && !shouldShowError(field.id) && (
                      <span
                        className={`${styles.statusMessage} ${
                          nicknameStatus.isAvailable ? styles.available : styles.unavailable
                        }`}>
                        {nicknameStatus.isChecking ? '확인 중...' : nicknameStatus.message}
                      </span>
                    )}
                  </div>

                  {field.hasButton ? (
                    <div className={styles.inputWithButton}>
                      <div className={styles.inputWrapper}>
                        <Input
                          id={field.id}
                          placeholder={field.placeholder}
                          className={`${styles.input} ${shouldShowError(field.id) ? styles.inputError : ''}`}
                          value={formData[field.id]}
                          onChange={handleInputChange}
                          onFocus={() => handleInputFocus(field.id)}
                          onBlur={() => handleInputBlur(field.id)}
                          required={field.required}
                        />
                      </div>
                      <button
                        type="button"
                        className={styles.duplicateCheckButton}
                        onClick={checkEmailDuplicate}
                        disabled={!formData.email || validationErrors.email || emailStatus.isChecking}>
                        {emailStatus.isChecking ? '확인 중...' : field.buttonText}
                      </button>
                    </div>
                  ) : (
                    <div className={styles.inputWrapperRegular}>
                      <Input
                        id={field.id}
                        type={
                          field.type === 'password'
                            ? passwordVisibility[field.id]
                              ? 'text'
                              : 'password'
                            : field.type || 'text'
                        }
                        placeholder={field.placeholder}
                        className={`${styles.input} ${shouldShowError(field.id) ? styles.inputError : ''}`}
                        value={formData[field.id]}
                        onChange={handleInputChange}
                        onFocus={() => handleInputFocus(field.id)}
                        onBlur={() => handleInputBlur(field.id)}
                        required={field.required}
                      />
                      {/* 비밀번호 필드일 경우 아이콘 버튼 추가 */}
                      {field.type === 'password' && (
                        <button
                          type="button"
                          onClick={() => togglePasswordVisibility(field.id)}
                          className={styles.passwordIcon}>
                          {passwordVisibility[field.id] ? (
                            <EyeOff size={20} color="#8D8D8D" />
                          ) : (
                            <Eye size={20} color="#8D8D8D" />
                          )}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className={styles.submitSection}>
              <div className={styles.buttonContainer}>
                {onBack && (
                  <button type="button" className={styles.backButton} onClick={onBack}>
                    이전
                  </button>
                )}
                <button type="submit" className={styles.submitButton} disabled={isSubmitting}>
                  {isSubmitting ? '처리 중...' : '회원가입'}
                </button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
