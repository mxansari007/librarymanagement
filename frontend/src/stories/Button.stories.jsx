

import Button from '../components/Button.jsx';


export default {
  title: "Simple/Button",
  component: Button,
};


const Primary = (args) => <Button {...args} >Primary</Button>;

const Primaryloading = (args) => <Button variant={'primary-loading'} {...args} >Primary</Button>;

const Secondary = (args) => <Button variant={'secondary'} {...args} >Secondary</Button>;

export const PrimaryButton = Primary.bind({});
export const PrimaryButtonLoading = Primaryloading.bind({});
export const SecondaryButton = Secondary.bind({});

PrimaryButton.args = {
  label: "Primary Button",
  disabled: false,
};

PrimaryButtonLoading.args = {
  label: "Primary Button",
  loading: true,
};

SecondaryButton.args = {
  label: "Secondary Button",
  disabled: false,

};

