import { useState } from 'react'
import styles from '../../styles/OwnerLib.module.css'
import Modal from '../../components/Modal'
import Input from '../../components/Input'
import Button from '../../components/Button'
import Table from '../../components/Table'
import Pagination from '../../components/Pagination'
import Select from '../../components/Select'
const libraryColDef = [
    {
        header: 'Library Name',
        key: 'libraryName'
    },
    {
        header: 'Library Address',
        key: 'libraryAddress'
    },
    {
        header: 'Library City',
        key: 'libraryCity'
    },
    {
        header: 'Library State',
        key: 'libraryState'
    },
    {
        header: 'Library Pincode',
        key: 'libraryPincode'
    },
]

const libraryData = [
    {
        libraryName: 'Library1',
        libraryAddress: 'Address1',
        libraryCity: 'City1',
        libraryState: 'State1',
        libraryPincode: 'Pincode1'
    },
    {
        libraryName: 'Library2',
        libraryAddress: 'Address2',
        libraryCity: 'City2',
        libraryState: 'State2',
        libraryPincode: 'Pincode2'
    },
    {
        libraryName: 'Library3',
        libraryAddress: 'Address3',
        libraryCity: 'City3',
        libraryState: 'State3',
        libraryPincode: 'Pincode3'
    },
    {
        libraryName: 'Library4',
        libraryAddress: 'Address4',
        libraryCity: 'City4',
        libraryState: 'State4',
        libraryPincode: 'Pincode4'
    },
    {
        libraryName: 'Library5',
        libraryAddress: 'Address5',
        libraryCity: 'City5',
        libraryState: 'State5',
        libraryPincode: 'Pincode5'
    }
]



const OwnerManageLibrary = ()=>{

    const [modalState, setModalState] = useState(false);

    const handleModal = (value) => {
        setModalState(value);
    };

    return(
        <>
        <div className={styles.header}>
            <h1>Manage Library</h1>
        </div>
        
        <div className={styles.container}>
            <div className={styles.button}>
            <Button onClick={()=>handleModal(true)}>Create Library</Button>
            </div>
        

        <div className={styles.table_area}>
            <div className={styles.table_heading}>
                <h3>Library List</h3>

                <div className={styles.filter_area}>
                    <Select display="Search By" options={['Library Name','City','State']}/>
                    <div className={styles.search_area}>
                    <Input type="text" placeholder="Search" />
                    <Button>Search</Button>
                    </div>
                </div>

            </div>
                <Table ColumnDef={libraryColDef} Data={libraryData} />
                <div className={styles.pagination_area}>
                <Pagination />
                </div>
        </div>
        <Modal label="Create Library" modalState={modalState} setModalState={setModalState}>
                <form className={styles.form}>
                    <label>Library Name</label>
                    <Input type="text" placeholder="Library Name" />
                    <label>Library Address</label>
                    <Input type="text" placeholder="Library Address" />
                    <label>Library City</label>
                    <Input type="text" placeholder="Library City" />
                    <label>Library State</label>
                    <Input type="text" placeholder="Library State" />
                    <label>Library Pincode</label>
                    <Input type="text" placeholder="Library Pincode" />
                    <Button>Create</Button>
                </form>
            </Modal>
            </div>
        </>
    )
}

export default OwnerManageLibrary