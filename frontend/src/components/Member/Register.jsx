import React from 'react';
import { Button } from '../../components/Member/Button';
import { Card, CardContent } from '../../components/Member/Card';
import { Input } from '../../components/Member/Input';
import { Label } from '../../components/Member/Label';
import styles from './Register.module.css';

export const Register = () => {
  // Form field data with labels and placeholders
  const formFields = [
    {
      id: 'email',
      label: '이메일 주소',
      placeholder: '이메일 주소를 입력해주세요',
      required: true,
      hasButton: true,
      buttonText: '중복 확인',
    },
    {
      id: 'name',
      label: '이름',
      placeholder: '이름을 입력해주세요',
      required: true,
    },
    {
      id: 'nickname',
      label: '닉네임',
      placeholder: '닉네임을 입력해주세요',
      required: true,
    },
    {
      id: 'password',
      label: '비밀번호',
      placeholder: '비밀번호를 입력해주세요',
      required: true,
      type: 'password',
    },
    {
      id: 'confirmPassword',
      label: '비밀번호 확인',
      placeholder: '비밀번호를 입력해주세요',
      required: true,
      type: 'password',
    },
  ];

  return (
    <div className={styles.container}>
      <Card className={styles.card}>
        <CardContent className={styles.cardContent}>
          {/* Header Section */}
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
              <div className={styles.loginLink}>로그인</div>
            </div>
          </div>

          {/* Form Fields */}
          <div className={styles.formFields}>
            {formFields.map(field => (
              <div key={field.id} className={styles.fieldContainer}>
                <Label htmlFor={field.id} className={styles.fieldLabel}>
                  {field.label} {field.required && <span className={styles.required}>*</span>}
                </Label>

                {field.hasButton ? (
                  <div className={styles.inputWithButton}>
                    <div className={styles.inputWrapper}>
                      <Input id={field.id} placeholder={field.placeholder} className={styles.input} />
                    </div>
                    <button className={styles.duplicateCheckButton}>{field.buttonText}</button>
                  </div>
                ) : (
                  <div className={styles.inputWrapperRegular}>
                    <Input
                      id={field.id}
                      type={field.type || 'text'}
                      placeholder={field.placeholder}
                      className={styles.input}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Submit Button */}
          <div className={styles.submitSection}>
            <button className={styles.submitButton}>회원가입</button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
