import Select from '../components/Select';

export default {
    title: 'Select',
    component: Select
}

const Template = (args) => <Select variant="big" {...args} />;


export const Primary = Template.bind({});

Primary.args = {
    label: "Primary Select",
    variant:"big"
}

