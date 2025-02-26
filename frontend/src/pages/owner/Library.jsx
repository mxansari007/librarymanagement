import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { DevTool } from "@hookform/devtools";
import { ToastContainer, toast } from "react-toastify";
import styles from "../../styles/OwnerLib.module.css";
import Modal from "../../components/Modal";
import Input from "../../components/Input";
import Button from "../../components/Button";
import Table from "../../components/Table";
import Pagination from "../../components/Pagination";
import Select from "../../components/Select";
import axios from "axios";

const libraryColDef = [
  { header: "Library ID", key: "id" },
  { header: "Library Name", key: "name" },
  { header: "Library Address", key: "address" },
  { header: "Subscription Type", key: "subscription_type" },
];

const OwnerManageLibrary = () => {
  const [modalState, setModalState] = useState(false);
  const [subtype, setSubtype] = useState("");
  const [libraries, setLibraries] = useState([]);
  const [editModalState, setEditModalState] = useState(false);
  const [editData, setEditData] = useState(null);

  const notifySuccess = (msg) => toast.success(msg);
  const notifyError = (msg) => toast.error(msg);

  // Create Library Form
  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    defaultValues: { libraryName: "", libraryAddress: "", subscription_type: "", rate: "" },
    mode: "all",
  });

  // Edit Library Form
  const {
    register: editRegister,
    handleSubmit: editHandleSubmit,
    reset: editReset,
    control: editControl,
    formState: { errors: editErrors },
  } = useForm({
    defaultValues: { libraryName: "", libraryAddress: "", city:"",subscription_type: "", rate: "" },
    mode: "all",
  });

  useEffect(() => {
    fetchLibraries();
  }, []);

  useEffect(() => {
    if (editData) {
      editReset({
        libraryName: editData.name || "",
        libraryAddress: editData.address || "",
        subscription_type: editData.subscription_type || "",
        rate: editData.rate || "",
      });
      setSubtype(editData.subscription_type || "");
    }
  }, [editData, editReset]);

  const fetchLibraries = async () => {
    try {
      const res = await axios.get(import.meta.env.VITE_BASE_URL + "/owner/libraries", {
        headers: { Authorization: `Bearer ${localStorage.getItem("owner_token")}` },
        withCredentials: true,
      });
      if (res.status === 200) setLibraries(res.data.libraries);
    } catch (error) {
      notifyError("Error fetching libraries");
    }
  };

  const createLibrary = async (data) => {
    try {
      const res = await axios.post(
        import.meta.env.VITE_BASE_URL + "/owner/create-library",
        {
          name: data.libraryName,
          address: data.libraryAddress,
          city: data.city,
          subscription_type: data.subscription_type,
          rate: data.subscription_type === "paid" ? Number(data.rate) : 0,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("owner_token")}` },
          withCredentials: true,
        }
      );
      if (res.status === 201) {
        notifySuccess("Library created successfully");
        fetchLibraries();
        setModalState(false);
        reset();
      }
    } catch (error) {
      notifyError("Library creation failed");
    }
  };

  const deleteLibrary = async (row) => {
    try {
      const res = await axios.delete(import.meta.env.VITE_BASE_URL + `/owner/libraries/${row.id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem("owner_token")}` },
        withCredentials: true,
      });
      if (res.status === 200) {
        notifySuccess("Library deleted successfully");
        fetchLibraries();
      }
    } catch (error) {
      notifyError("Library deletion failed");
    }
  };

  const handleUpdate = async (data) => {
    try {
      const res = await axios.patch(
        import.meta.env.VITE_BASE_URL + `/owner/libraries/${editData.id}`,
        {
          id: editData.id,
          name: data.libraryName,
          address: data.libraryAddress,
          subscription_type: data.subscription_type,
          rate: data.subscription_type === "paid" ? Number(data.rate) : 0,
        },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("owner_token")}` },
          withCredentials: true,
        }
      );
      if (res.status === 200) {
        notifySuccess("Library updated successfully");
        fetchLibraries();
        setEditModalState(false);
      }
    } catch (error) {
      notifyError("Library update failed");
      console.error("Library update error:", error);
    }
  };

  const editLibrary = (row) => {
    setEditData(row);
    setEditModalState(true);
  };

  return (
    <>
      <div className={styles.header}>
        <h1>Manage Library</h1>
      </div>

      <div className={styles.container}>
        <div className={styles.button}>
          <Button onClick={() => setModalState(true)}>Create Library</Button>
        </div>

        <div className={styles.table_area}>
          <div className={styles.table_heading}>
            <h3>Library List</h3>
            <div className={styles.filter_area}>
              <Select display="Search By" options={["Library Name", "City", "State"]} />
              <div className={styles.search_area}>
                <Input type="text" placeholder="Search" />
                <Button>Search</Button>
              </div>
            </div>
          </div>
          <Table
            ColumnDef={libraryColDef}
            Data={libraries}
            buttons={[
              { name: "Edit", onClick: editLibrary },
              { name: "Delete", onClick: deleteLibrary },
            ]}
          />
          <div className={styles.pagination_area}>
            <Pagination />
          </div>
        </div>

        {/* Create Library Modal */}
        <Modal label="Create Library" modalState={modalState} setModalState={setModalState}>
          <form className={styles.form} onSubmit={handleSubmit(createLibrary)}>
            <Input
              register={register}
              error={errors.libraryName}
              name="libraryName"
              validation={{ required: "Library Name is required" }}
              type="text"
              placeholder="Library Name"
            />
            <Input
              register={register}
              error={errors.libraryAddress}
              name="libraryAddress"
              validation={{ required: "Library Address is required" }}
              type="text"
              placeholder="Library Address"
            />

            <Input
              register={register}
              error={errors.city}
              name="city"
              validation={{ required: "City is required" }}
              type="text"
              placeholder="City"
            />

            <div className={styles.radio_group}>
              <p className={styles.radio_label}>Subscription Type</p>
              <div className={styles.radio_container}>
                <label className={styles.radio_option}>
                  <input
                    type="radio"
                    {...register("subscription_type", { required: "*Subscription type is required" })}
                    value="paid"
                    id="paid_create"
                    onChange={(e) => setSubtype(e.target.value)}
                  />
                  <span>Paid</span>
                </label>
                <label className={styles.radio_option}>
                  <input
                    type="radio"
                    {...register("subscription_type", { required: "*Subscription type is required" })}
                    value="free"
                    id="free_create"
                    onChange={(e) => setSubtype(e.target.value)}
                  />
                  <span>Free</span>
                </label>
              </div>
              {errors.subscription_type && (
                <p className={styles.error}>{errors.subscription_type.message}</p>
              )}
            </div>

            {subtype === "paid" && (
              <Input
                register={register}
                error={errors.rate}
                name="rate"
                validation={{ required: "Rate per month is required" }}
                type="number"
                placeholder="Rate Per Month (e.g., 500)"
              />
            )}
            <Button type="submit">Create</Button>
          </form>
        </Modal>

        {/* Edit Library Modal */}
        <Modal label="Edit Library" modalState={editModalState} setModalState={setEditModalState}>
          <form className={styles.form} onSubmit={editHandleSubmit(handleUpdate)}>
            <Input
              register={editRegister}
              error={editErrors.libraryName}
              name="libraryName"
              validation={{ required: "Library Name is required" }}
              type="text"
              placeholder="Library Name"
            />
            <Input
              register={editRegister}
              error={editErrors.libraryAddress}
              name="libraryAddress"
              validation={{ required: "Library Address is required" }}
              type="text"
              placeholder="Library Address"
            />

            <div className={styles.radio_group}>
              <p className={styles.radio_label}>Subscription Type</p>
              <div className={styles.radio_container}>
                <label className={styles.radio_option}>
                  <input
                    type="radio"
                    {...editRegister("subscription_type", { required: "*Subscription type is required" })}
                    value="paid"
                    id="paid_edit"
                    onChange={(e) => setSubtype(e.target.value)}
                  />
                  <span>Paid</span>
                </label>
                <label className={styles.radio_option}>
                  <input
                    type="radio"
                    {...editRegister("subscription_type", { required: "*Subscription type is required" })}
                    value="free"
                    id="free_edit"
                    onChange={(e) => setSubtype(e.target.value)}
                  />
                  <span>Free</span>
                </label>
              </div>
              {editErrors.subscription_type && (
                <p className={styles.error}>{editErrors.subscription_type.message}</p>
              )}
            </div>

            {subtype === "paid" && (
              <Input
                register={editRegister}
                error={editErrors.rate}
                name="rate"
                validation={{ required: "Rate per month is required" }}
                type="number"
                placeholder="Rate Per Month (e.g., 500)"
              />
            )}
            <Button type="submit">Update</Button>
          </form>
        </Modal>

        <ToastContainer />
        <DevTool control={control} />
      </div>
    </>
  );
};

export default OwnerManageLibrary;