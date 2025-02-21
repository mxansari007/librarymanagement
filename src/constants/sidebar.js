import { faHouse, faBook, faUsers, faMoneyBill, faCog } from '@fortawesome/free-solid-svg-icons';



const ownerOptions = [
    {
        id: 1,
        name: "Dashboard",
        link: "/owner/dashboard",
        icon: faHouse, // Imported icon object
    },
    {
        id: 2,
        name: "Manage Library",
        link: "/owner/dashboard/library",
        icon: faBook,
    },
    {
        id: 3,
        name: "Manage Admins",
        link: "/owner/dashboard/admin",
        icon: faUsers,
    },
    {
        id: 5,
        name: "Settings",
        link: "/owner/dashboard/settings",
        icon: faCog,
    },
];
export default ownerOptions;
