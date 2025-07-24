import React, { useState } from 'react';
import styles from './Select.module.css';

const Select = ({ children, value, onValueChange, defaultValue }) => {
  const [internalValue, setInternalValue] = useState(value || defaultValue || '');
  const [isOpen, setIsOpen] = useState(false);

  React.useEffect(() => {
    setInternalValue(value);
  }, [value]);

  const handleValueChange = newValue => {
    setInternalValue(newValue);
    if (onValueChange) {
      onValueChange(newValue);
    }
    setIsOpen(false);
  };

  let selectedDisplayValue = null;
  const content = React.Children.toArray(children).find(child => child.type === SelectContent);
  if (content) {
    const selectedItem = React.Children.toArray(content.props.children).find(
      child => child.props.value === internalValue
    );
    if (selectedItem) {
      selectedDisplayValue = selectedItem.props.children;
    }
  }

  return (
    <div style={{ position: 'relative' }}>
      {React.Children.map(children, child => {
        if (child.type === SelectTrigger) {
          return React.cloneElement(child, {
            isOpen,
            setIsOpen,
            children: React.cloneElement(child.props.children, {
              displayValue: selectedDisplayValue,
            }),
          });
        }
        if (child.type === SelectContent) {
          return React.cloneElement(child, {
            isOpen,
            selectedValue: internalValue,
            onValueChange: handleValueChange,
          });
        }
        return child;
      })}
    </div>
  );
};

const SelectTrigger = ({ className = '', children, isOpen, setIsOpen, ...props }) => {
  return (
    <button
      type="button"
      className={`${styles.selectTrigger} ${className}`}
      onClick={() => setIsOpen(!isOpen)}
      {...props}>
      {children}
      <span className={styles.selectIcon}>▼</span>
    </button>
  );
};

const SelectValue = ({ placeholder, displayValue }) => {
  return <span>{displayValue || placeholder}</span>;
};

const SelectContent = ({ className = '', children, isOpen, selectedValue, onValueChange }) => {
  if (!isOpen) return null;

  return (
    <div
      className={`${styles.selectContent} ${className}`}
      style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, marginTop: '4px' }}>
      <div className={styles.selectViewport}>
        {React.Children.map(children, child => {
          if (child.type === SelectItem) {
            return React.cloneElement(child, {
              selectedValue,
              onValueChange,
            });
          }
          return child;
        })}
      </div>
    </div>
  );
};

const SelectItem = ({ className = '', children, value, selectedValue, onValueChange, ...props }) => {
  const isSelected = selectedValue === value;
  return (
    <div className={`${styles.selectItem} ${className}`} onClick={() => onValueChange(value)} {...props}>
      {children}
      {isSelected && <span className={styles.selectItemIndicator}>✓</span>}
    </div>
  );
};

export { Select, SelectTrigger, SelectValue, SelectContent, SelectItem };
