import Table from "../components/Table";

export default {
    title: 'Table',
    component: Table
}

const Template = (args) => <Table {...args} />;
export const Primary = Template.bind({});

Primary.args = {
    label: "Primary Table"
}
