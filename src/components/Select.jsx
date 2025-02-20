import styles from '../styles/Select.module.css';


const Select = ({ options=['Option1'], value, onChange }) => {

    return (
        <div className={styles.selectdiv}>
        <label>
        <select
            value={value}
            onChange={onChange}
            defaultValue={options[0]}
        >
            <option selected> Select Box </option>
        {options.map((option, index) => (
                <option key={index}>
                    {option}
                </option>
            ))}
        </select>
        </label>
        </div>
    );
}

export default Select;
