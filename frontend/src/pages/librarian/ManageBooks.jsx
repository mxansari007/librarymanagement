import PageHeader from "../../components/PageHeader";
import styles from "../../styles/OwnerLib.module.css";
import Button from "../../components/Button";
import Select from "../../components/Select";
import Table from "../../components/Table";
import Pagination from "../../components/Pagination";
import Input from "../../components/Input";
import { useForm } from "react-hook-form";
import { DevTool } from "@hookform/devtools";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import Modal from "../../components/Modal";
import { useState, useEffect } from "react";
import apiRequest from "../../utils/api";

const libraryColDef = [
  { header: "Book ID", key: "id" },
  { header: "Title", key: "title" },
  { header: "Author", key: "author" },
  { header: "Publisher", key: "publisher" },
  { header: "Available Copies", key: "available_copies" },
];

const ManageBooks = () => {
  const [modalState, setModalState] = useState(false);
  const [allBooks, setAllBooks] = useState([]);
  const {
    register,
    control,
    formState: { errors },
    handleSubmit,
    setValue,
  } = useForm({
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
      const res = await apiRequest('GET','/librarian/books',{},{token})

      console.log("Response:", res);

      if (res.success) {
        setAllBooks(res.data.data);
      }else{
        toast.error("Failed to fetch books: " + res.error);
      }
    } catch (error) {
      console.error(
        "Error fetching books:",
        error.response?.data || error.message
      );
      toast.error("Error fetching books");
    }
  };

  useEffect(() => {
    fetchingBooks();
  }, []);

  const handleBookImage = (e) => {
    const file = e.target.files[0];
    setValue("book_image", file); // Set file directly (multipart/form-data)
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

      const res = await apiRequest('POST','/librarian/add-book',formData, {
                                    token: localStorage.getItem("librarian_token"),
                                    headers:{
                                      "Content-Type": "multipart/form-data"
                                    }
                                  })


      if (res.success) {
        toast.success("Book added successfully");
        setModalState(false);
        fetchingBooks();
      }
      else{
        toast.error("Failed to add book: " + res.error);
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Error adding book");
    }
  };

  return (
    <>
      <PageHeader title="Manage Books" />

      <div className={styles.container}>
        <div className={styles.button}>
          <Button onClick={() => setModalState(true)}>Add Book</Button>
        </div>

        <div className={styles.table_area}>
          <div className={styles.table_heading}>
            <h3>Library List</h3>
            <div className={styles.filter_area}>
              <div>
                <Select
                  display="Search By"
                  options={["Library Name", "City", "State"]}
                />
              </div>
              <div className={styles.search_area}>
                <Input type="text" placeholder="Search" />
                <Button>Search</Button>
              </div>
            </div>
          </div>

          <Table
            ColumnDef={libraryColDef}
            Data={allBooks}
            imageName={["Book Image"]}
            imageKey={["book_image"]}
          />

          <div className={styles.pagination_area}>
            <Pagination />
          </div>
        </div>
      </div>

      {/* Modal for Adding Book */}
      <Modal
        label="Add Book"
        modalState={modalState}
        setModalState={setModalState}>
        <form className="form" onSubmit={handleSubmit(AddBook)}>
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

          <Button type="submit" variant="primary">
            Add Book
          </Button>
        </form>
      </Modal>
      <ToastContainer />
      <DevTool control={control} />
    </>
  );
};

export default ManageBooks;
