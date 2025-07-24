import React from 'react';
import styles from './Button.module.css';

const Button = React.forwardRef(
  ({ className = '', variant = 'default', size = 'default', children, ...props }, ref) => {
    const variantClass = styles[variant] || styles.default;
    const sizeClass = styles[`size${size.charAt(0).toUpperCase() + size.slice(1)}`] || styles.sizeDefault;

    return (
      <button className={`${styles.buttonBase} ${variantClass} ${sizeClass} ${className}`} ref={ref} {...props}>
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';

export { Button };
