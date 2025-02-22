import { useState } from 'react';
import styles from '../styles/Sidebar.module.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useNavigate } from 'react-router-dom';
import { faRightFromBracket } from '@fortawesome/free-solid-svg-icons';
const Sidebar = ({Options=ownerOptions,User={firstName:"Guest",secondName:"",role:"Owner"},logout}) => {

    const [active, setActive] = useState("Dashboard");
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false);

    const handleOptionClick = (option) => {
        setActive(option.name);
        navigate(option.link);
    };


    return (
        <>
        <div className={styles.container}>

            <div className={styles.logo}>
                <h2>Library Management System</h2>
            </div>

            <div className={styles.user}>
                <div className={styles.avatar}></div>
                <div className={styles.user_details}>
                    <h3>{User.firstName}</h3>
                    <p>{User.role}</p>
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


        <div onClick={()=>setIsOpen(!isOpen)} className={styles.hamburger}>
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>

        {isOpen && <div className={styles.mobile_sidebar_container}>
                    <div onClick={()=>setIsOpen(!isOpen)} className={styles.hamburger}>
                        <div></div>
                        <div></div>
                        <div></div>
                    </div>
            <div className={styles.mobile_sidebar}>
                <div className={styles.logo}>
                    <h2>Library Management System</h2>
                </div>
                <div className={styles.user}>
                    <div className={styles.avatar}></div>
                    <div className={styles.user_details}>
                        <h3>{User.firstName}</h3>
                        <p>{User.role}</p>
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
        </div>}


</>

    );
}

export default Sidebar;