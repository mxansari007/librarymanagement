import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom"; // Changed to useNavigate hook
import libraryImage from "../../assets/library-bg.png";
import styles from "../../styles/OwnerLoginSignUp.module.css";
import ss from "../../styles/SelectLib.module.css";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { useForm } from "react-hook-form";
import { DevTool } from "@hookform/devtools";
import { toast, ToastContainer } from "react-toastify";
import Select from "../../components/Select";
import axios from "axios";
import { debounce } from "lodash";
import apiRequest from "../../utils/api";

const MemberLoginSignUp = () => {
  const navigate = useNavigate(); // Properly initialize the navigate hook
  const [pageState, setPageState] = useState("login");
  const [selectLib, setSelectLib] = useState(false);
  const [libId, setLibId] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [libraries, setLibraries] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);

  // const handleSearchChange = (event) => {
  //   setSearchText(event.target.value);
  //   setShowDropdown(event.target.value.length > 0); // Show dropdown when there's input
  // };

  // SET DROP DOWN TO FALSE ON ESC BUTTON PRESS

  useEffect(() => {
    const handleEsc = (event) => {
      if (event.key === "Escape") {
        setShowDropdown(false);
      }
    };
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("keydown", handleEsc);
    };
  }, []);

  // set drop down to false on outside click search input

  const selectLibRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        selectLibRef.current &&
        !selectLibRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };

    document.addEventListener("mousedown", () =>
      setTimeout(() => handleClickOutside, 500)
    );
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // if no text in search input, hide dropdown
  useEffect(() => {
    if (searchText.length === 0) {
      setShowDropdown(false);
    }
  }, [searchText]);



  const handleLibrarySelect = (library) => {
    setSelectLib(false);
    setPageState("confirm");
    setValue("libraryId", library.id);
  };

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "all",
  });

  const {
    register: signUpRegister,
    handleSubmit: signUpHandleSubmit,
    watch,
    setValue,
    formState: { errors: signUpErrors },
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      adhaarNumber: "",
      aadhaar_image: null,
      library_id: "",
    },
    mode: "all",
  });

  const notifyError = (msg) => toast.error(msg);
  const notifySuccess = (msg) => toast.success(msg);

  const handleAdhaar = (e) => {
    const file = e.target.files[0];
    setValue("aadhaar_image", file); // Set file directly (multipart/form-data)
  };

  const onSubmitSignUp = async (data) => {
    console.log("Sign Up Data:", data);
    const formData = new FormData();
    formData.append("firstname", data.firstName);
    formData.append("lastname", data.lastName);
    formData.append("email", data.email);
    formData.append("password", data.password);
    formData.append("aadhaar_number", Number(data.adhaarNumber));
    formData.append("library_id", Number(data.library_id));

    if (data.aadhaar_image) {
      formData.append("aadhaar_image", data.aadhaar_image);
    }

    try {
      const res = await axios.post(
        import.meta.env.VITE_BASE_URL + "/member/signup",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      

      if (res.status === 201) {
        notifySuccess("Signup successful! Please login.");
        setPageState("login");
      }
      setSelectLib(false);
      navigate("/member/pending");
    } catch (error) {
      notifyError(error.response?.data?.error || "Signup failed.");
    }
  };

  const onSubmitLogin = async (data) => {
    try {
      const res = await apiRequest('POST','/user/login',
        {
          email: data.email,
          password_hash: data.password,
        }
      )

      if (res.success) {
        console.log(res)
        localStorage.setItem("member_token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        localStorage.setItem("route", "Dashboard");
        navigate("/member/dashboard"); // Using the hook correctly
      }
    } catch (error) {
      if (
        error.response.data.verified == false ||
        error.response.data.rejected == true
      ) {
        notifyError(
          "Your account has not been verified yet. Please check your email for verification link."
        );
        localStorage.setItem("pending_member", data.email);
        navigate("/member/pending");
        return;
      }
      notifyError("Login failed. Check your credentials.");
    }
  };

  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
    fetchLibraryData(event.target.value); // Call debounced function
  };

  // use controller
  const fetchLibraryData = debounce(async (query) => {
    if (query) {
      try {
        const response = await apiRequest('POST', '/open/libraries', {
          name: "", // Ensure `name` is included, even if empty
          city: query, // Send city as per backend expectations
        }
        )

        setLibraries(response.data.data);
        setShowDropdown(true);
      } catch (error) {
        console.error("Error fetching library data:", error);
      }
    }
  }, 500);

  return (
    <>
      {!selectLib ? (
        <div className={styles.bg_style}>
          <div className={styles.container}>
            <div className={styles.bg_black_overlay_screen}></div>
            <div className={styles.flex_container}>
              <div className={styles.heading}>
                <h1>Library Management System</h1>
                <p>
                  Change your role <Link to="/">here</Link>
                </p>
              </div>
            </div>
            <div className={styles.flex_container}>
              <div className={styles.input_container}>
                {pageState === "signup" ? (
                  <div>
                    <h3>Create An Member Account</h3>
                    <p>Start managing your own Library</p>
                    <form
                      className="form"
                      onSubmit={signUpHandleSubmit(onSubmitSignUp)}>
                      <Input
                        name="firstName"
                        register={signUpRegister}
                        error={signUpErrors.firstName}
                        validation={{ required: "First Name is required" }}
                        type="text"
                        placeholder="First Name"
                      />
                      <Input
                        name="lastName"
                        register={signUpRegister}
                        error={signUpErrors.lastName}
                        validation={{ required: "Last Name is required" }}
                        type="text"
                        placeholder="Last Name"
                      />
                      <Input
                        name="email"
                        register={signUpRegister}
                        error={signUpErrors.email}
                        validation={{
                          required: "Email is required",
                          pattern: {
                            value: /\S+@\S+\.\S+/,
                            message:
                              "Entered value does not match email format",
                          },
                        }}
                        type="email"
                        placeholder="Email"
                      />
                      <Input
                        name="adhaarNumber"
                        register={signUpRegister}
                        error={signUpErrors.adhaarNumber}
                        validation={{
                          required: "Adhaar Number is required",
                          pattern: {
                            value: /^[2-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$/,
                            message:
                              "Entered value does not match Adhaar format",
                          },
                        }}
                        type="number"
                        placeholder={"Enter Adhaar Number"}
                      />
                      <Input
                        type="file"
                        name="aadhaar_image" // Changed from "adhaarCard" to "aadhaar_image"
                        placeholder="Upload Adhaar Card"
                        onChange={handleAdhaar}
                      />
                      <Input
                        name="password"
                        register={signUpRegister}
                        error={signUpErrors.password}
                        validation={{ required: "Password is required" }}
                        type="password"
                        placeholder="Password"
                      />
                      <Input
                        name="confirmPassword"
                        register={signUpRegister}
                        error={signUpErrors.confirmPassword}
                        validation={{
                          required: "Confirm Password is required",
                          validate: (value) =>
                            value === watch("password") ||
                            "Password does not match",
                        }}
                        type="password"
                        placeholder="Confirm Password"
                      />
                      <Button onClick={() => setSelectLib(true)}>
                        Sign Up
                      </Button>
                      <p>
                        Already have an account?{" "}
                        <a onClick={() => setPageState("login")}>Login</a>
                      </p>
                    </form>
                  </div>
                ) : (
                  <div>
                    <h3>Member Login</h3>
                    <p>Start managing your own Library</p>
                    {/* Fixed login form to use handleSubmit with onSubmitLogin */}
                    <form
                      className="form"
                      onSubmit={handleSubmit(onSubmitLogin)}>
                      <Input
                        name="email"
                        register={register}
                        error={errors.email}
                        validation={{
                          required: "Email is required",
                          pattern: {
                            value: /\S+@\S+\.\S+/,
                            message:
                              "Entered value does not match email format",
                          },
                        }}
                        type="email"
                        placeholder="Email"
                      />
                      <Input
                        name="password"
                        register={register}
                        error={errors.password}
                        validation={{ required: "Password is required" }}
                        type="password"
                        placeholder="Password"
                      />
                      <Button type="submit">Login</Button>
                      <p>
                        Don't have an account?{" "}
                        <a onClick={() => setPageState("signup")}>
                          Create your Account
                        </a>
                      </p>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className={ss.bg_style}>
          <div className={ss.bg_black_overlay_screen}></div>
          <div className={ss.container}>
            <h2 className={ss.title}>Select Your Library</h2>
            <Select
              display="Search By"
              options={["City", "Library Name"]}
              onChange={setSelectLib}
              className={ss.selectBox}
            />
            <div className={ss.searchWrapper}>
              <Input
                type="text"
                ref={selectLibRef}
                placeholder="Search Library"
                value={searchText}
                onChange={handleSearchChange}
                className={ss.searchInput}
              />
              {showDropdown && (
                <div className={ss.dropdown}>
                  {libraries.length > 0 ? (
                    libraries
                      .filter(
                        (library) =>
                          library.name
                            .toLowerCase()
                            .includes(searchText.toLowerCase()) ||
                          library.city
                            .toLowerCase()
                            .includes(searchText.toLowerCase())
                      )
                      .map((library) => (
                        <div
                          key={library.id}
                          onClick={() => {
                            console.log("Selected library:", library);
                            setValue("library_id", library.id); // Ensure value is set in the form
                            setTimeout(() => {
                              setShowDropdown(false);
                            }, 500);
                          }}
                          className={ss.dropdownItem}>
                          {library.name}, {library.city}
                        </div>
                      ))
                  ) : (
                    <div className={ss.noResults}>No libraries found</div>
                  )}
                </div>
              )}
            </div>
            <Button
              onClick={signUpHandleSubmit(onSubmitSignUp)}
              className={ss.continueButton}>
              Continue
            </Button>

            <div className={ss.result_area}>{/* Results will go here */}</div>
          </div>
        </div>
      )}
      <ToastContainer /> {/* Added ToastContainer for notifications */}
    </>
  );
};

export default MemberLoginSignUp;
