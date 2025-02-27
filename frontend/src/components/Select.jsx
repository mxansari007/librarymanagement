// Select.jsx
import styles from '../styles/Select.module.css';

const Select = ({ options = ['Option1'], value, onChange, display = "Select Option", label, className }) => {
  return (
    <div className={`${styles.selectContainer} ${className}`}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.selectWrapper}>
        <select value={value} onChange={onChange}>
          <option value="" disabled>{display}</option>
          {options.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default Select;