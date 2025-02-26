import React, { useState, useEffect } from "react";
import styles from "../../styles/Pending.module.css";
import Button from "../../components/Button";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faExclamationTriangle } from "@fortawesome/free-solid-svg-icons";

const Pending = () => {
  const navigate = useNavigate();
  const [userEmail, setUserEmail] = useState("");
  const [isRejected, setIsRejected] = useState(false); // Track rejection status
  const [rejectionReason, setRejectionReason] = useState(""); // Store rejection reason

  useEffect(() => {
    const storedEmail = localStorage.getItem("pending_member");
    if (storedEmail) {
      setUserEmail(storedEmail);
    } else {
      toast.error("No user email found. Please log in again.");
      setTimeout(() => navigate("/member"), 2000);
    }
  }, [navigate]);





  const handleRefresh = async () => {
    if (!userEmail) {
      toast.error("User email is missing. Please log in again.");
      return;
    }

    try {
      const res = await axios.get(
        `${import.meta.env.VITE_BASE_URL}/open/verify/${userEmail}`,
        { withCredentials: true }
      );

      if (res.status === 200 && res.data.verified) {
        toast.success(
          "Your Aadhaar card has been successfully verified. Redirecting to member page..."
        );
        localStorage.removeItem("pending_member");
        setTimeout(() => navigate("/member"), 2000);
      }
    } catch (error) {
      const errorData = error.response?.data;

      if (error.response?.status === 403) {
        // User rejected: Show reason on page
        setIsRejected(true);
        setRejectionReason(errorData.reason || "No reason provided");
        toast.error("Your verification was rejected. See details below.");
      } else if (error.response?.status === 401) {
        // Still pending
        setIsRejected(false); // Reset rejection state
        setRejectionReason(""); // Clear reason
        toast.info("Your account is still under verification. Please check back later.");
      } else if (error.response?.status === 404) {
        // User not found
        setIsRejected(false);
        setRejectionReason("");
        toast.error("User not found. Please register again.");
        setTimeout(() => navigate("/member"), 2000);
      } else {
        // Generic error
        setIsRejected(false);
        setRejectionReason("");
        toast.error(
          errorData?.error || "An error occurred. Please try again later."
        );
      }
    }
  };

    useEffect(() => {
    if (userEmail) {
      handleRefresh();
    }
  }, [userEmail]);


  return (
    <div className={styles.body}>
      <div className={styles.container}>
        <h1 className={styles.title}>Aadhaar Verification</h1>
        <p className={styles.message}>
          {userEmail
            ?!isRejected ?`Your Aadhaar card for ${userEmail} is under verification.`: `Your Aadhaar card for ${userEmail} was rejected.`
            : "Loading user information..."}
        </p>
        {!isRejected && <div className={styles.loader}></div>}
        {!isRejected && (
          <p className={styles.subtext}>
            This may take up to 24 hours. Thank you for your patience!
          </p>
        )}
        {isRejected && (
          <div className={styles.rejection_notice}>
            <FontAwesomeIcon 
              icon={faExclamationTriangle} 
              style={{ color: "#f1c40f", marginRight: "8px" }} // Yellow warning icon
            />
            <span>
              Your verification was rejected. Reason: <strong>{rejectionReason}</strong>. 
              Please reapply with corrected details.
            </span>
          </div>
        )}
        <div className={styles.divider}></div>
        <div className={styles.button_container}>
          <Button variant="primary" onClick={handleRefresh}>
            Refresh Status
          </Button>
          <Button variant="secondary" onClick={() => navigate("/member")}>
            Go Back
          </Button>
        </div>
        <ToastContainer 
          position="top-center"
          autoClose={3000}
          hideProgressBar={false}
          newestOnTop
          closeOnClick
          rtl={false}
          pauseOnFocusLoss
          draggable
          pauseOnHover
        />
      </div>
    </div>
  );
};

export default Pending;