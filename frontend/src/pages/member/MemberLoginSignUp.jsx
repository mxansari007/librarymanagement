import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom' // Changed to useNavigate hook
import libraryImage from '../../assets/library-bg.png'
import styles from '../../styles/OwnerLoginSignUp.module.css'
import Button from '../../components/Button'
import Input from '../../components/Input'
import { useForm } from 'react-hook-form'
import { DevTool } from '@hookform/devtools'
import { toast, ToastContainer } from "react-toastify";
import axios from 'axios'

const MemberLoginSignUp = () => {
  const navigate = useNavigate(); // Properly initialize the navigate hook
  const [pageState, setPageState] = useState('login')
  


  const { register, handleSubmit, formState: { errors } } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: 'all'
  })

  const { register: signUpRegister, handleSubmit: signUpHandleSubmit, watch, setValue , formState: { errors: signUpErrors } } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      adhaarNumber: "",
      aadhaar_image: null
    },
    mode: 'all'
  })

  const notifyError = (msg) => toast.error(msg);
  const notifySuccess = (msg) => toast.success(msg);

  const handleAdhaar = (e) => {
        const file = e.target.files[0];
        setValue("aadhaar_image", file);  // Set file directly (multipart/form-data)
    };

const onSubmitSignUp = async (data) => {
  const formData = new FormData();
  formData.append("firstname", data.firstName);
  formData.append("lastname", data.lastName);
  formData.append("email", data.email);
  formData.append("password", data.password);
  formData.append("aadhaar_number", Number(data.adhaarNumber));
  
  if (data.aadhaar_image) {
    formData.append("aadhaar_image", data.aadhaar_image);
  }

  try {
    const res = await axios.post(import.meta.env.VITE_BASE_URL + "/member/signup", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    
    if (res.status === 201) {
      notifySuccess("Signup successful! Please login.");
      setPageState("login");
    }
  } catch (error) {
    notifyError(error.response?.data?.error || "Signup failed.");
  }
};

  const onSubmitLogin = async (data) => {
    try {
      const res = await axios.post(import.meta.env.VITE_BASE_URL + "/user/login", {
        email: data.email,
        password: data.password,
      }, { withCredentials: true });

      if (res.status === 200) {
        localStorage.setItem("member_token", res.data.token);
        localStorage.setItem("user", JSON.stringify(res.data.user));
        navigate("/member/dashboard"); // Using the hook correctly
      }
    } catch (error) {
      notifyError("Login failed. Check your credentials.");
    }
  };

  return (
    <div className={styles.bg_style}>
      <div className={styles.bg_black_overlay_screen}></div>
      <div className={styles.container}>
        <div className={styles.flex_container}>
          <div className={styles.heading}>
            <h1>Library Management System</h1>
            <p>Change your role <Link to="/">here</Link></p>
          </div>
        </div>
        <div className={styles.flex_container}>
          <div className={styles.input_container}>
            {pageState === 'signup' ? (
              <div>
                <h3>Create An Member Account</h3>
                <p>Start managing your own Library</p>
                <form onSubmit={signUpHandleSubmit(onSubmitSignUp)}>
                  <Input 
                    name="firstName"
                    register={signUpRegister}
                    error={signUpErrors.firstName}
                    validation={{required: "First Name is required"}}
                    type="text" placeholder="First Name" 
                  />
                  <Input 
                    name="lastName"
                    register={signUpRegister}
                    error={signUpErrors.lastName}
                    validation={{required: "Last Name is required"}}
                    type="text" placeholder="Last Name" 
                  />
                  <Input 
                    name="email"
                    register={signUpRegister}
                    error={signUpErrors.email}
                    validation={{
                      required: "Email is required",
                      pattern: {
                        value: /\S+@\S+\.\S+/,
                        message: "Entered value does not match email format"
                      }
                    }}
                    type="email" placeholder="Email" 
                  />
                  <Input 
                    name="adhaarNumber"
                    register={signUpRegister}
                    error={signUpErrors.adhaarNumber}
                    validation={{
                      required: "Adhaar Number is required",
                      pattern: {
                        value: /^[2-9]{1}[0-9]{3}[0-9]{4}[0-9]{4}$/,
                        message: "Entered value does not match Adhaar format"
                      }
                    }}
                    type="number" placeholder={"Enter Adhaar Number"} 
                  />
                      <Input 
                        type="file" 
                        name="aadhaar_image"  // Changed from "adhaarCard" to "aadhaar_image"
                        placeholder="Upload Adhaar Card" 
                        onChange={handleAdhaar}
                      />
                    <Input 
                    name="password"
                    register={signUpRegister}
                    error={signUpErrors.password}
                    validation={{required: "Password is required"}}
                    type="password" placeholder="Password" 
                  />
                  <Input 
                    name="confirmPassword"
                    register={signUpRegister}
                    error={signUpErrors.confirmPassword}
                    validation={{
                      required: "Confirm Password is required",
                      validate: (value) => value === watch('password') || "Password does not match"
                    }}
                    type="password" placeholder="Confirm Password" 
                  />
                    <Button type="submit">Sign Up</Button>
                  <p>Already have an account? <a onClick={() => setPageState('login')}>Login</a></p>
                </form>
              </div>
            ) : (
              <div>
                <h3>Member Login</h3>
                <p>Start managing your own Library</p>
                {/* Fixed login form to use handleSubmit with onSubmitLogin */}
                <form onSubmit={handleSubmit(onSubmitLogin)}>
                  <Input 
                    name="email"
                    register={register}
                    error={errors.email}
                    validation={{
                      required: "Email is required",
                      pattern: {
                        value: /\S+@\S+\.\S+/,
                        message: "Entered value does not match email format"
                      }
                    }}
                    type="email" 
                    placeholder="Email" 
                  />
                  <Input 
                    name="password"
                    register={register}
                    error={errors.password}
                    validation={{required: "Password is required"}}
                    type="password" 
                    placeholder="Password" 
                  />
                    <Button type="submit">Login</Button>
                  <p>Don't have an account? <a onClick={() => setPageState('signup')}>Create your Account</a></p>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
      <ToastContainer /> {/* Added ToastContainer for notifications */}
    </div>
  )
}

export default MemberLoginSignUp