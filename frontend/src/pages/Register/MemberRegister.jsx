import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Button } from '../../components/Member/Button';
import { Label } from '../../components/Member/Label';
import { RadioGroup, RadioGroupItem } from '../../components/Member/RadioGroup';
import { KakaoCreator } from './KakaoCreator';
import { KakaoCommon } from './KakaoCommon'; // 추가
import { LocalCommon } from './LocalCommon';
import { LocalCreator } from './LocalCreator';
import styles from './MemberRegister.module.css';

export const MemberRegister = () => {
  const [selectedUserType, setSelectedUserType] = useState('regular');
  const [currentStep, setCurrentStep] = useState('selection');

  const [searchParams] = useSearchParams();
  const kakaoEmail = searchParams.get('email');
  const kakaoPlatform = searchParams.get('platform');
  const kakaoPlatformId = searchParams.get('platformId');

  const kakaoInfo = kakaoEmail
    ? {
        email: kakaoEmail,
        platform: kakaoPlatform,
        platformId: kakaoPlatformId,
      }
    : null;

  const userTypes = [
    {
      id: 'regular',
      title: '일반 사용자',
      description: '콘텐츠를 구독하고 학습하고 싶어요',
    },
    {
      id: 'creator',
      title: '크리에이터',
      description: '콘텐츠를 제작하고 공유하고 싶어요',
    },
  ];

  const handleNext = () => {
    setCurrentStep('form');
  };

  const handleBack = () => {
    setCurrentStep('selection');
  };

  // 폼 단계에서 적절한 컴포넌트 렌더링
  if (currentStep === 'form') {
    // 카카오를 통해 들어온 사용자인지 확인
    if (kakaoInfo) {
      if (selectedUserType === 'creator') {
        // 카카오 크리에이터 폼
        return <KakaoCreator onBack={handleBack} kakaoInfo={kakaoInfo} />;
      } else {
        // 카카오 일반 사용자 폼
        return <KakaoCommon onBack={handleBack} kakaoInfo={kakaoInfo} />;
      }
    } else {
      // 일반(로컬) 가입인 경우
      if (selectedUserType === 'regular') {
        return <LocalCommon onBack={handleBack} />;
      } else {
        return <LocalCreator onBack={handleBack} />;
      }
    }
  }

  // 사용자 타입 선택 화면
  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.logoContainer}>
          <div className={styles.logoInner}>
            <img
              className={styles.logoImage}
              alt="Mask group"
              src="https://c.animaapp.com/md58ogpbjLJ0MJ/img/mask-group-2.svg"
            />
          </div>
        </div>
        <div className={styles.headerContent}>
          <div className={styles.titleSection}>
            <h1 className={styles.title}>회원가입</h1>
          </div>
          <div className={styles.subtitleSection}>
            <p className={styles.subtitle}>
              {kakaoInfo ? '카카오 계정으로 ' : ''}CreationStack에 오신 것을 환영합니다!
            </p>
          </div>
        </div>
      </header>

      <div className={styles.mainContent}>
        <RadioGroup value={selectedUserType} className={styles.radioGroup}>
          {userTypes.map(type => (
            <div key={type.id} className={styles.radioOption} data-selected={selectedUserType === type.id}>
              <RadioGroupItem
                value={type.id}
                id={type.id}
                className={styles.radioButton}
                data-state={selectedUserType === type.id ? 'checked' : 'unchecked'}
                onClick={() => setSelectedUserType(type.id)}
              />
              <Label htmlFor={type.id} className={styles.radioLabel}>
                <div className={styles.radioContent}>
                  <div className={styles.optionTitle}>{type.title}</div>
                  <div className={styles.optionDescription}>{type.description}</div>
                </div>
              </Label>
            </div>
          ))}
        </RadioGroup>

        <div className={styles.buttonContainer}>
          <button className={styles.backButton} onClick={() => (window.location.href = '/login')}>
            이전
          </button>
          <button className={styles.nextButton} onClick={handleNext}>
            다음
          </button>
        </div>
      </div>
    </div>
  );
};
