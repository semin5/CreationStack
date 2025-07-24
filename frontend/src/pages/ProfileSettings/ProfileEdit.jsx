import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import styles from './ProfileEdit.module.css';
import { Button } from '../../components/Member/Button';
import { Input } from '../../components/Member/Input';
import { Label } from '../../components/Member/Label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/Member/Select';
import { Textarea } from '../../components/Member/Textarea';
import { getMyProfile, updateMyProfile } from '../../api/user.js';
import { getJobs } from '../../api/job.js';
import { validateField, validateForm, debounce } from '../../utils/validationUtils.js';

export const ProfileEdit = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [formData, setFormData] = useState({
    nickname: '',
    jobId: '',
    bio: '',
    profileImageUrl: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [originalNickname, setOriginalNickname] = useState('');
  const [validationErrors, setValidationErrors] = useState({});
  const [nicknameStatus, setNicknameStatus] = useState({ message: '', isAvailable: null });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const fileInputRef = useRef(null);

  // JWT 토큰에서 platform 정보 추출
  const getPlatformFromToken = () => {
    try {
      const token = localStorage.getItem('accessToken');
      if (!token) return null;

      const payloadBase64 = token.split('.')[1];
      if (!payloadBase64) return null;

      const jsonPayload = atob(payloadBase64);
      const decodedPayload = JSON.parse(jsonPayload);
      return decodedPayload.platform;
    } catch (error) {
      console.error('Failed to decode platform from token:', error);
      return null;
    }
  };

  // 프로필 이미지 업데이트 이벤트 발생 함수
  const triggerProfileImageUpdate = newImageUrl => {
    // localStorage에 새 이미지 URL 저장 (임시)
    localStorage.setItem('profileImageUrl', newImageUrl);

    // 커스텀 이벤트 발생
    window.dispatchEvent(
      new CustomEvent('profileImageUpdated', {
        detail: { profileImageUrl: newImageUrl },
      })
    );
  };

  const userPlatform = getPlatformFromToken();
  const isKakaoUser = userPlatform === 'KAKAO';

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const response = await getMyProfile();
        const userData = response.data.data;
        setUser(userData);
        setFormData(prev => ({
          ...prev,
          nickname: userData.nickname,
          jobId: userData.jobId,
          bio: userData.bio,
          profileImageUrl: userData.profileImageUrl,
        }));
        setOriginalNickname(userData.nickname);

        if (userData.role === 'CREATOR') {
          const jobsResponse = await getJobs();
          setJobs(jobsResponse.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      }
    };
    fetchUserData();
  }, []);

  const handleInputChange = e => {
    const { name, value } = e.target;
    const newFormData = { ...formData, [name]: value };
    setFormData(newFormData);

    // 닉네임 변경 시 중복 확인 상태 초기화
    if (name === 'nickname' && value !== originalNickname) {
      setNicknameStatus({ message: '', isAvailable: null });
    }

    const ruleName = name === 'newPassword' ? 'password' : name;
    const validation = validateField(ruleName, value);

    setValidationErrors(prev => ({
      ...prev,
      [name]: validation.isValid ? '' : validation.message,
    }));

    if (name === 'newPassword' || name === 'confirmPassword') {
      if (
        newFormData.newPassword &&
        newFormData.confirmPassword &&
        newFormData.newPassword !== newFormData.confirmPassword
      ) {
        setValidationErrors(prev => ({ ...prev, confirmPassword: '비밀번호가 일치하지 않습니다.' }));
      } else if (newFormData.newPassword && newFormData.confirmPassword) {
        setValidationErrors(prev => ({ ...prev, confirmPassword: '' }));
      }
    }
  };

  const handleImageChange = async e => {
    const file = e.target.files[0];
    if (!file) return;

    const token = localStorage.getItem('accessToken');

    if (!token) {
      alert('로그인이 필요합니다.');
      return;
    }

    const imageFormData = new FormData();
    imageFormData.append('image', file);

    try {
      const response = await axios.post('http://localhost:8080/api/upload/profile-image', imageFormData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });
      const newImageUrl = response.data.imageUrl;

      // 로컬 상태 업데이트
      setFormData(prev => ({ ...prev, profileImageUrl: newImageUrl }));
      setUser(prev => ({ ...prev, profileImageUrl: newImageUrl }));

      // 네비바 및 다른 컴포넌트에 프로필 이미지 업데이트 알림
      triggerProfileImageUpdate(newImageUrl);

      console.log('프로필 이미지가 업데이트되었습니다:', newImageUrl);
    } catch (error) {
      console.error('Image upload failed:', error);
      const errorMessage = error.response?.data?.message || '이미지 업로드에 실패했습니다.';
      alert(errorMessage);
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();

    const errors = {};
    let formIsValid = true;

    // 닉네임 유효성 검사
    const nicknameValidation = validateField('nickname', formData.nickname);
    if (!nicknameValidation.isValid) {
      errors.nickname = nicknameValidation.message;
      formIsValid = false;
    }

    // LOCAL 사용자만 비밀번호 관련 검사
    if (!isKakaoUser) {
      // 현재 비밀번호는 필수
      const currentPasswordValidation = validateField('password', formData.currentPassword);
      if (!currentPasswordValidation.isValid) {
        errors.currentPassword = currentPasswordValidation.message;
        formIsValid = false;
      }

      // 새 비밀번호가 입력된 경우에만 검사
      if (formData.newPassword) {
        const newPasswordValidation = validateField('password', formData.newPassword);
        if (!newPasswordValidation.isValid) {
          errors.newPassword = newPasswordValidation.message;
          formIsValid = false;
        }

        if (formData.newPassword !== formData.confirmPassword) {
          errors.confirmPassword = '비밀번호가 일치하지 않습니다';
          formIsValid = false;
        }
      }
    }

    if (!formIsValid || nicknameStatus.isAvailable === false) {
      setValidationErrors(errors);
      if (nicknameStatus.isAvailable === false) {
        alert('이미 사용 중인 닉네임입니다.');
      } else {
        alert('입력 정보를 확인해주세요.');
      }
      return;
    }

    setIsSubmitting(true);
    try {
      // KAKAO 사용자의 경우 비밀번호 관련 데이터 제외
      const submitData = isKakaoUser
        ? {
            nickname: formData.nickname,
            jobId: formData.jobId,
            bio: formData.bio,
            profileImageUrl: formData.profileImageUrl,
          }
        : formData;

      await updateMyProfile(submitData);

      // 프로필 업데이트 성공 시 네비바에도 알림
      if (formData.profileImageUrl) {
        triggerProfileImageUpdate(formData.profileImageUrl);
      }

      alert('프로필이 성공적으로 수정되었습니다.');
      navigate('/mypage');
    } catch (error) {
      console.error('Failed to update profile:', error);
      alert('프로필 수정에 실패했습니다.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className={styles.container}>
      <div className={styles.wrapper}>
        <header className={styles.header}>
          <h1>프로필 설정</h1>
        </header>

        <section className={styles.profileSection}>
          <div className={styles.avatarContainer}>
            {user.profileImageUrl ? (
              <img
                className={styles.avatarImage}
                alt="Profile"
                src={user.profileImageUrl}
                onClick={() => fileInputRef.current.click()}
              />
            ) : (
              <div className={styles.avatarFallback} onClick={() => fileInputRef.current.click()}>
                Null
              </div>
            )}
            <div className={styles.editIcon} onClick={() => fileInputRef.current.click()}></div>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImageChange}
              style={{ display: 'none' }}
              accept="image/*"
            />
          </div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>{user.username}</div>
            <div className={styles.userEmail}>
              {user.email}
              {isKakaoUser && <span className={styles.platformBadge}>카카오 연동</span>}
            </div>
          </div>
        </section>

        <form className={styles.form} onSubmit={handleSubmit}>
          <div className={styles.formGrid}>
            <div className={styles.formField}>
              <Label htmlFor="nickname">닉네임</Label>
              <Input id="nickname" name="nickname" value={formData.nickname} onChange={handleInputChange} />
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

            {user.role === 'CREATOR' && (
              <div className={styles.formField}>
                <Label htmlFor="job">직업</Label>
                <Select
                  name="jobId"
                  value={String(formData.jobId)}
                  onValueChange={value => setFormData(prev => ({ ...prev, jobId: value }))}>
                  <SelectTrigger id="job" className={styles.select}>
                    <SelectValue placeholder="직업 선택" />
                  </SelectTrigger>
                  <SelectContent>
                    {jobs.map(job => (
                      <SelectItem key={job.jobId} value={String(job.jobId)}>
                        {job.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            {/* LOCAL 사용자에게만 비밀번호 필드 표시 */}
            {!isKakaoUser && (
              <>
                <div className={styles.formField}>
                  <Label htmlFor="newPassword">새 비밀번호</Label>
                  <Input
                    id="newPassword"
                    name="newPassword"
                    type="password"
                    value={formData.newPassword}
                    onChange={handleInputChange}
                    placeholder="대소문자, 숫자, 특수문자를 포함한 8-20자로 입력"
                    className={styles.input}
                  />
                  {validationErrors.newPassword && (
                    <span className={`${styles.statusMessage} ${styles.unavailable}`}>
                      {validationErrors.newPassword}
                    </span>
                  )}
                </div>

                <div className={styles.formField}>
                  <Label htmlFor="confirmPassword">새 비밀번호 확인</Label>
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type="password"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    placeholder="새 비밀번호를 다시 입력해주세요"
                    className={styles.input}
                  />
                  {validationErrors.confirmPassword && (
                    <span className={`${styles.statusMessage} ${styles.unavailable}`}>
                      {validationErrors.confirmPassword}
                    </span>
                  )}
                </div>

                <div className={styles.formField}>
                  <Label htmlFor="currentPassword">
                    현재 비밀번호
                    <span className={styles.required}>*</span>
                  </Label>
                  <Input
                    id="currentPassword"
                    name="currentPassword"
                    type="password"
                    value={formData.currentPassword}
                    onChange={handleInputChange}
                    placeholder="정보 수정을 위해 현재 비밀번호 입력"
                    className={styles.input}
                  />
                  {validationErrors.currentPassword && (
                    <span className={`${styles.statusMessage} ${styles.unavailable}`}>
                      {validationErrors.currentPassword}
                    </span>
                  )}
                </div>
              </>
            )}

            {/* KAKAO 사용자에게 안내 메시지 표시 */}
            {isKakaoUser && (
              <div className={styles.formField}>
                <div className={styles.kakaoNotice}>
                  <p>카카오 계정으로 로그인하신 경우 비밀번호 변경이 불가능합니다.</p>
                  <p>비밀번호는 카카오에서 관리됩니다.</p>
                </div>
              </div>
            )}
          </div>

          <div className={`${styles.formField} ${styles.fullWidth}`}>
            <Label htmlFor="bio">소개글</Label>
            <div className={styles.textareaWrapper}>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleInputChange}
                className={styles.textareaElement}
                placeholder="소개글을 입력하세요..."
              />
            </div>
          </div>

          <div className={styles.buttonSection}>
            <Button type="submit" className={styles.submitButton} disabled={isSubmitting}>
              {isSubmitting ? '수정 중...' : '프로필 수정'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
