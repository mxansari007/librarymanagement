import { Outlet } from "react-router-dom";
import {useState,useEffect} from 'react'
import Sidebar from "../../components/Sidebar";
import styles from '../../styles/Dashboard.module.css';
import { useNavigate } from "react-router-dom"
import {librarianOptions} from '../../constants/sidebar';

const LibrarianDashboard = () => {

    const navigate = useNavigate();
    const [user, setUser] = useState(null);

    useEffect(() => {
        // un strigify user

        const storedUser = localStorage.getItem('user');
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      }, []);


    const handleLogout = () => {
        navigate('/librarian');
    }




    return (
        <div className={styles.container}>
            <div className={styles.sidebar_container}>
                <Sidebar User={user} Options={librarianOptions} logout={handleLogout}/>
            </div>
            <div className={styles.content_container}>
                <Outlet />
            </div>
        </div>
    )
}

export default LibrarianDashboard;