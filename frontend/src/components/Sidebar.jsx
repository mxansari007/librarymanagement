import React from "react";
import { useState, useEffect } from "react";
import styles from "../styles/Sidebar.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import { faRightFromBracket } from "@fortawesome/free-solid-svg-icons";

const Sidebar = ({ Options = [], User = { firstName: "Guest", lastName: "", role: "Owner" }, logout }) => {
  const [active, setActive] = useState("Dashboard");
  const navigate = useNavigate();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  useEffect(() => {
    setActive(localStorage.getItem("route"));
  }, []);

  const handleOptionClick = (option) => {
    setActive(option.name);
    navigate(option.link);
    localStorage.setItem("route", option.name);
    setIsMobileOpen(false); // Close mobile sidebar when clicking a menu option
  };

  return (
    <>
      {/* Floating Sidebar */}
      <div data-testid="sidebar" className={`${styles.container} ${isMobileOpen ? styles.open : ""}`}>
        <div className={styles.logo}>
          <h2>Library Management</h2>
        </div>

        <div className={styles.user}>
          <div className={styles.avatar}><p>{User?.firstName[0].toUpperCase()}</p></div>
          <div className={styles.user_details}>
            <h3>{User?.firstName} {User?.lastName}</h3>
            <p>{User?.role}</p>
          </div>
        </div>

        <div className={styles.options}>
          <ul>
            {Options.map((option, index) => (
              <li
                key={index}
                onClick={() => handleOptionClick(option)}
                className={`${styles.option} ${active === option.name ? styles.active_option : ""}`}
              >
                <FontAwesomeIcon icon={option.icon} className={active === option.name ? styles.active_icon : ""} />
                {option.name}
              </li>
            ))}
            <li onClick={logout} className={styles.option}>
              <FontAwesomeIcon icon={faRightFromBracket} />
              Logout
            </li>
          </ul>
        </div>
      </div>

      {/* Hamburger Button for Mobile */}
      <div role="button" onClick={() => setIsMobileOpen(!isMobileOpen)} className={styles.hamburger}>
        <div></div>
        <div></div>
        <div></div>
      </div>
    </>
  );
};

export default Sidebar;
