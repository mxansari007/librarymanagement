import React from "react"; // Ensure React is imported
import * as FaIcons from "react-icons/fa";
import * as MdIcons from "react-icons/md";
import * as IoIcons from "react-icons/io";
import * as HiIcons from "react-icons/hi";

const iconLibraries = {
  fa: FaIcons,
  md: MdIcons,
  io: IoIcons,
  hi: HiIcons,
};

const getIcon = (iconName, library = "fa") => {

    const IconLibrary = iconLibraries[library];
    if (!IconLibrary) {
        console.error(`Icon library "${library}" not found.`);
        return null;
    }

    const IconComponent = IconLibrary[iconName];
    if (!IconComponent) {
        console.error(`Icon "${iconName}" not found in library "${library}".`);
        return null;
    }

    // Return the React component reference, not JSX
    return IconComponent;
};

export default getIcon;