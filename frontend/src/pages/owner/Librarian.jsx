import styles from '../../styles/OwnerLib.module.css'
import { useState,useEffect } from 'react'
import Modal from '../../components/Modal'
import Input from '../../components/Input'
import Button from '../../components/Button'
import Table from '../../components/Table'
import Pagination from '../../components/Pagination'
import Select from '../../components/Select'
import { useForm } from 'react-hook-form'
import { DevTool } from '@hookform/devtools'
import axios from 'axios'
import { toast, ToastContainer } from'react-toastify';


const adminColDef = [
    {
        header: 'First Name',
        key: 'user.first_name'
    },
    {
        header: 'Last Name',
        key: 'user.last_name'
    },
    {
        header: 'Email',
        key: 'user.email'
    },
    {
        header: 'Phone',
        key: 'user.contact_number'
    },
    {
        header: 'Library Assigned',
        key: 'library_id'
    }    
]


const OwnerManageLibrarian = () =>{

    const [adminModalState, setAdminModalState] = useState(false)
    const {register,control,formState:{errors},handleSubmit} = useForm(
        {
            defaultValues:{
                firstName:"",
                lastName:"",
                email:"",
                password:"",
                libraryId:""
            },
            mode:"all"
        }
    )
    const [librarians, setLibrarians] = useState([])


    const fetchLibrarians = async () => {
        try{
            const res = await axios.get(import.meta.env.VITE_BASE_URL + "/owner/librarians", {
                headers: { Authorization: `Bearer ${localStorage.getItem("owner_token")}` },
                withCredentials: true,
            });
            if(res.status === 200){
                setLibrarians(res.data.librarians);
            }
        }catch(error){
            errorMessage("Error fetching librarians");
        }
    }

    useEffect(()=>{
        fetchLibrarians();
    },[])



    const successMessage = (msg) => toast.success(msg,{
        autoClose: 5000,
        pauseOnHover: false,
        
    });
    const errorMessage = (msg) => toast.error(msg,{
        autoClose: 5000,
        pauseOnHover: false,
        
    });



    const createLibrarian = async (data) => {

        try{
            const res = await axios({
                method:"post",
                url:import.meta.env.VITE_BASE_URL + "/owner/create-librarian",
                data: {
                    first_name: data.firstName,
                    last_name: data.lastName,
                    email: data.email,
                    password: data.password,
                    library_id: Number(data.libraryId),
                    contact_number: data.contactNumber,
                },
                headers: { Authorization: `Bearer ${localStorage.getItem("owner_token")}` },
                withCredentials: true,
            })
            if(res.status === 201){
                successMessage("Librarian created successfully");
                setAdminModalState(false);
                formState.reset();
            }
        }
        catch(err){
            errorMessage("Failed to create librarian");
        }
    }

    return(
        <>
        <div className={styles.header}>
            <h1>Manage Librarians</h1>
        </div>

        <div className={styles.container}>
            <div className={styles.button}>
            <Button onClick={()=>setAdminModalState(true)}>Create Librarian</Button>
            </div>
        

        <div className={styles.table_area}>
            <div className={styles.table_heading}>
                <h3>Librarians</h3>

                <div className={styles.filter_area}>
                    <Select display="Search By" options={['Library Name','City','State']}/>
                    <div className={styles.search_area}>
                    <Input type="text" placeholder="Search" />
                    <Button>Search</Button>
                    </div>
                </div>

            </div>
                <Table ColumnDef={adminColDef} Data={librarians} />
                <div className={styles.pagination_area}>
                <Pagination />
                </div>
        </div>
        <Modal label="Create Librarian" modalState={adminModalState} setModalState={setAdminModalState}>
                <form className={styles.form +' form'} onSubmit={handleSubmit(createLibrarian)}>

                <Input 
                        label="First Name"
                        type="text"
                        name="firstName"
                        register={register}
                        placeholder="First Name"
                        validation={{ 
                            required: "First name is required" 
                        }}
                        error={errors.firstName}
                    />

                    <Input 
                        label="Last Name"
                        type="text"
                        name="lastName"
                        register={register}
                        placeholder="Last Name"
                        validation={ { 
                            required: "Last name is required" 
                        }}
                        error={errors.lastName}
                    />

                    <Input 
                        label="Email"
                        type="email"
                        name="email"
                        register={register}
                        placeholder="Email"
                        validation={{ 
                            required: "Email is required",
                            pattern: {
                                value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                message: "Invalid email address"
                            }
                        }}
                        error={errors.email}
                    />

                    <Input 
                        label="Password"
                        type="password"
                        name="password"
                        register={register}
                        placeholder="Password"
                        validation={{ 
                            required: "Password is required",
                            minLength: {
                                value: 6,
                                message: "Password must be at least 6 characters"
                            }
                        }}
                        error={errors.password}
                    />

                    <Input 
                        label="Contact Number"
                        type="text"
                        name="contactNumber"
                        register={register}
                        placeholder="Contact Number"
                        validation={{
                            pattern: {
                                value: /^\+\d{1,3}\s?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/,
                                message: "Invalid contact number"
                            }
                        }}
                        error={errors.contactNumber}
                        />

                    <Input 
                        label="Library ID"
                        type="text"
                        name="libraryId"
                        register={register}
                        placeholder="Library ID"
                        validation={{ 
                            required: "Library ID is required" 
                        }}
                        error={errors.libraryId}
                    />


                    <Button type="submit">Submit</Button> 
                </form>
            </Modal>
            </div>
            <DevTool control={control} />
        </>
    )
}


export default OwnerManageLibrarian;