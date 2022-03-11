import { NavLink } from "react-router-dom";
import { MenuItems } from "./MenuItems";

const NavBar = () => {
  return (
    <nav className="grid grid-cols-6 gap-1 max-w-md mx-auto mt-2 md:mt-0">
      {MenuItems.map((item, index) => (
        <NavLink
          key={index}
          className="text-sm p-2 px-2 rounded-xl text-center md:px-3 text-white bg-blue-400 hover:bg-blue-500 transition-colors  hover:no-underline hover:text-white"
          to={item.url}
        >
          {item.title}
        </NavLink>
      ))}
    </nav>
  );
};

export default NavBar;
