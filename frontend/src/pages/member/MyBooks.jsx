import {useState} from 'react'
import PageHeader from "../../components/PageHeader"
import { MyBooksTab } from "../../constants/tabs"
import Tabs from "../../components/Tabs"

const MyBooks = ()=>{

    const [tabState, setTabState] = useState(1);


    return <>
    <PageHeader title="My Books" />

    {/* Add your MyBooks component here */}

    <Tabs  data={MyBooksTab} tabState={tabState} setTabState={setTabState} />
    
    </>
}


export default MyBooks