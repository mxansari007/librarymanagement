import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import styles from '../../styles/Dashboard.module.css';
import { useNavigate } from "react-router-dom"
import {memberOptions} from '../../constants/sidebar';


const MemberDashboard = () => {

    const navigate = useNavigate();


    const handleLogout = () => {
        navigate('/owner');
    }




    return (
        <div className={styles.container}>
            <div className={styles.sidebar_container}>
                <Sidebar Options={memberOptions} logout={handleLogout}/>
            </div>
            <div className={styles.content_container}>
                <Outlet />
            </div>
        </div>
    )
}

export default MemberDashboard;