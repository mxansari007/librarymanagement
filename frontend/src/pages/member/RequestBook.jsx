import React, { useState, useEffect } from "react";
import PageHeader from "../../components/PageHeader";
import Input from "../../components/Input";
import Button from "../../components/Button";
import Select from "../../components/Select";
import Table from "../../components/Table";
import styles from "../../styles/RequestBook.module.css";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
const RequestBook = () => {
  const [searchType, setSearchType] = useState("name");
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [searchResults, setSearchResults] = useState([]);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearchTypeChange = (e) => {
    setSearchType(e.target.value);
  };

  const handleQueryChange = (e) => {
    setSearchQuery(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    setHasSearched(true);

    try {
      // Construct the API endpoint based on search type
      let endpoint = import.meta.env.VITE_BASE_URL + "/member/fetch-book?";

      switch (searchType) {
        case "name":
          endpoint += `title=${encodeURIComponent(searchQuery)}`;
          break;
        case "isbn":
          endpoint += `isbn=${encodeURIComponent(searchQuery)}`;
          break;
        case "author":
          endpoint += `author=${encodeURIComponent(searchQuery)}`;
          break;
        default:
          endpoint += `title=${encodeURIComponent(searchQuery)}`;
      }

      const response = await axios({
        method: "GET",
        url: endpoint,
        withCredentials: true, // Ensures cookies are sent if used
        headers: {
          Authorization: `Bearer ${localStorage.getItem("member_token")}`,
        },
      });

      //   if (response.status !== 200 || response.status !== 201) {
      //     throw new Error('Failed to fetch books');
      //   }

      setSearchResults(response.data.books || []);
    } catch (error) {
      console.error("Error searching books:", error);
      setSearchResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestBook = async (book) => {
    try {
      const response = await axios.post(
        import.meta.env.VITE_BASE_URL + "/member/request-book",
        { book_id: book.id },
        {
          withCredentials: true, // Ensures cookies are sent if used
          headers: {
            Authorization: `Bearer ${localStorage.getItem("member_token")}`,
          },
        }
      );

      if (response.status === 200) {
        toast.success("Book request sent successfully");
      } else {
        throw new Error("Failed to send book request");
      }
    } catch (error) {
      if (error.response.status === 409) {
        toast.warn("You have already requested this book");
      } else {
        console.error("Error requesting book:", error);
        toast.error("Failed to send book request");
      }
    }
  };

  // Define column structure for the Table component
  const columnDefinitions = [
    { header: "Title", key: "title" },
    { header: "Author", key: "author" },
    { header: "ISBN", key: "isbn" },
    { header: "Publisher", key: "publisher" },
  ];

  // Define action buttons for the Table component
  const actionButtons = [
    {
      name: "Request",
      onClick: handleRequestBook,
    },
  ];

  return (
    <>
      <PageHeader title={"Request Book"} />
      <div className={styles.container}>
        <div className={styles.searchContainer}>
          <div className={styles.searchTypeWrapper}>
            <Select
              label={"Select Search Type"}
              variant={"big"}
              options={[{label:"Name",value:"name"}, {label:"ISBN",value:"isbn"}, {label:"Author",value:"author"}]}
              value={searchType}
              onChange={handleSearchTypeChange}
              className={styles.selectField}
            />
          </div>

          <form onSubmit={handleSubmit} className={styles.searchForm}>
            <div className={styles.inputWrapper}>
              <Input
                type="text"
                label={`Search by ${searchType}`}
                variant={"big"}
                placeholder={`Enter ${searchType} to search`}
                className={styles.inputField}
                value={searchQuery}
                onChange={handleQueryChange}
              />
            </div>

            <div className={styles.buttonWrapper}>
              <Button
                variant={"primary"}
                type={"submit"}
                className={styles.searchButton}
                disabled={isLoading}>
                {isLoading ? "Searching..." : "Search"}
              </Button>
            </div>
          </form>
        </div>

        {hasSearched && (
          <div className={styles.resultsContainer}>
            <h2 className={styles.resultsTitle}>
              {isLoading
                ? "Searching..."
                : searchResults.length > 0
                ? `Found ${searchResults.length} book${
                    searchResults.length === 1 ? "" : "s"
                  }`
                : "No books found"}
            </h2>

            {!isLoading && searchResults.length > 0 && (
              <Table
                Data={searchResults}
                ColumnDef={columnDefinitions}
                buttons={actionButtons}
                imageKey={["book_image"]}
                imageName={["Book Image"]}
              />
            )}

            {!isLoading && searchResults.length === 0 && hasSearched && (
              <div className={styles.noResults}>
                <p>No books found matching your search criteria.</p>
                <p>
                  Try adjusting your search terms or contact the librarian for
                  assistance.
                </p>
              </div>
            )}
          </div>
        )}
        <ToastContainer />
      </div>
    </>
  );
};

export default RequestBook;
