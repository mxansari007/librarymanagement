import styles from  '../styles/Button.module.css'

const Button = ({ children, onClick,disabled,variant,loading }) => {
  return (
    <>
    {variant === 'primary-loading'?
    <button 
    disabled={disabled}
    className={`
        ${styles.primary_button}`} 
        onClick={onClick}>{children}<div className={`${loading?styles.primary_loading:null}`}></div></button>:
        variant === 'secondary'?
        <button 
        disabled={disabled}
        className={`
          ${styles.secondary_button}
          ${disabled?styles.primary_button_disabled:null}`}
        onClick={onClick}>{children}</button>    
        :<button className={`
        ${styles.primary_button}`} 
        onClick={onClick}>{children}</button>
    }
    </>
  )
}


export default Button;