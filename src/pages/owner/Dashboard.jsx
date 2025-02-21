import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import styles from '../../styles/OwnerDashboard.module.css';
import { useNavigate } from "react-router-dom"

const OwnerDashboard = () => {

    const navigate = useNavigate();


    const handleLogout = () => {
        navigate('/owner');
    }




    return (
        <div className={styles.container}>
            <div className={styles.sidebar_container}>
                <Sidebar logout={handleLogout}/>
            </div>
            <div className={styles.content_container}>
                <Outlet />
            </div>
        </div>
    )
}

export default OwnerDashboard;