import {useState} from 'react'
import styles from '../../styles/Settings.module.css'
import Tabs from '../../components/Tabs';
import ownerSettingData from '../../constants/tabs';
import Input from '../../components/Input';
import Button from '../../components/Button';
const OwnerSettings = () => {

    const [tabState, setTabState] = useState(1);


    return (
       <>
        <div className={styles.header}>
           <h1>Settings</h1>
        </div>

        <div className={styles.avatar_area}>
            <div className={styles.avatar}></div>
            <div className={styles.avatar_details}>
                <h3>John Doe</h3>
                <p>Owner</p>
            </div>
            <div className={styles.edit}>
                <p>Edit</p>
            </div>
        </div>

        <Tabs data={ownerSettingData} tabState={tabState} setTabState={setTabState}/>

        {
            tabState===1?
            <>
            <div className={styles.input_area}>
                <Input type="text" placeholder="First Name" />
                <Input type="text" placeholder="Last Name" />
                <Input type="email" placeholder="Email" />
                <Button>Save</Button>
            </div>
            </>
            :
            <>
            <div className={styles.input_area}>
                <Input type="password" placeholder="Current Password" />
                <Input type="password" placeholder="New Password" />
                <Input type="password" placeholder="Confirm Password" />
                <Button>Save</Button>
            </div>
            </>
        }

       </>
    )
}

export default OwnerSettings;