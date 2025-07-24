export const validationRules = {
  email: {
    pattern: /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/,
    message: '올바른 이메일 형식을 입력해주세요 (예: user@example.com)',
  },
  name: {
    pattern: /^[가-힣a-zA-Z\s]{2,20}$/,
    message: '이름은 한글 또는 영문 2-20자로 입력해주세요',
  },
  nickname: {
    pattern: /^[가-힣a-zA-Z0-9_-]{2,10}$/,
    message: '닉네임은 한글, 영문, 숫자, _, - 포함 2-10자로 입력해주세요',
  },
  password: {
    pattern: /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,20}$/,
    message: '비밀번호는 대소문자, 숫자, 특수문자를 포함한 8-20자로 입력해주세요',
  },
};

export const validateField = (field, value) => {
  const rule = validationRules[field];
  if (!rule) return { isValid: true, message: '' };

  if (!value || value.trim() === '') {
    return { isValid: false, message: '필수 입력 항목입니다' };
  }

  const isValid = rule.pattern.test(value.trim());
  return {
    isValid,
    message: isValid ? '' : rule.message,
  };
};

export const validateForm = (formData, requiredFields = []) => {
  const errors = {};
  let isValid = true;

  requiredFields.forEach(field => {
    const validation = validateField(field, formData[field]);
    if (!validation.isValid) {
      errors[field] = validation.message;
      isValid = false;
    }
  });

  if (formData.password && formData.confirmPassword) {
    if (formData.password !== formData.confirmPassword) {
      errors.confirmPassword = '비밀번호가 일치하지 않습니다';
      isValid = false;
    }
  }

  return { isValid, errors };
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};
