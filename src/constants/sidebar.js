import getIcon from "../utils/getIcons";

const ownerOptions = [
    {
        id: 1,
        name: "Dashboard",
        link: "/owner/dashboard",
        icon: getIcon("FaHome", "fa"), // Font Awesome Home icon
    },
    {
        id: 2,
        name: "Books",
        link: "/owner/books",
        icon: getIcon("FaBook", "fa"), // Font Awesome Book icon
    },
    {
        id: 3,
        name: "Members",
        link: "/owner/members",
        icon: getIcon("MdPeople", "md"), // Material Design People icon
    },
    {
        id: 4,
        name: "Transactions",
        link: "/owner/transactions",
        icon: getIcon("HiCash", "hi"), // Heroicons Cash icon
    },
    {
        id: 5,
        name: "Settings",
        link: "/owner/settings",
        icon: getIcon("IoSettings", "io"), // Ionicons Settings icon
    },
];

export default ownerOptions;
