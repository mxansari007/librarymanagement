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
        name: "Manage Librarian",
        link: "/owner/dashboard/librarian",
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
        link: "/librarian/dashboard/transactions",
        icon: faBookmark,
    },
    {
        id: 5,
        name:"Manage Members",
        link:"/librarian/dashboard/members",
        icon:faUsers
    },
        {
            id: 6,
            name:"Manage Books",
            link:"/librarian/dashboard/books",
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
        link:"/member/dashboard/request-book",
        icon:faBookmark
    },
    {
        id: 3,
        name:"My Books",
        link:"/member/dashboard/mybooks",
        icon:faBook
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
