import React, { useState, useEffect } from "react";
import { Link,useNavigate } from "react-router-dom";
import styles from "../../styles/OwnerLoginSignUp.module.css";
import Button from "../../components/Button";
import Input from "../../components/Input";
import { useForm } from "react-hook-form";
import { DevTool } from "@hookform/devtools";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";

const OwnerLoginSignUp = () => {
  const [pageState, setPageState] = useState("login");
  const [planType, setPlanType] = useState("");
  const navigate = useNavigate()
  const {
    register,
    control,
    handleSubmit,
    watch,
    formState: { errors },
    setValue,
    trigger,
  } = useForm({
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      plan_type: "",
    },
    mode: "all",
  });

  const {
    register: loginRegister,
    control: loginControl,
    handleSubmit: loginHandleSubmit,
    formState: { errors: loginErrors },
  } = useForm({
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "all",
  });

  useEffect(() => {
    setValue("plan_type", planType);
  }, [planType, setValue]);

  const ErrorToast = (msg) => toast.error(msg);



  const onSubmitSignUp = async (data) => {
    console.log("Sign Up Data:", data);

    try {
      const res = await axios({
        method: "post",
        url: import.meta.env.VITE_BASE_URL + "/owner/signup",
        data: {
          firstName: data.firstName,
          lastName: data.lastName,
          email: data.email,
          password: data.password,
          plan_type: data.plan_type,
        },
        
      })

      if (res.status === 201) {
        console.log("Sign up success:", res.data);
        setPageState("login");
      }
    } catch (error) {
      console.error("Sign up error:", error);
    }
  };

  const onSubmitLogin = async (data) => {
    console.log("Login Data:", data);

    try {
      const res = await axios({
        method: "post",
        url: import.meta.env.VITE_BASE_URL + "/user/login",
        data: {
          email: data.email,
          password_hash: data.password,
        },
        withCredentials: true
      });

      if (res.status === 200) {

        if(res.data.user.role === 'owner'){

          localStorage.setItem("owner_token", res.data.token);
          //strigyfy user details
          localStorage.setItem("user", JSON.stringify(res.data.user));
          localStorage.setItem('route',"Dashboard")

          console.log("Login success:", res.data);
          navigate("/owner/dashboard")
        }else {
            ErrorToast("Only owners can login from here")
        }
      }
    }catch (error) {
        console.error("Login error:", error);
      }
  };

  // Function to validate before proceeding
  const validateAndProceed = async (nextState, dependencies) => {
    const isValid = await trigger(dependencies);
    if (isValid) {
      setPageState(nextState);
    }
  };




  return (
    <div className={styles.bg_style}>
      <div className={styles.bg_black_overlay_screen}></div>
      <div className={styles.container}>
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
            {pageState === "signup" || pageState === "buy" || pageState === "billing" ? (
              <div>
                <h3>Create An Owner Account</h3>
                <p>Start managing your own Library</p>
                <form className="form" onSubmit={handleSubmit(onSubmitSignUp)}>
                  {pageState === "signup" ? (
                    <>
                      <Input
                        name="firstName"
                        type="text"
                        placeholder="First Name"
                        register={register}
                        error={errors.firstName}
                        validation={{ required: "First Name is required" }}
                      />

                      <Input
                        name="lastName"
                        type="text"
                        placeholder="Last Name"
                        register={register}
                        error={errors.lastName}
                        validation={{ required: "Last Name is required" }}
                      />

                      <Input
                        name="email"
                        type="email"
                        placeholder="Email"
                        register={register}
                        error={errors.email}
                        validation={{
                          required: "Email is required",
                          pattern: {
                            value:
                              /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                            message: "Invalid email address",
                          },
                        }}
                      />

                      <Input
                        name="password"
                        type="password"
                        placeholder="Password"
                        register={register}
                        error={errors.password}
                        validation={{
                          required: "Password is required",
                          minLength: {
                            value: 8,
                            message:
                              "Password must be at least 8 characters long",
                          },
                        }}
                      />

                      <Input
                        name="confirmPassword"
                        type="password"
                        placeholder="Confirm Password"
                        register={register}
                        error={errors.confirmPassword}
                        validation={{
                          required: "Confirm Password is required",
                          validate: (value) =>
                            value === watch("password") ||
                            "Passwords do not match",
                        }}
                      />

                      <Button
                        type="button"
                        onClick={() =>
                          validateAndProceed("buy", [
                            "email",
                            "password",
                            "confirmPassword",
                            "firstName",
                            "lastName",
                          ])
                        }
                      >
                        Buy Account
                      </Button>
                    </>
                  ) : pageState === "buy" ? (
                    <>
                      {/* Plan selection */}
                      <div className={styles.select_plan}>
                        <div
                          onClick={() => setPlanType("silver")}
                          className={`card ${styles.card} ${
                            planType === "silver" ? styles.card_selected : ""
                          }`}
                        >
                          <h4>Silver Plan</h4>
                          <p>Create One Library</p>
                          <p>Rs. 1000 / year</p>
                        </div>
                        <div
                          onClick={() => setPlanType("gold")}
                          className={`card ${styles.card} ${
                            planType === "gold" ? styles.card_selected : ""
                          }`}
                        >
                          <h4>Gold Plan</h4>
                          <p>Create Unlimited Libraries</p>
                          <p>Rs. 2000 / year</p>
                        </div>
                      </div>

                      <input
                        type="hidden"
                        {...register("plan_type", {
                          required: "*Please select a plan",
                        })}
                      />
                      <p className="error">{planType===""?errors.plan_type?.message:''}</p>

                      <Button
                        onClick={() => validateAndProceed("billing", ["plan_type"])}
                      >
                        Proceed to Billing
                      </Button>
                    </>
                  ) : pageState === "billing" ? (
                    <>
                      <h3>Billing Section</h3>
                      <p>Payment details go here.</p>
                      <Input
                        name="cardNumber"
                        type="text"
                        placeholder="Card Number (16 digits)"
                        register={register}
                        error={errors.cardNumber}
                        validation={{ required: "Card Number is required",
                          minLength: {
                            value: 16,
                            message: "Invalid card number",
                          },
                         }}
                      />

                      <Input
                        name="cvv"
                        type="text"
                        placeholder="CVV (3 digits)"
                        register={register}
                        error={errors.cvv}
                        validation={{ required: "CVV is required",
                          pattern: {
                            value:
                              /^[0-9]{3}$/,
                            message: "Invalid CVV",
                          },
                         }}
                      />

                      <Input
                        name="expiryDate"
                        type="text"
                        placeholder="Expiry Date (MM/YY)"
                        register={register}
                        error={errors.expiryDate}
                        validation={{ required: "Expiry Date is required",
                          pattern: {
                            value:
                              /^[0-9]{2}\/[0-9]{2}$/,
                            message: "Invalid expiry date",
                          },
                         }}
                      />

                      <Input
                        name="nameOnCard"
                        type="text"
                        placeholder="Name on Card"
                        register={register}
                        error={errors.nameOnCard}
                        validation={{ required: "Name on Card is required" }}
                      />

                      <Button type="submit" >Pay Now</Button>
                    </>
                  ) : null}

                  <p>
                    Already have an account?{" "}
                    <a onClick={() => setPageState("login")}>Login</a>
                  </p>
                </form>
              </div>
            ) : pageState === "login" ? (
              <div>
                <h3>Owner Login</h3>
                <p>Start managing your own Library</p>
                <form className="form" onSubmit={loginHandleSubmit(onSubmitLogin)}>
                  <Input
                    name="email"
                    type="email"
                    placeholder="Email"
                    register={loginRegister}
                    error={loginErrors.email}
                    validation={{ required: "Please enter your email" }}
                  />

                  <Input
                    name="password"
                    type="password"
                    placeholder="Password"
                    register={loginRegister}
                    error={loginErrors.password}
                    validation={{ required: "Please enter your password" }}
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
            ) : null}
          </div>
        </div>
      </div>
      <DevTool control={control} />
      <ToastContainer />
    </div>
  );
};

export default OwnerLoginSignUp;
