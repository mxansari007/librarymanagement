import React from 'react'
import styles from '../styles/Select.module.css';

const Select = ({ options = [], value, onChange, display = "Select Option", label, className }) => {
  return (
    <div className={`${styles.selectContainer} ${className}`}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.selectWrapper}>
        <select value={value} onChange={onChange}>
          <option value="" disabled>{display}</option>
          {options.map((option, index) => (
            <option key={option.value} value={option.value}>
              {option.label} {/* Display name with ID */}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Select;
