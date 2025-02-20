import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import styles from '../../styles/OwnerDashboard.module.css';

const OwnerDashboard = () => {

    return (
        <div className={styles.container}>
            <div className={styles.sidebar_container}>
                <Sidebar />
            </div>
            <div className={styles.content_container}>
                <Outlet />
            </div>
        </div>
    )
}

export default OwnerDashboard;