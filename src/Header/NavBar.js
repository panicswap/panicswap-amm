import { NavLink } from "react-router-dom";
import { MenuItems } from "./MenuItems";

const NavBar = () => {
  return (
    <nav className="flex flex-none gap-1 max-w-md mx-auto mt-2 md:mt-0">
      {MenuItems.map((item, index) => (
        <NavLink
          key={index}
          className="text-sm p-1 px-1 font-display text-center md:px-2 text-black font-bold dark:text-gray-300 transition-colors  hover:no-underline"
          to={item.url}
        >
          {item.title}
        </NavLink>
      ))}
    </nav>
  );
};

export default NavBar;
