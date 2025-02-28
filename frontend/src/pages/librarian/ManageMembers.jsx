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
import apiRequest from "../../utils/api";

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
            const res = await apiRequest('GET',`/librarian/fetch-members/${user.library_id}?is_verified=false`,
            {token:localStorage.getItem("librarian_token")})
            
            if(res.success){
                setUnverifiedMembers(res.data.data);
            }
            else{
                toast.error("Failed to fetch unverified members: " + res.error);
            }
        } catch (error) {
            console.error("Fetching unverified members error:", error);
            toast.error("Error fetching unverified members");
        }
    };

    const fetchingVerifiedMembers = async () => {
        const user = JSON.parse(localStorage.getItem("user"));
        try {
            const res = await apiRequest('GET',`/librarian/fetch-members/${user.library_id}?is_verified=true`,
                {token: localStorage.getItem("librarian_token")})
            
            if(res.success){
                setVerifiedMembers(res.data.data);
            }else{
                toast.error("Failed to fetch verified members: " + res.error);
            }
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
                            <div>
                                <Select display="Search By" options={['Library Name', 'City', 'State']} />
                            </div>
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

        </>
    );
};

export default ManageMembers;