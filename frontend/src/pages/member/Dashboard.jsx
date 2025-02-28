import { useEffect,useState } from "react";
import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import styles from '../../styles/Dashboard.module.css';
import {memberOptions} from '../../constants/sidebar';
import {useLogout} from "../../utils/auth";

const MemberDashboard = () => {
    const [user, setUser] = useState(null);
    const logout = useLogout();

    useEffect(() => {
        // un strigify user

        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      }, []);


    const handleLogout = () => {
        logout('member');
    }




    return (
        <div className={styles.container}>
            <div className={styles.sidebar_container}>
                <Sidebar User={user} Options={memberOptions} logout={handleLogout}/>
            </div>
            <div className={styles.content_container}>
                <Outlet />
            </div>
        </div>
    )
}

export default MemberDashboard;