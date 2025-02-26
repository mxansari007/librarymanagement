import {useState,useEffect} from 'react'
import Select from "../../components/Select"
import styles from '../../styles/OwnerDashHome.module.css'
import Table from "../../components/Table"
import Button from "../../components/Button"

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

    const [libraryName, setLibraryName] = useState(null);

    useEffect(() => {
        // Fetch data from API or local storage
        //...
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const user = JSON.parse(storedUser);
            setLibraryName(user.library_name);
          }
    }, [])


    return (
        <>
        <div className={styles.header}>
            <h1>Dashboard</h1>
           <p className='chip'>{libraryName}</p>
        </div>

        <div className={styles.status_area}>
            <div className={styles.status}>
                <div className={styles.status_icon}></div>
                <div>
                <h4>Members</h4>
                <p>52</p>
                </div>
            </div>
            <div className={styles.status}>
            <div className={styles.status_icon}></div>
                <div>
                <h4>Books</h4>
                <p>2</p>
                </div>
            </div>
            <div className={styles.status}>
            <div className={styles.status_icon}></div>
                <div>
                <h4>Borowers</h4>
                <p>5</p>
                </div>
            </div>
            <div className={styles.status}>
            <div className={styles.status_icon}></div>
                <div>
                <h4>Overdue</h4>
                <p>2</p>
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