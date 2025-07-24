import React from 'react';
import styles from './RadioGroup.module.css';

// RadioGroup 컴포넌트
const RadioGroup = React.forwardRef(({ className = '', children, onChange, value, ...props }, ref) => {
  // onChange와 value prop을 추가하여 라디오 그룹의 상태를 관리할 수 있도록 합니다.
  // 이 RadioGroup은 Context API를 사용하여 자식 RadioGroupItem에 value와 onChange를 전달할 수 있습니다.
  // 하지만 간단한 사용을 위해서는 RadioGroupItem이 직접 onChange를 호출하도록 구성된 현재 방식도 유효합니다.
  // 이 오류 메시지는 RadioGroup *div*에 onValueChange를 전달하는 문제가 아니었습니다.
  // 이전에 Radix UI를 사용했던 컴포넌트(MemberRegister.jsx의 RadioGroup)에서
  // 이 커스텀 RadioGroup에 onValueChange를 전달했을 때 발생한 경고였습니다.

  // RadioGroup의 역할은 주로 레이아웃과 접근성(role="radiogroup") 제공입니다.
  // 실제 값 변경 로직은 RadioGroupItem에 있습니다.
  return (
    <div className={`${styles.radioGroup} ${className}`} role="radiogroup" {...props} ref={ref}>
      {children}
    </div>
  );
});

RadioGroup.displayName = 'RadioGroup';

// RadioGroupItem 컴포넌트
const RadioGroupItem = React.forwardRef(({ className = '', value, checked, onChange, ...props }, ref) => {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={checked}
      className={`${styles.radioGroupItem} ${className}`}
      onClick={() => onChange && onChange(value)} // 이곳에서 onChange 함수를 호출하여 부모에게 값 변경을 알림
      ref={ref}
      {...props}>
      {checked && (
        <div className={styles.radioIndicator}>
          <div className={styles.radioIcon} />
        </div>
      )}
    </button>
  );
});

RadioGroupItem.displayName = 'RadioGroupItem';

export { RadioGroup, RadioGroupItem };
