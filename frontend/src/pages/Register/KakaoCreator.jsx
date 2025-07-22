import { ChevronDownIcon } from 'lucide-react';
import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Button } from '../../components/Member/Button';
import { Card, CardContent } from '../../components/Member/Card';
import { Input } from '../../components/Member/Input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/Member/Select';
import { validateField } from '../../utils/validationUtils';
import styles from './KakaoCreator.module.css';

export const KakaoCreator = ({ onBack, kakaoInfo }) => {
  const navigate = useNavigate();

  // kakaoInfo가 props로 전달되는 경우와 location.state로 전달되는 경우 모두 처리
  const location = useLocation();
  const initialInfo = kakaoInfo || location.state || {};

  const [formData, setFormData] = useState({
    email: initialInfo.email || '',
    name: '', // 이름은 직접 입력받음
    nickname: initialInfo.nickname || '',
    jobId: '',
  });

  const [jobs, setJobs] = useState([]);
  const [nicknameStatus, setNicknameStatus] = useState({ message: '', isAvailable: null });
  const [validationErrors, setValidationErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 직업 목록 불러오기
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('/api/jobs');
        if (response.ok) {
          const result = await response.json();
          setJobs(result.data || []);
        }
      } catch (error) {
        console.error('직업 목록 요청 중 오류 발생:', error);
      }
    };
    fetchJobs();
  }, []);

  // 닉네임 중복 확인
  useEffect(() => {
    const nickname = formData.nickname.trim();
    if (nickname.length < 2) {
      setNicknameStatus({ message: '', isAvailable: null });
      return;
    }
    const handler = setTimeout(async () => {
      try {
        const response = await fetch(`/api/user/check-nickname?nickname=${nickname}`);
        const result = await response.json();
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

    // 실시간 유효성 검사
    if (id !== 'email') {
      const validation = validateField(id, value);
      setValidationErrors(prev => ({
        ...prev,
        [id]: validation.isValid ? '' : validation.message,
      }));
    }
  };

  const handleJobChange = value => {
    setFormData(prev => ({ ...prev, jobId: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    if (nicknameStatus.isAvailable === false) {
      alert('이미 사용 중인 닉네임입니다. 다른 닉네임을 입력해주세요.');
      return;
    }
    if (!formData.name || !formData.jobId) {
      alert('이름과 직업을 모두 입력해주세요.');
      return;
    }

    setIsSubmitting(true);
    try {
      // 백엔드에 회원가입 요청 (일반 회원가입 API 사용)
      const response = await fetch('/api/user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          username: formData.name,
          nickname: formData.nickname,
          password: 'KAKAO_USER', // 카카오 사용자는 임시 비밀번호
          role: 'CREATOR',
          jobId: parseInt(formData.jobId),
          platform: 'KAKAO',
          platformId: initialInfo.platformId,
        }),
      });

      const result = await response.json();
      if (response.ok) {
        alert('카카오 계정으로 회원가입이 완료되었습니다!');
        navigate('/login');
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

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <form onSubmit={handleSubmit}>
          <CardContent className={styles.cardContent}>
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
                <button type="button" className={styles.loginLink} onClick={() => navigate('/login')}>
                  로그인
                </button>
              </div>
            </div>

            <div className={styles.formContainer}>
              {/* Email Field */}
              <div className={styles.fieldContainer}>
                <label className={styles.fieldLabel}>이메일 주소</label>
                <div className={styles.emailDisplay}>{formData.email}</div>
              </div>

              {/* Name Field */}
              <div className={styles.fieldContainer}>
                <label htmlFor="name" className={styles.fieldLabel}>
                  <span>이름 </span>
                  <span className={styles.required}>*</span>
                </label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="이름을 입력해주세요"
                  required
                />
                {validationErrors.name && (
                  <span className={`${styles.statusMessage} ${styles.unavailable}`}>{validationErrors.name}</span>
                )}
              </div>

              {/* Nickname Field */}
              <div className={styles.fieldContainer}>
                <label htmlFor="nickname" className={styles.fieldLabel}>
                  <span>닉네임 </span>
                  <span className={styles.required}>*</span>
                </label>
                <Input
                  id="nickname"
                  value={formData.nickname}
                  onChange={handleInputChange}
                  className={styles.input}
                  placeholder="닉네임을 입력해주세요"
                  required
                />
                {validationErrors.nickname && (
                  <span className={`${styles.statusMessage} ${styles.unavailable}`}>{validationErrors.nickname}</span>
                )}
                {nicknameStatus.message && !validationErrors.nickname && (
                  <span
                    className={`${styles.statusMessage} ${
                      nicknameStatus.isAvailable ? styles.available : styles.unavailable
                    }`}>
                    {nicknameStatus.message}
                  </span>
                )}
              </div>

              {/* Occupation Field */}
              <div className={styles.fieldContainer}>
                <label className={styles.fieldLabel}>
                  <span>직업 </span>
                  <span className={styles.required}>*</span>
                </label>
                <Select value={formData.jobId} onValueChange={handleJobChange}>
                  <SelectTrigger className={styles.selectTrigger}>
                    <SelectValue placeholder="직업을 선택해주세요" />
                  </SelectTrigger>
                  <SelectContent side="top" sideOffset={4}>
                    {jobs.map(job => (
                      <SelectItem key={job.jobId} value={String(job.jobId)}>
                        {job.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {validationErrors.jobId && (
                  <span className={`${styles.statusMessage} ${styles.unavailable}`}>{validationErrors.jobId}</span>
                )}
              </div>
            </div>

            {/* Button Container */}
            <div className={styles.buttonContainer}>
              {onBack && (
                <button type="button" className={styles.backButton} onClick={onBack}>
                  이전
                </button>
              )}
              <Button type="submit" className={styles.signUpButton} disabled={isSubmitting}>
                {isSubmitting ? '처리 중...' : '회원가입'}
              </Button>
            </div>
          </CardContent>
        </form>
      </Card>
    </div>
  );
};
