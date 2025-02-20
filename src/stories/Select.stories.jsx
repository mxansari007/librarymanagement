import Select from '../components/Select';

export default {
    title: 'Select',
    component: Select
}

const Template = (args) => <Select {...args} />;

export const Primary = Template.bind({});

Primary.args = {
    label: "Primary Select"
}

