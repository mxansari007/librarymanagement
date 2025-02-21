import styles from '../styles/Landing.module.css'
import Button from '../components/Button'




const Landing = () => {
    return (
        <>
        <div className={styles.container}>
            <div className={styles.header}>
                <p>Welcome To</p>
                <h1>Library Management System</h1>
            </div>
            <div className={styles.button}>
                <Button>Get Started</Button>
            </div>
        </div>
        </>
    )
}


export default Landing