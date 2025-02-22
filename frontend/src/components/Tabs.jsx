import {useState} from 'react'
import styles from '../styles/Tabs.module.css'





const Tabs = ({data=[], tabState, setTabState})=>{

    const [tabData, setTabData] = useState(data);

    return(
        <div className={styles.tabs_container}>
            <ul className={styles.tabs}>
                {tabData.map((tab) => (
                    <li 
                    onClick={() => setTabState(tab.id)}
                    className={`${styles.tab} ${tabState === tab.id ? styles.active : ''}`} key={tab.id}>
                        {tab.name}
                    </li>
                ))}
            </ul>
        </div>
    )
}


export default Tabs