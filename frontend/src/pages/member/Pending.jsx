import React from 'react';
import styles from '../../styles/Pending.module.css';
import Button from '../../components/Button';
import { useNavigate } from 'react-router-dom';

const Pending = () => {

    const navigate = useNavigate();



  return (
    <div className={styles.body}>
      <div className={styles.container}>
        <h1 className={styles.title}>Aadhaar Verification</h1>
        <p className={styles.message}>
          Your Aadhaar card is under verification. Please wait while we process your request.
        </p>
        <div className={styles.loader}></div>
        <p className={styles.subtext}>This may take upto 24 hours. Thank you for your patience!</p>
        <div className={styles.divider}></div>
        <div className={styles.button_container}>
        <Button variant="primary" onClick={() => {}}>
            Refresh
        </Button>
        <Button variant="secondary" onClick={() => {
            navigate('/member');
        }}>
            Go Back
        </Button>
        </div>
      </div>
    </div>
  );
};

export default Pending;