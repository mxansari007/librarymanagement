
import Sidebar from "../components/Sidebar";
import { BrowserRouter } from "react-router-dom";

export default {
    title: 'Sidebar',
    component: Sidebar
}

const Template = (args) => <BrowserRouter><Sidebar {...args} /></BrowserRouter>

export const Primary = Template.bind({});

Primary.args = {
    label: "Primary Sidebar"
}

