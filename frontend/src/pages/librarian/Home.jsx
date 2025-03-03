import {useState,useEffect} from 'react'
import Select from "../../components/Select"
import styles from '../../styles/OwnerDashHome.module.css'
import Table from "../../components/Table"
import Button from "../../components/Button"
import apiRequest from '../../utils/api'


const rowDatas = [
    {
        id: 1,
        name: 'John Doe',
        age: 25
    },
    {
        id: 2,
        name: 'Jane Doe',
        age: 24
    }
]

const columnDefs = [
    {
        header: 'ID',
        key: 'id'
    },
    {
        header: 'Name',
        key: 'name'
    },
    {
        header: 'Age',
        key: 'age'
    }
]



const LibrarianHome = () => {

    const [User, setUser] = useState({});
    const [dashboardData, setDashboardData] = useState(null);


    useEffect(() => {
        // Fetch data from API or local storage
        //...
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setUser(user);
          }
    }, [])


    const fetchDashboardData = async () => {


        try{
            const res = await apiRequest('GET',`/librarian/get-dashboard/${User.library_id}`,
        {},{token:localStorage.getItem('librarian_token')})

        if(res.success){
                // Set dashboard data
                console.log(res.data);
                setDashboardData(res.data);
            }else{
                // Handle error
                console.log("Error fetching dashboard data",res.error);
            }
        }catch(error){
        console.error("Error fetching dashboard data",error);
    }
}

    useEffect(() => {
        if(User.library_id){
        fetchDashboardData();
        }
    }, [User])


    return (
        <>
        <div className={styles.header}>
            <h1>Dashboard</h1>
           <p className='chip'>{User.library_name}</p>
        </div>

        <div className={styles.status_area}>
            <div className={styles.status}>
                <div className={styles.status_icon}></div>
                <div>
                <h4>Members</h4>
                <p>{dashboardData?dashboardData.total_members:null}</p>
                </div>
            </div>
            <div className={styles.status}>
            <div className={styles.status_icon}></div>
                <div>
                <h4>Books</h4>
                <p>{dashboardData?.total_books}</p>
                </div>
            </div>
            <div className={styles.status}>
            <div className={styles.status_icon}></div>
                <div>
                <h4>Borowers</h4>
                <p>{dashboardData?.total_issued_books}</p>
                </div>
            </div>
            <div className={styles.status}>
            <div className={styles.status_icon}></div>
                <div>
                <h4>Overdue</h4>
                <p>{dashboardData?.total_overdue_books}</p>
                </div>
            </div>
        </div>

        <div className={styles.table_area}>
            <div className={styles.table_heading}>
                <h3>Recent Transactions</h3>
                <div className={styles.table_button}>
                    <Button variant={'secondary'}>View All</Button>
                </div>
            </div>
            <Table Data={rowDatas} ColumnDef={columnDefs}/>
        </div>


        </>
    )
}

export default LibrarianHome