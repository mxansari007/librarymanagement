import { useEffect, useState } from "react";
import Select from "../../components/Select";
import styles from "../../styles/OwnerDashHome.module.css";
import apiRequest from "../../utils/api";
import { toast, ToastContainer } from "react-toastify";
import {faHandHoldingHand, faClock,faBook,faUser} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

const Home = () => {
    const [dashboardValues, setDashboardValues] = useState(null);
    const [libraries, setLibraries] = useState([]);
    const [libraryOptions, setLibraryOptions] = useState([]);
    const [selectedLibrary, setSelectedLibrary] = useState(""); // Initially empty

    const fetchDashboardData = async (libraryId) => {
        if (!libraryId) return; // Avoid fetching if no library is selected

        try {
            const response = await apiRequest("GET", `/owner/get-dashboard/${libraryId}`, {}, { token: localStorage.getItem("owner_token") });

            if (response.success) {
                setDashboardValues(response.data);
            } else {
                toast.error("Failed to fetch dashboard data: " + response.error);
            }
        } catch (err) {
            toast.error("Error fetching dashboard data");
        }
    };

    const fetchLibraries = async () => {
        try {
            const res = await apiRequest("GET", "/owner/libraries", {}, { token: localStorage.getItem("owner_token") });

            if (res.success) {
                const fetchedLibraries = res.data.libraries;
                setLibraries(fetchedLibraries);

                if (fetchedLibraries.length > 0) {
                    // Set library options
                    const options = fetchedLibraries.map((lib) => ({
                        label: `${lib.name} (ID: ${lib.id})`,
                        value: lib.id
                    }));
                    setLibraryOptions(options);

                    // Set first library as default
                    setSelectedLibrary(fetchedLibraries[0].id);
                }
            } else {
                toast.error("Failed to fetch libraries: " + res.error);
            }
        } catch (error) {
            toast.error("Failed to fetch libraries: " + error.message);
        }
    };

    // Fetch libraries on mount
    useEffect(() => {
        fetchLibraries();
    }, []);

    // Fetch dashboard data when selectedLibrary changes
    useEffect(() => {
        if (selectedLibrary) {
            fetchDashboardData(selectedLibrary);
        }
    }, [selectedLibrary]);

    return (
        <>
            <div className={styles.header}>
                <h1>Dashboard</h1>
                <div className={styles.library_select}>
                    {libraryOptions.length > 0 ? (
                        <Select
                            display="Select Library"
                            options={libraryOptions}
                            value={selectedLibrary}
                            onChange={(e) => setSelectedLibrary(e.target.value)}
                        />
                    ) : (
                        <div className={"loader " + styles.loading}></div>
                    )}
                </div>
            </div>

            <div className={styles.status_area}>
            <div className={styles.status}>
                <div className={styles.status_icon}>
                    <FontAwesomeIcon icon={faUser} />
                </div>
                <div>
                <h4>Members</h4>
                <p>{dashboardValues?dashboardValues.total_members:null}</p>
                </div>
            </div>
            <div className={styles.status}>
            <div className={styles.status_icon}>
                <FontAwesomeIcon icon={faBook} />   
            </div>
                <div>
                <h4>Books</h4>
                <p>{dashboardValues?.total_books}</p>
                </div>
            </div>
            <div className={styles.status}>
            <div className={styles.status_icon}>
                <FontAwesomeIcon icon={faHandHoldingHand} />
            </div>
                <div>
                <h4>Borowers</h4>
                <p>{dashboardValues?.total_issued_books}</p>
                </div>
            </div>
            <div className={styles.status}>
            <div className={styles.status_icon}>
                <FontAwesomeIcon icon={faClock} />
            </div>
                <div>
                <h4>Overdue</h4>
                <p>{dashboardValues?.total_overdue_books}</p>
                </div>
            </div>
            <div className={styles.status}>
            <div className={styles.status_icon}>
                <FontAwesomeIcon icon={faUser} />
            </div>
                <div>
                <h4>Librarians</h4>
                <p>{dashboardValues?.total_librarians}</p>
                </div>
            </div>
        </div>



            <ToastContainer />
        </>
    );
};

export default Home;
