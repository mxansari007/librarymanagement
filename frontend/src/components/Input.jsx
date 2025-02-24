import styles from '../styles/Input.module.css';

const Input = ({ name, type, placeholder, register, error, validation, ...rest }) => {
    return (
        <div className={styles.inputContainer}>
            <input
                {...(register ? register(name, validation) : {})} // Ensure register exists
                type={type}
                placeholder={placeholder}
                className={`${styles.input} ${error ? styles.error : ''}`}
                {...rest}
                defaultValue={rest?.defaultValue}
            />
            {error && <p className='error'>*{error.message}</p>}
        </div>
    );
};

export default Input;