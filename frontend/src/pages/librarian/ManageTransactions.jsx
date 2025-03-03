import { useEffect, useState, useRef } from "react";
import PageHeader from "../../components/PageHeader";
import apiRequest from "../../utils/api";
import { toast, ToastContainer } from "react-toastify";
import Table from "../../components/Table";
import Tabs from "../../components/Tabs";
import { ManageTransactionsTab } from "../../constants/tabs";
import Modal from "../../components/Modal";
import Calendar from "react-calendar";
import Button from "../../components/Button";
import "react-calendar/dist/Calendar.css";

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
];

const ManageTransactions = () => {
  const [requestedBooks, setRequestedBooks] = useState([]);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [returnedBooks, setReturnedBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const hasFetched = useRef(false);
  const [tabState, setTabState] = useState(1);
  const [dueDate, setDueDate] = useState(new Date()); 
  const [dateModalOpen, setDateModalOpen] = useState(false);
  const [requestedBook, setRequestedBook] = useState(null);

  const fetchAllBookRequests = async () => {
    setIsLoading(true);
    try {
      const requestedResponse = await apiRequest(
        "GET",
        "/librarian/book-requests?status=requested",
        {},
        { token: localStorage.getItem("librarian_token") }
      );

      const borrowedResponse = await apiRequest(
        "GET",
        "/librarian/book-requests?status=approved",
        {},
        { token: localStorage.getItem("librarian_token") }
      );

      const returnedResponse = await apiRequest(
        "GET",
        "/librarian/returned-books",
        {},
        { token: localStorage.getItem("librarian_token") }
      );

      if (requestedResponse.success) {
        setRequestedBooks(requestedResponse.data.book_requests || []);
      } else {
        toast.error("Failed to fetch requested books: " + requestedResponse.error);
      }

      if (borrowedResponse.success) {
        setBorrowedBooks(borrowedResponse.data.book_requests || []);
      } else {
        toast.error("Failed to fetch borrowed books: " + borrowedResponse.error);
      }

      if (returnedResponse.success) {
        setReturnedBooks(returnedResponse.data.returned_books || []);
      } else {
        toast.error("Failed to fetch returned books: " + returnedResponse.error);
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
      hasFetched.current = true;
    }
  }, []);

  const acceptBookRequest = async (isDefault, row) => {
    if (!row) {
      toast.error("No book selected");
      return;
    }
    console.log(row)

    try {
      const dueDateFinal = isDefault ? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) : dueDate;

      const response = await apiRequest(
        "POST",
        "/librarian/approve-book",
        { request_id: row.id, due_date: dueDateFinal || null },
        { token: localStorage.getItem("librarian_token") }
      );

      if (response.success) {
        toast.success("Book request accepted");
        setDateModalOpen(false);
        fetchAllBookRequests();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Error accepting book request");
      console.error("Error accepting book request:", error);
    }
  };

  const handleAcceptRequest = (row) => {
    setDateModalOpen(true);
    setRequestedBook(row);
  };

  const rejectBookRequest = async (row) => {
    try {
      const response = await apiRequest(
        "POST",
        `/librarian/reject-book`,
        { request_id: row.id },
        { token: localStorage.getItem("librarian_token") }
      );

      if (response.success) {
        toast.success("Book request rejected");
        fetchAllBookRequests();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Error rejecting book request");
      console.error("Error rejecting book request:", error);
    }
  };

  const returnBook = async (row) => {
    try {
      const response = await apiRequest(
        "POST",
        `/librarian/return-book`,
        { transaction_id: row.transaction_id },
        { token: localStorage.getItem("librarian_token") }
      );

      if (response.success) {
        toast.success("Book returned successfully");
        fetchAllBookRequests();
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Error returning book");
      console.error("Error returning book:", error);
    }
  };

  const getActionButtons = () => {
    if (tabState === 1) {
      return [
        {
          name: "Accept",
          onClick: handleAcceptRequest,
        },
        {
          name: "Reject",
          onClick: rejectBookRequest,
        },
      ];
    } else if (tabState === 2) {
      return [
        {
          name: "Receive",
          onClick: returnBook,
        },
      ];
    } else {
      return [];
    }
  };

  return (
    <>
      <PageHeader title="Manage Transactions" />
      <ToastContainer />
      <Tabs tabState={tabState} setTabState={setTabState} data={ManageTransactionsTab} />

      {isLoading ? (
        <div className="loading-container">
          <p>Loading book requests...</p>
        </div>
      ) : (
        <Table
          ColumnDef={tabState === 3 ? returnedColumnDefs : columnDefs}
          Data={tabState === 1 ? requestedBooks : tabState === 2 ? borrowedBooks : returnedBooks}
          buttons={getActionButtons()}
        />
      )}

      <Modal modalState={dateModalOpen} setModalState={() => setDateModalOpen(false)} label="Set Due Date">
        <div style={{ display: "flex", width: "100%", justifyContent: "center", alignItems: "center" }}>
          <Calendar onChange={setDueDate} value={dueDate} minDate={new Date()} />
        </div>
        <Button onClick={() => acceptBookRequest(false, requestedBook)}>Select This Date</Button>
        <Button onClick={() => acceptBookRequest(true, requestedBook)}>Default (7 Days)</Button>
        <Button onClick={() => setDateModalOpen(false)} variant="secondary">
          Cancel
        </Button>
      </Modal>
    </>
  );
};

export default ManageTransactions;
