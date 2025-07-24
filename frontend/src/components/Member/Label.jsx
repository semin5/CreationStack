import React from 'react';
import styles from './Label.module.css';

const Label = React.forwardRef(({ className = '', ...props }, ref) => (
  <label ref={ref} className={`${styles.label} ${className}`} {...props} />
));

Label.displayName = 'Label';

export { Label };
