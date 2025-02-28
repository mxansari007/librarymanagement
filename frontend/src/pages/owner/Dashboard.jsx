import { useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import styles from '../../styles/Dashboard.module.css';
import ownerOptions from '../../constants/sidebar';
import { useEffect } from "react";
import { useLogout } from "../../utils/auth";


const OwnerDashboard = () => {

    const logout = useLogout();
    const [user, setUser] = useState(null);

    useEffect(() => {
        // un strigify user

        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      }, []);


    const handleLogout = () => {
        logout('owner');
    }




    return (
        <div className={styles.container}>
            <div className={styles.sidebar_container}>
                <Sidebar Options={ownerOptions} logout={handleLogout} User={user}/>
            </div>
            <div className={styles.content_container}>
                <Outlet />
            </div>
        </div>
    )
}

export default OwnerDashboard;