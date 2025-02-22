import styles from '../styles/Select.module.css';


const Select = ({ options=['Option1'], value, onChange,display="Select Option" }) => {

    return (
        <div className={styles.selectdiv}>
        <label>
        <select
            value={value}
            onChange={onChange}
            defaultValue={null}
        >
            <option value=""> {display} </option>
        {options.map((option, index) => (
                <option key={index} value={option}>
                    {option}
                </option>
            ))}
        </select>
        </label>
        </div>
    );
}

export default Select;
