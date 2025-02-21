import { useState } from 'react';
import styles from '../styles/Sidebar.module.css';
import ownerOptions from '../constants/sidebar.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useNavigate } from 'react-router-dom';
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
const Sidebar = ({Options=ownerOptions,User="guest",logout}) => {

    const [active, setActive] = useState("Dashboard");
    const navigate = useNavigate();

    const handleOptionClick = (option) => {
        setActive(option.name);
        navigate(option.link);
    };


    return (
        <div className={styles.container}>

            <div className={styles.logo}>
                <h2>Library Management System</h2>
            </div>

            <div className={styles.user}>
                <div className={styles.avatar}></div>
                <div className={styles.user_details}>
                    <h3>{User}</h3>
                    <p>Owner</p>
                </div>
            </div>

            <div className={styles.options}>
                <ul>
                    {Options.map((option,index) => { 
                        return(
                        <li onClick={()=>handleOptionClick(option)} className={`
                                ${styles.option} 
                                ${active===option.name?
                                    styles.active_option:null}`
                                } 
                        key={index}>
                            <FontAwesomeIcon icon={option.icon} className={active===option.name?styles.active_option:null} />
                            {option.name}
                        </li>
                    )})}
                    <li onClick={logout} className={styles.option}>
                        <FontAwesomeIcon icon={faRightFromBracket}/>
                        Logout
                    </li>
                </ul>
                </div>
            
        </div>
    );
}

export default Sidebar;