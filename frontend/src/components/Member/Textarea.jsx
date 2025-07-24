import * as React from 'react';
import styles from './Textarea.module.css';

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return <textarea className={`${styles.textarea} ${className || ''}`} ref={ref} {...props} />;
});

Textarea.displayName = 'Textarea';

export { Textarea };
