import { useEffect, useState, useRef } from "react";
import PageHeader from "../../components/PageHeader";
import apiRequest from "../../utils/api";
import { toast, ToastContainer } from "react-toastify";
import Table from "../../components/Table";
import Tabs from "../../components/Tabs";
import { ManageTransactionsTab } from "../../constants/tabs";

const columnDefs = [
  { header: "First Name", key: "first_name" },
  { header: "Last Name", key: "last_name" },
  { header: "Email", key: "member_email" },
  { header: "Book Title", key: "title" },
  { header: "ISBN", key: "isbn" },
  { header: "Status", key: "status" },
];

const returnedColumnDefs = [
  { header: "First Name", key: "member_first_name" },
  { header: "Last Name", key: "member_last_name" },
  { header: "Email", key: "member_email" },
  { header: "Book Title", key: "title" },
  { header: "ISBN", key: "isbn" },
  //   { header: "Borrowed At", key: "borrowed_at" },
  //   { header: "Returned At", key: "returned_at" },
];

const ManageTransactions = () => {
  const [requestedBooks, setRequestedBooks] = useState([]);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [returnedBooks, setReturnedBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const hasFetched = useRef(false); // Prevent multiple executions
  const [tabState, setTabState] = useState(1);

  const fetchAllBookRequests = async () => {
    setIsLoading(true);
    try {
      // Fetch requested books using status=requested parameter
      const requestedResponse = await apiRequest(
        "GET",
        "/librarian/book-requests?status=requested",
        {},
        {token:localStorage.getItem("librarian_token")}
      );

      // Fetch borrowed books using status=approved parameter
      const borrowedResponse = await apiRequest(
        "GET",
        "/librarian/book-requests?status=approved",
        {},
        {token:localStorage.getItem("librarian_token")}
      );

      // Fetch returned books
      const returnedResponse = await apiRequest(
        "GET",
        "/librarian/returned-books",
        {},
        {token:localStorage.getItem("librarian_token")}
      );

      if (requestedResponse.success) {
        setRequestedBooks(requestedResponse.data.book_requests || []);
      } else {
        toast.error(
          "Failed to fetch requested books: " + requestedResponse.error
        );
      }

      if (borrowedResponse.success) {
        setBorrowedBooks(borrowedResponse.data.book_requests || []);
      } else {
        toast.error(
          "Failed to fetch borrowed books: " + borrowedResponse.error
        );
      }

      if (returnedResponse.success) {
        setReturnedBooks(returnedResponse.data.returned_books || []);
      } else {
        toast.error(
          "Failed to fetch returned books: " + returnedResponse.error
        );
      }
    } catch (error) {
      console.error("Error fetching book requests:", error);
      toast.error("Something went wrong while fetching book requests");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!hasFetched.current) {
      fetchAllBookRequests();
      hasFetched.current = true; // Ensures it runs only once
    }
  }, []);

  const acceptBookRequest = async (row) => {
    try {
      const response = await apiRequest(
        "POST",
        `/librarian/approve-book`,
        { request_id: row.id },
        {token:localStorage.getItem("librarian_token")}
      );

      if (response.success) {
        toast.success("Book request accepted");
        fetchAllBookRequests(); // Refresh both lists
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Error accepting book request"
      );
      console.error("Error accepting book request:", error);
    }
  };

  const rejectBookRequest = async (row) => {
    try {
      const response = await apiRequest(
        "POST",
        `/librarian/reject-book`,
        { request_id: row.id },
        {token:localStorage.getItem("librarian_token")}
      );

      if (response.success) {
        toast.success("Book request rejected");
        fetchAllBookRequests(); // Refresh both lists
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      toast.error(
        error.response?.data?.error || "Error rejecting book request"
      );
      console.error("Error rejecting book request:", error);
    }
  };

  const returnBook = async (row) => {
    try {
      const response = await apiRequest(
        "POST",
        `/librarian/return-book`,
        { transaction_id: row.transaction_id },
        {token:localStorage.getItem("librarian_token")}
      );

      if (response.success) {
        toast.success("Book returned successfully");
        fetchAllBookRequests(); // Refresh all lists
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Error returning book");
      console.error("Error returning book:", error);
    }
  };

  // Get action buttons based on the current tab
  const getActionButtons = () => {
    if (tabState === 1) {
      // Requested tab
      return [
        {
          name: "Accept",
          onClick: acceptBookRequest,
        },
        {
          name: "Reject",
          onClick: rejectBookRequest,
        },
      ];
    } else if (tabState === 2) {
      // Borrowed tab
      return [
        {
          name: "Recieve",
          onClick: returnBook,
        },
      ];
    } else {
      // Returned tab
      return []; // No actions for returned books
    }
  };

  return (
    <>
      <PageHeader title="Manage Transactions" />
      <ToastContainer />
      <Tabs
        tabState={tabState}
        setTabState={setTabState}
        data={ManageTransactionsTab}
      />

      {isLoading ? (
        <div className="loading-container">
          <p>Loading book requests...</p>
        </div>
      ) : (
        <Table
          ColumnDef={tabState === 3 ? returnedColumnDefs : columnDefs}
          Data={
            tabState === 1
              ? requestedBooks
              : tabState === 2
              ? borrowedBooks
              : returnedBooks
          }
          buttons={getActionButtons()}
        />
      )}
    </>
  );
};

export default ManageTransactions;
