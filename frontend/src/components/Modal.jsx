import React from "react";
import { useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "../styles/Modal.module.css";
import { faXmark } from "@fortawesome/free-solid-svg-icons";

const Modal = ({ label, children, modalState, setModalState }) => {
  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setModalState(false);
      }
    };

    if (modalState) {
      document.body.style.overflow = "hidden"; // Prevent background scroll
      window.addEventListener("keydown", handleKeyDown);
    }

    return () => {
      document.body.style.overflow = "auto"; // Restore scroll on cleanup
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [modalState, setModalState]);

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setModalState(false); // Close modal on overlay click
    }
  };

  return (
    <div
      data-testid="modal-overlay"  // Add this for testing
      className={`${styles.modal} ${modalState ? styles.modal_open : styles.modal_closed}`}
      onClick={handleOverlayClick}
    >
      <div className={styles.modal_content}>
        <div className={styles.modal_header}>
          <h1>{label}</h1>
          <button
            className={styles.close_button}
            onClick={() => setModalState(false)}
            aria-label="Close modal"
          >
            <FontAwesomeIcon icon={faXmark} />
          </button>
        </div>
        <div className={styles.modal_body}>{children}</div>
      </div>
    </div>
);
};

export default Modal;