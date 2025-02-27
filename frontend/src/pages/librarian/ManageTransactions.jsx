import { useEffect, useState, useRef } from "react";
import PageHeader from "../../components/PageHeader";
import apiRequest from "../../utils/api";
import { toast, ToastContainer } from "react-toastify";
import Table from "../../components/Table";
import Tabs from "../../components/Tabs";
import { ManageTransactionsTab } from "../../constants/tabs";


const columnDefs = [

    {header:"First Name", key: "first_name" },
    { header: "Last Name", key: "last_name" },
    { header: "Email", key: "member_email" },
    { header: "Book Title", key: "title" },
    { header: "ISBN", key: "isbn" },
];



const ManageTransactions = () => {
    const [pendingBookRequests, setPendingBookRequests] = useState([]);
    const hasFetched = useRef(false); // Prevent multiple executions
    const [tabState, setTabState] = useState(1);

    const fetchPendingBookRequests = async () => {
        const response = await apiRequest(
            "GET",
            "/librarian/pending-book-requests",
            {},
            localStorage.getItem("librarian_token")
        );
        
        if (response.success) {
            setPendingBookRequests(response.data.book_requests);
            toast.success("Fetched pending book requests");
        } else {
            toast.error(response.error);  // Show error only if response.success is false
        }
    };
    

    useEffect(() => {
        if (!hasFetched.current) {
            fetchPendingBookRequests();
            hasFetched.current = true; // Ensures it runs only once
        }
    }, []);


    const acceptBookRequest = async (row) => {

        try{

            const response = await apiRequest(
                "POST",
                `/librarian/approve-book`,
                {request_id: row.id},
                localStorage.getItem("librarian_token")
            );

            if (response.success) {
                toast.success("Book request accepted");
                fetchPendingBookRequests();
            } else {
                toast.error(response.error);
            }


        }
        catch(error){
             toast.error(error.response?.data?.error || "Error accepting book request"); // Show error only if response.success is false
            console.error('Error accepting book request:', error);
        }
    }




    return (
        <>
            <PageHeader title="Manage Transactions" />
            <ToastContainer />
            <Tabs tabState={tabState} setTabState={setTabState} data={ManageTransactionsTab} />
            <Table 
            ColumnDef={columnDefs} 
            Data={pendingBookRequests} 
            buttons={
                [
                    {
                        name:"Accept",
                        onClick: acceptBookRequest,
                    },
                    {
                        name:"Reject",
                        onClick: (request) => {}
                    }
                ]
            }
            />
        </>
    );
};

export default ManageTransactions;
