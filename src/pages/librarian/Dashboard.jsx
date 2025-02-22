import { Outlet } from "react-router-dom";
import Sidebar from "../../components/Sidebar";
import styles from '../../styles/Dashboard.module.css';
import { useNavigate } from "react-router-dom"
import {librarianOptions} from '../../constants/sidebar';

const LibrarianDashboard = () => {

    const navigate = useNavigate();


    const handleLogout = () => {
        navigate('/librarian');
    }




    return (
        <div className={styles.container}>
            <div className={styles.sidebar_container}>
                <Sidebar User={{firstName:"Guest",secondName:"",role:"Librarian"}} Options={librarianOptions} logout={handleLogout}/>
            </div>
            <div className={styles.content_container}>
                <Outlet />
            </div>
        </div>
    )
}

export default LibrarianDashboard;