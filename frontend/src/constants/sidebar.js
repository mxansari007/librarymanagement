import { faHouse, faBook, faUsers, faCog,faBookmark } from '@fortawesome/free-solid-svg-icons';



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


const librarianOptions = [
    {
        id: 1,
        name: "Dashboard",
        link: "/librarian/dashboard",
        icon: faHouse, // Imported icon object
    },
    {
        id: 2,
        name: "Manage Transactions",
        link: "/librarian/dashboard/library",
        icon: faBookmark,
    },
    {
        id: 5,
        name:"Manage Members",
        link:"/librarian/dashboard/admin",
        icon:faUsers
    },
        {
            id: 6,
            name:"Manage Books",
            link:"/librarian/dashboard/library",
            icon:faBook

        },
    {
        id: 7,
        name:"Settings",
        link:"/librarian/dashboard/settings",
        icon:faCog
    }


]


const memberOptions = [
    {
        id: 1,
        name: "Dashboard",
        link: "/member/dashboard",
        icon: faHouse, // Imported icon object
    },
    {
        id: 2,
        name:"Request Book",
        link:"/member/dashboard/library",
        icon:faBookmark
    },
    {
        id: 3,
        name:"My Books",
        link:"/member/dashboard/library",
        icon:faBook
    },
    {
        id: 4,
        name:"Return Book",
        link:"/member/dashboard/library",
        icon:faBookmark
    },
    {
        id: 5,
        name:"Settings",
        link:"/member/dashboard/settings",
        icon:faCog
    }

]


export {librarianOptions,memberOptions} 



export default ownerOptions;
