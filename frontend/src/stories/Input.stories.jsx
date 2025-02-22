
import Input from '../components/Input';

export default {
    title: "Simple/Input",
    component: Input,
    };

const Primary = (args) => <Input {...args} />;

export const PrimaryInput = Primary.bind({});


PrimaryInput.args = {

    placeholder: "Primary Input",
    disabled: false,
};

