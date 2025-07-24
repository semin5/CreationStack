import React from 'react';
import styles from './SimpleLabel.module.css';

const SimpleLabel = React.forwardRef(({ className = '', children, ...props }, ref) => {
  return (
    <label ref={ref} className={`${styles.label} ${className}`} {...props}>
      {children}
    </label>
  );
});

SimpleLabel.displayName = 'SimpleLabel';

export { SimpleLabel };
