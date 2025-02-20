
import Sidebar from "../components/Sidebar";

export default {
    title: 'Sidebar',
    component: Sidebar
}

const Template = (args) => <Sidebar {...args} />;

export const Primary = Template.bind({});

Primary.args = {
    label: "Primary Sidebar"
}

