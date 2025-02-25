import styles from '../styles/LocalGlobals.module.css'



const PageHeader = ({ title }) => {



        return (
            <div className={styles.header}>
            <h1>{title}</h1>
        </div>
        )
    }

    export default PageHeader


