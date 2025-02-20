import styles from '../styles/Sidebar.module.css';
import ownerOptions from '../constants/sidebar.js';


const Sidebar = ({Options=ownerOptions,User="guest",active='Dashboard'}) => {

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
                         const Icon = option.icon; // Component reference
                         if (!Icon) {
                             return null; // Skip rendering if the icon is null
                         }
                        return(
                        <li className={`
                                ${styles.option} 
                                ${active===option.name?
                                    styles.active_option:null}`
                                } 
                        key={index}>
                            <Icon />
                            {option.name}
                        </li>
                    )})}
                </ul>
                </div>
            
        </div>
    );
}

export default Sidebar;