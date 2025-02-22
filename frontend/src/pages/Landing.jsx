import {useState} from 'react'
import {Link} from 'react-router-dom'
import styles from '../styles/Landing.module.css'
import Button from '../components/Button'
import ownerIcon from '../assets/owner_icon.png'
import memberIcon from '../assets/member.png'
import librarianIcon from '../assets/book_icon.png'



const Landing = () => {


    const [showRoles, setShowRoles] = useState(false);

    const handleGetStartedClick = () => {
        setShowRoles(!showRoles);
    };



    return (
        <>
        <div className={styles.container}>
            <div className={styles.header}>
                <p>Welcome To</p>
                <h1>Library Management System</h1>
            </div>
            <div className={styles.button}>
                <Button  onClick={handleGetStartedClick}>{showRoles ? 'Close' : 'Get Started'}</Button>
            </div>

            <div className={`${styles.roles} ${showRoles ? styles.show : ''}`}>
                {/* Add your role options here */}
                <h2>Select Your Role</h2>
                <div className={styles.cards}>
                    <Link to="/member">
                    <div className={styles.card}>
                        <img width={50} src={memberIcon} alt="owner" />
                        <p>Member</p>
                    </div>
                    </Link>

                    <Link to={"/librarian"}>
                    <div className={styles.card}>
                        <img width={50} src={librarianIcon} alt="owner" />
                        <p>Librarian</p>
                    </div>
                    </Link>

                    <Link to="/owner">
                    <div  className={styles.card}>
                        <img width={50} src={ownerIcon} alt="owner" />
                        <p>Owner</p>
                    </div>
                    </Link>
                </div>
            </div>
        </div>
        </>
    )
}


export default Landing