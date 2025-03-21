import React,{useState} from 'react'
import { Link } from 'react-router-dom'
import libraryImage from '../../assets/library-bg.png'
import styles from '../../styles/OwnerLoginSignUp.module.css'
import Button from '../../components/Button'
import Input from '../../components/Input'
import { useForm } from 'react-hook-form'
import { DevTool } from '@hookform/devtools'
import axios from 'axios'
import { toast, ToastContainer } from'react-toastify';
import { useNavigate } from'react-router-dom'
import apiRequest from '../../utils/api.js'


const LibrarianLoginSignUp = () => {


  const {register, handleSubmit, formState:{errors}} = useForm(
    {
      mode: "all",
      defaultValues: {
        email: "",
        password: "",
      },
    }
  )

  const navigate = useNavigate()


  const handleLogin = async (data) => {

    try{
      const res = await apiRequest("POST","/user/login",{
        email: data.email,
        password: data.password,
      },{})

      if(res.success){
        
        if(res.data.user.role!='librarian'){
          toast.error("Only librarians can login from here")
          return;
        }


        localStorage.setItem("user", JSON.stringify(res.data.user));
        localStorage.setItem("librarian_token", res.data.token);
        localStorage.setItem("route","Dashboard")
        navigate("/librarian/dashboard")
      }else{
        toast.error(res.error)
      }

    }catch(error){
      console.error("Login error:", error);
    }
  }



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
             <div>
              <h3>Librarian Login</h3>
              <p>Start managing your own Library</p>
              <form className='form' onSubmit={handleSubmit(handleLogin)}>
              <Input 
              register={register}
              name="email"
              error={errors.email}
              validation={{ required: "Please enter your email" }}
              type="email" placeholder="Email" />
              <Input 
              register={register}
              name="password"
              error={errors.password}
              validation={{ required: "Please Enter your password" }}
              type="password" placeholder="Password" />
              <Button type="submit">Login</Button>
              </form>
              </div>
           </div>
        </div>
      </div>
      <ToastContainer />
    </div>
  )
}

export default LibrarianLoginSignUp 