import { useState, useRef, useEffect } from 'react';
import PageHeader from "../../components/PageHeader";
import { MyBooksTab } from "../../constants/tabs";
import Tabs from "../../components/Tabs";
import Table from "../../components/Table";
import { toast } from "react-toastify";
import apiRequest from "../../utils/api";

const MyBooks = () => {
  const [tabState, setTabState] = useState(1);
  const [borrowedBooks, setBorrowedBooks] = useState([]);
  const [requestedBooks, setRequestedBooks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const hasFetched = useRef(false);

  // Define column structure for the Table component
  const columnDefinitions = [
    { header: "Title", key: "title" },
    { header: "Author", key: "author" },
    { header: "ISBN", key: "isbn" },
    { header: "Publisher", key: "publisher" },
    { header: "Status", key: "status" },
  ];

  const fetchMyBooks = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("member_token");

      // Fetch borrowed books
      const borrowedResponse = await apiRequest(
        "GET",
        "/member/fetch-requests?status=approved",
        {},
        { token }
      );

      // Fetch requested books
      const requestedResponse = await apiRequest(
        "GET",
        "/member/fetch-requests?status=requested",
        {},
        { token }
      );

      if (borrowedResponse.success) {
        setBorrowedBooks(borrowedResponse.data.book_requests || []);
      } else {
        toast.error("Failed to fetch borrowed books: " + borrowedResponse.error);
      }

      if (requestedResponse.success) {
        setRequestedBooks(requestedResponse.data.book_requests || []);
      } else {
        toast.error("Failed to fetch requested books: " + requestedResponse.error);
      }
    } catch (error) {
      console.error("Error fetching books:", error);
      toast.error("Something went wrong while fetching your books");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!hasFetched.current) {
      fetchMyBooks();
      hasFetched.current = true;
    }
  }, []);

  // Handle returning a book
  const handleReturnBook = async (book) => {
    try {
      const response = await apiRequest(
        "POST",
        "/member/return-book",
        { book_id: book.id },
        { token: localStorage.getItem("member_token") }
      );

      if (response.success) {
        toast.success("Book return request submitted successfully");
        fetchMyBooks(); // Refresh the book lists
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error("Error returning book:", error);
      toast.error("Failed to submit return request");
    }
  };

  // Handle canceling a book request
  const handleCancelRequest = async (book) => {
    try {
      const response = await apiRequest(
        "DELETE",
        `/member/cancel-request/${book.id}`,
        {},
        { token: localStorage.getItem("member_token") }
      );

      if (response.success) {
        toast.success("Book request canceled successfully");
        fetchMyBooks(); // Refresh the book lists
      } else {
        toast.error(response.error);
      }
    } catch (error) {
      console.error("Error canceling request:", error);
      toast.error("Failed to cancel book request");
    }
  };

  // Define action buttons based on the current tab
  const getActionButtons = () => {
    if (tabState === 1) {
      // Borrowed Books
      return [
        {
          name: "Return",
          onClick: handleReturnBook,
        },
      ];
    } else {
      // Requested Books
      return [
        {
          name: "Cancel",
          onClick: handleCancelRequest,
        },
      ];
    }
  };

  return (
    <>
      <PageHeader title="My Books" />
      <Tabs data={MyBooksTab} tabState={tabState} setTabState={setTabState} />

      {tabState === 1 && (
        <div>
          <Table 
            ColumnDef={columnDefinitions} 
            Data={borrowedBooks} 
            buttons={getActionButtons()} 
          />
        </div>
      )}

      {tabState === 2 && (
        <div>
          <Table 
            ColumnDef={columnDefinitions} 
            Data={requestedBooks} 
            buttons={getActionButtons()} // ✅ Fixed incorrect syntax
          />
        </div>
      )}
    </>
  );
};

export default MyBooks;
