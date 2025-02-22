import { ArgTypes } from '@storybook/blocks';
import Modal from '../components/Modal.jsx';


export default {
    title: 'Modal',
    component: Modal
}


const Template = () => <Modal label="Primary Modal" modalState={true}>
    <p>hello</p>
</Modal>

export const Default = Template.bind({});

Default.args = {
    label: "Primary Modal",
    modalState:true
}