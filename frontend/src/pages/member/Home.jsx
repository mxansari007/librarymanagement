import { useState,useEffect } from "react"
import Select from "../../components/Select"
import styles from '../../styles/OwnerDashHome.module.css'
import Table from "../../components/Table"
import Button from "../../components/Button"
import PageHeader from "../../components/PageHeader"
import apiRequest from '../../utils/api'
import {faHandHoldingHand, faClock} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'



const columnDefs = [
    {
        header: 'ID',
        key: 'id'
    },
    {
        header: 'Book Title',
        key: 'book.title'
    },
    {
        header: 'Author',
        key: 'book.author'
    },
    {
        header: 'Due Date',
        key: 'due_date',
        render: (value) => new Date(value).toLocaleDateString('en-IN', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        })
    },
    {
        header: 'Status',
        key: 'is_return_approved',
        render: (value) => value ? 'Returned' : 'Borrowed'
    }
];



const MemberHome = () => {

    const [User, setUser] = useState({});
    const [dashboardValues, setDashboardValues] = useState({});
    const [recentTransactions, setRecentTransactions] = useState({});

    const fetchRecentTransactions = async ()=>{
        try{
            const res = await apiRequest('GET',`/member/recent-transactions`,
        {},{token:localStorage.getItem('member_token')})

        if(res.success){
                // Set recent transactions
                console.log(res.data);
                setRecentTransactions(res.data);
            }else{
                // Handle error
                console.log("Error fetching recent transactions",res.error);
            }
        }catch(error){
        console.error("Error fetching recent transactions",error);
    }
}

    useEffect(()=>{
        fetchRecentTransactions();
        // Fetch data from API or local storage
        //...
    },[])


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
            const res = await apiRequest('GET',`/member/get-dashboard/`,
        {},{token:localStorage.getItem('member_token')})

        if(res.success){
                // Set dashboard data
                console.log(res.data);
                setDashboardValues(res.data);
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
        <PageHeader title={'Dashboard'} />
        <div className={styles.status_area}>
            <div className={styles.status}>
            <div className={styles.status_icon}>
                <FontAwesomeIcon icon={faHandHoldingHand} />
            </div>
                <div>
                <h4>Books Borrowed</h4>
                <p>{dashboardValues.total_books_borrowed}</p>
                </div>
            </div>
            <div className={styles.status}>
            <div className={styles.status_icon}>
                <FontAwesomeIcon icon={faClock} />
            </div>
                <div>
                <h4>Books Overdue</h4>
                <p>{dashboardValues.total_overdue_books}</p>
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
            <Table Data={recentTransactions} ColumnDef={columnDefs}/>
        </div>


        </>
    )
}

export default MemberHome




