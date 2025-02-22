import Pagination from "../components/Pagination.jsx";



export default {
    title: 'Pagination',
    component: Pagination
}



const Template = (args) => <Pagination {...args} />

export const Primary = Template.bind({});

Primary.args = {
    label: "Primary Pagination"
}