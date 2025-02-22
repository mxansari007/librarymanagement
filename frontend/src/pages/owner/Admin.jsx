import styles from '../../styles/OwnerLib.module.css'
import { useState } from 'react'
import Modal from '../../components/Modal'
import Input from '../../components/Input'
import Button from '../../components/Button'
import Table from '../../components/Table'
import Pagination from '../../components/Pagination'
import Select from '../../components/Select'
const adminColDef = [
    {
        header: 'Admin Name',
        key: 'adminName'
    },
    {
        header: 'Admin Email',
        key: 'adminEmail'
    },
    {
        header: 'Admin Phone',
        key: 'adminPhone'
    }
    
]

const adminData = [
   {
    adminName: 'John Doe',
    adminEmail: 'fV3oA@example.com',
    adminPhone: '1234567890'
   },
   {
    adminName: 'Jane Doe',
    adminEmail: 'fV3oA@example.com',
    adminPhone: '1234567890'
   },
   {
    adminName: 'John Doe',
    adminEmail: 'fV3oA@example.com',
    adminPhone: '1234567890'
   },
   {
    adminName: 'Jane Doe',
    adminEmail: 'fV3oA@example.com',
    adminPhone: '1234567890'
   },
   {
    adminName: 'John Doe',
    adminEmail: 'fV3oA@example.com',
    adminPhone: '1234567890'
   },
  
]


const OwnerManageAdmins = () =>{

    const [adminModalState, setAdminModalState] = useState(false)



    return(
        <>
        <div className={styles.header}>
            <h1>Manage Admins</h1>
        </div>

        <div className={styles.container}>
            <div className={styles.button}>
            <Button onClick={()=>setAdminModalState(true)}>Create Admin</Button>
            </div>
        

        <div className={styles.table_area}>
            <div className={styles.table_heading}>
                <h3>Admin List</h3>

                <div className={styles.filter_area}>
                    <Select display="Search By" options={['Library Name','City','State']}/>
                    <div className={styles.search_area}>
                    <Input type="text" placeholder="Search" />
                    <Button>Search</Button>
                    </div>
                </div>

            </div>
                <Table ColumnDef={adminColDef} Data={adminData} />
                <div className={styles.pagination_area}>
                <Pagination />
                </div>
        </div>
        <Modal label="Create Admin" modalState={adminModalState} setModalState={setAdminModalState}>
                <form className={styles.form}>
                    <Input type="text" placeholder="Admin Name" />
                    <Input type="email" placeholder="Admin Email" />
                    <Input type="text" placeholder="Admin Phone" />
                    <Button>Submit</Button> 
                </form>
            </Modal>
            </div>
        
        </>
    )
}


export default OwnerManageAdmins;