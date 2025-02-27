import PageHeader from "../../components/PageHeader";
import styles from '../../styles/OwnerLib.module.css';
import Button from "../../components/Button";
import Select from "../../components/Select";
import Table from "../../components/Table";
import Pagination from "../../components/Pagination";
import Input from "../../components/Input";
import { useForm } from "react-hook-form";
import { DevTool } from '@hookform/devtools';
import axios from 'axios';
import { toast } from 'react-toastify';
import Modal from "../../components/Modal";
import { useState, useEffect } from "react";
import Tabs from "../../components/Tabs";
import { memebersData } from "../../constants/tabs";

const membersDef = [
    { header: 'Member ID', key: 'id' },
    { header: 'First Name', key: 'first_name' },
    { header: 'Last Name', key: 'last_name' },
    { header: 'Email', key: 'email' },
    { header: 'Phone Number', key: 'contact_number' },
];

const ManageMembers = () => {
    const [modalState, setModalState] = useState(false); // For Add Book modal
    const [rejectModalState, setRejectModalState] = useState(false); // For Reject modal
    const [allBooks, setAllBooks] = useState([]);
    const [unverifiedMembers, setUnverifiedMembers] = useState([]);
    const [verifiedMembers, setVerifiedMembers] = useState([]);
    const [tabState, setTabState] = useState(1);
    const [memberToReject, setMemberToReject] = useState(null); // Store member to reject

    // Form for rejection reason
    const { register: registerReject, handleSubmit: handleRejectSubmit, reset: resetReject, formState: { errors: rejectErrors } } = useForm({
        defaultValues: { reason: "" },
        mode: "all",
    });

    const fetchingUnverifiedMembers = async () => {
        const user = JSON.parse(localStorage.getItem("user"));
        try {
            const res = await axios({
                method: "GET",
                url: `${import.meta.env.VITE_BASE_URL}/librarian/fetch-members/${user.library_id}?is_verified=false`,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("librarian_token")}`,
                },
                withCredentials: true,
            });
            setUnverifiedMembers(res.data.data);
        } catch (error) {
            console.error("Fetching unverified members error:", error);
            toast.error("Error fetching unverified members");
        }
    };

    const fetchingVerifiedMembers = async () => {
        const user = JSON.parse(localStorage.getItem("user"));
        try {
            const res = await axios({
                method: "GET",
                url: `${import.meta.env.VITE_BASE_URL}/librarian/fetch-members/${user.library_id}?is_verified=true`,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("librarian_token")}`,
                },
                withCredentials: true,
            });
            setVerifiedMembers(res.data.data);
        } catch (error) {
            console.error("Fetching verified members error:", error);
            toast.error("Error fetching verified members");
        }
    };



    useEffect(() => {
        fetchingUnverifiedMembers();
        fetchingVerifiedMembers();
    }, []);

    useEffect(() => {

        if (tabState === 1) {
            fetchingUnverifiedMembers();
        } else {
            fetchingVerifiedMembers();
        }


},[tabState])


    const { register, control, formState: { errors }, handleSubmit, setValue } = useForm({
        defaultValues: {
            title: "",
            author: "",
            library_id: "",
            publisher: "",
            total_copies: "",
            available_copies: "",
            version: "",
            book_image: null,
        },
        mode: "all",
    });

    const fetchingBooks = async () => {
        const token = localStorage.getItem("librarian_token");
        try {
            const res = await axios({
                method: "GET",
                url: `${import.meta.env.VITE_BASE_URL}/librarian/books`,
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                withCredentials: true,
            });
            if (res.status === 200) {
                setAllBooks(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching books:", error.response?.data || error.message);
            toast.error("Error fetching books");
        }
    };

    useEffect(() => {
        fetchingBooks();
    }, []);

    const handleBookImage = (e) => {
        const file = e.target.files[0];
        setValue("book_image", file);
    };

    const AddBook = async (data) => {
        try {
            const formData = new FormData();
            formData.append("title", data.title);
            formData.append("author", data.author);
            formData.append("library_id", data.library_id);
            formData.append("publisher", data.publisher);
            formData.append("total_copies", data.total_copies);
            formData.append("available_copies", data.available_copies);
            formData.append("version", data.version);
            if (data.book_image) {
                formData.append("book_image", data.book_image);
            }

            const res = await axios.post(
                `${import.meta.env.VITE_BASE_URL}/librarian/add-book`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${localStorage.getItem("librarian_token")}`,
                        "Content-Type": "multipart/form-data",
                    },
                    withCredentials: true,
                }
            );

            if (res.status === 201) {
                toast.success("Book added successfully");
                setModalState(false);
            }
        } catch (error) {
            toast.error(error.response?.data?.error || "Error adding book");
        }
    };

    const approveMember = async (row) => {
        try {
            const res = await axios({
                method: "GET",
                url: `${import.meta.env.VITE_BASE_URL}/librarian/approve-member/${row.email}`,
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("librarian_token")}`,
                },
                withCredentials: true,
            });
            toast.success("Member approved successfully");
            fetchingUnverifiedMembers();
        } catch (error) {
            console.error("Error approving member:", error);
            toast.error(error.response?.data?.error || "Error approving member");
        }
    };

    const openRejectModal = (row) => {
        setMemberToReject(row); // Store the member to reject
        setRejectModalState(true); // Open the reject modal
    };

    const rejectMember = async (data) => {
        if (!memberToReject) return;

        try {
            const res = await axios({
                method: "POST",
                url: `${import.meta.env.VITE_BASE_URL}/librarian/reject-member/${memberToReject.email}`,
                data: { reason: data.reason }, // Send reason in request body
                headers: {
                    Authorization: `Bearer ${localStorage.getItem("librarian_token")}`,
                    "Content-Type": "application/json", // JSON content type
                },
                withCredentials: true,
            });
            toast.success("Member rejected successfully");
            setRejectModalState(false);
            resetReject(); // Clear the form
            setMemberToReject(null); // Clear the selected member
            fetchingUnverifiedMembers();
        } catch (error) {
            console.error("Error rejecting member:", error);
            toast.error(error.response?.data?.error || "Error rejecting member");
        }
    };

    return (
        <>
            <PageHeader title="Manage Books" />
            <div className={styles.container}>
                <div className={styles.tabs_area}>
                    <Tabs tabState={tabState} setTabState={setTabState} data={memebersData} />
                </div>
                <div className={styles.table_area}>
                    <div className={styles.table_heading}>
                        <h3>{tabState === 1 ? 'Unverified Members' : 'Verified Members'}</h3>
                        <div className={styles.filter_area}>
                            <Select display="Search By" options={['Library Name', 'City', 'State']} />
                            <div className={styles.search_area}>
                                <Input type="text" placeholder="Search" />
                                <Button>Search</Button>
                            </div>
                        </div>
                    </div>
                    {tabState==1?<Table
                        ColumnDef={membersDef}
                        buttons={[
                            { name: "Approve", onClick: approveMember },
                            { name: "Reject", onClick: openRejectModal },
                        ]}
                        Data={unverifiedMembers}
                        imageName={["Aadhaar"]}
                        imageKey={["aadhaar_image_url"]}
                    />:
                    <Table
                        ColumnDef={membersDef}
                        Data={verifiedMembers}
                        />
                    
                    }
                    <div className={styles.pagination_area}>
                        <Pagination />
                    </div>
                </div>
            </div>

            {/* Modal for Adding Book */}
            <Modal label="Add Book" modalState={modalState} setModalState={setModalState}>
                <form onSubmit={handleSubmit(AddBook)}>
                    <Input
                        register={register}
                        error={errors.title}
                        name="title"
                        validation={{ required: "Title is required" }}
                        type="text"
                        placeholder="Title"
                    />
                    <Input
                        register={register}
                        error={errors.author}
                        name="author"
                        validation={{ required: "Author is required" }}
                        type="text"
                        placeholder="Author"
                    />
                    <Input
                        register={register}
                        error={errors.publisher}
                        name="publisher"
                        validation={{ required: "Publisher is required" }}
                        type="text"
                        placeholder="Publisher"
                    />
                    <Input
                        register={register}
                        error={errors.library_id}
                        name="library_id"
                        validation={{ required: "Library ID is required" }}
                        type="number"
                        placeholder="Library ID"
                    />
                    <Input
                        register={register}
                        error={errors.total_copies}
                        name="total_copies"
                        validation={{ required: "Total Copies is required", min: 1 }}
                        type="number"
                        placeholder="Total Copies"
                    />
                    <Input
                        register={register}
                        error={errors.available_copies}
                        name="available_copies"
                        validation={{ required: "Available Copies is required", min: 1 }}
                        type="number"
                        placeholder="Available Copies"
                    />
                    <Input
                        register={register}
                        error={errors.version}
                        name="version"
                        type="text"
                        placeholder="Version"
                    />
                    <Input
                        name="book_image"
                        onChange={handleBookImage}
                        type="file"
                        placeholder="Book Image"
                    />
                    <Button type="submit" variant="primary">Add Book</Button>
                </form>
            </Modal>

            {/* Modal for Rejection Reason */}
            <Modal label="Reject Member" modalState={rejectModalState} setModalState={setRejectModalState}>
                <form onSubmit={handleRejectSubmit(rejectMember)}>
                    <Input
                        register={registerReject}
                        name="reason"
                        validation={{ required: "Rejection reason is required" }}
                        type="text"
                        placeholder="Enter reason for rejection"
                        error={rejectErrors.reason} // Display validation errors
                    />
                    <Button type="submit" variant="primary">Submit Rejection</Button>
                </form>
            </Modal>

            <DevTool control={control} />
        </>
    );
};

export default ManageMembers;