import React, { useState, useEffect } from "react";
import styles from "../../styles/Pending.module.css";
import Button from "../../components/Button";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css"; // Ensure styles load

const Pending = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    const storedEmail = localStorage.getItem("pending_member");
    if (storedEmail) {
      setUserEmail(storedEmail);
    }
  }, []);

  const warn = (message) => toast.error(message); // Fix undefined msg

  const handleRefresh = async () => {
    if (!userEmail) {
      warn("User email is missing. Please try again.");
      return;
    }

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/open/verify/${userEmail}`,
        { withCredentials: true }
      );

      if (res.status === 200) {
        toast.success(
          "Your Aadhaar card has been successfully verified. You can now log in."
        );
        setTimeout(() => navigate("/member"), 2000); // Delay navigation
      } else {
        warn("Failed to verify your Aadhaar card. Please try again later.");
      }
    } catch (error) {
      warn(
        error.response?.data?.error ||
          "User verification is still in progress. Please try again later."
      );
    }
  };

  return (
    <div className={styles.body}>
      <div className={styles.container}>
        <h1 className={styles.title}>Aadhaar Verification</h1>
        <p className={styles.message}>
          Your Aadhaar card is under verification. Please wait while we process
          your request.
        </p>
        <div className={styles.loader}></div>
        <p className={styles.subtext}>
          This may take up to 24 hours. Thank you for your patience!
        </p>
        <div className={styles.divider}></div>
        <div className={styles.button_container}>
          <Button variant="primary" onClick={handleRefresh}>
            Refresh
          </Button>
          <Button variant="secondary" onClick={() => navigate("/member")}>
            Go Back
          </Button>
          <ToastContainer />
        </div>
      </div>
    </div>
  );
};

export default Pending;
