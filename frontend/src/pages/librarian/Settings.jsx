import { useState } from "react";
import styles from "../../styles/Settings.module.css";
import Tabs from "../../components/Tabs";
import ownerSettingData from "../../constants/tabs";
import Input from "../../components/Input";
import Button from "../../components/Button";
import PageHeader from "../../components/PageHeader";

const LibrarianSettings = () => {
  const [tabState, setTabState] = useState(1);
  const [user, setUser] = useState(null);

  // Load user data from localStorage when component mounts
  useState(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  return (
    <>
      <PageHeader title="Settings" />

      <div className={styles.avatar_area}>
        <div className={styles.avatar}></div>
        <div className={styles.avatar_details}>
          <h3>{user ? `${user.first_name} ${user.last_name}` : "Librarian"}</h3>
          <p>Librarian</p>
        </div>
        <div className={styles.edit}>
          <p>Edit</p>
        </div>
      </div>

      <Tabs
        data={ownerSettingData}
        tabState={tabState}
        setTabState={setTabState}
      />

      {tabState === 1 ? (
        <>
          <div className={styles.input_area}>
            <Input
              type="text"
              placeholder="First Name"
              defaultValue={user?.first_name || ""}
            />
            <Input
              type="text"
              placeholder="Last Name"
              defaultValue={user?.last_name || ""}
            />
            <Input
              type="email"
              placeholder="Email"
              defaultValue={user?.email || ""}
            />
            <Input
              type="text"
              placeholder="Contact Number"
              defaultValue={user?.contact_number || ""}
            />
            <Button>Save</Button>
          </div>
        </>
      ) : (
        <>
          <div className={styles.input_area}>
            <Input type="password" placeholder="Current Password" />
            <Input type="password" placeholder="New Password" />
            <Input type="password" placeholder="Confirm Password" />
            <Button>Save</Button>
          </div>
        </>
      )}
    </>
  );
};

export default LibrarianSettings;
