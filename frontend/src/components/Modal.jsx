import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import styles from '../styles/Modal.module.css'
import { faXmark } from '@fortawesome/free-solid-svg-icons'

const Modal = ({ label, children, modalState, setModalState }) => {
    return (
        <div className={`${styles.modal} ${modalState ? styles.modal_open : styles.modal_close}`}>
            <div className={styles.modal_content}>
                <div className={styles.modal_header}>
                    <h1>{label}</h1>
                    <FontAwesomeIcon icon={faXmark} onClick={() => setModalState(false)} />
                </div>
                <div className={styles.modal_body}>
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Modal;



