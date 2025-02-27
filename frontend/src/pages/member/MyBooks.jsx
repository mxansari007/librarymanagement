import { useState, useEffect, useRef } from "react";
import PageHeader from "../../components/PageHeader";
import { MyBooksTab } from "../../constants/tabs";
import Tabs from "../../components/Tabs";
import Table from "../../components/Table";
import apiRequest from "../../utils/api";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

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
      // Fetch borrowed books
      const borrowedResponse = await apiRequest(
        "GET",
        "/member/fetch-requests?status=approved",
        {},
        localStorage.getItem("member_token")
      );

      // Fetch requested books
      const requestedResponse = await apiRequest(
        "GET",
        "/member/fetch-requests?status=requested",
        {},
        localStorage.getItem("member_token")
      );

      if (borrowedResponse.success) {
        setBorrowedBooks(borrowedResponse.data.book_requests || []);
      } else {
        toast.error(
          "Failed to fetch borrowed books: " + borrowedResponse.error
        );
      }

      if (requestedResponse.success) {
        setRequestedBooks(requestedResponse.data.book_requests || []);
      } else {
        toast.error(
          "Failed to fetch requested books: " + requestedResponse.error
        );
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
        localStorage.getItem("member_token")
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
    console.log("Canceling request for book:", book);
    try {
      const response = await apiRequest(
        "DELETE",
        `/member/cancel-request/${book.id}`,
        {},
        localStorage.getItem("member_token")
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

      {isLoading ? (
        <div className="loading-container">
          <p>Loading your books...</p>
        </div>
      ) : (
        <Table
          ColumnDef={columnDefinitions}
          Data={tabState === 1 ? borrowedBooks : requestedBooks}
          buttons={getActionButtons()}
          imageKey={["book_image"]}
          imageName={["Book Image"]}
        />
      )}

      <ToastContainer />
    </>
  );
};

export default MyBooks;
