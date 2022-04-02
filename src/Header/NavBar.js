import { NavLink } from "react-router-dom";
import { MenuItems } from "./MenuItems";
import DarkmodeToggle from "./DarkmodeToggle";

const NavBar = ({ menuOpen, setMenuOpen }) => {
  return (
    <nav
      className={`fixed md:static top-0 left-0 right-0 bottom-0 flex-col md:flex-row gap-1 md:max-w-md mx-auto md:mt-0 dark:bg-slate-900 pt-[10vh] md:pt-0 ${
        (menuOpen && "flex") || "hidden"
      } md:flex`}
    >
      {MenuItems.map((item, index) => (
        <NavLink
          key={index}
          onClick={() => setMenuOpen(false)}
          className="text-sm p-5 px-1 font-display text-center md:px-2 text-gray-500 hover:text-blue-500 font-bold dark:text-gray-300 transition-colors dark:hover:text-blue-300  hover:no-underline"
          to={item.url}
        >
          {item.title}
        </NavLink>
      ))}

      <div className="md:hidden md:mt-0 mt-5 self-center">
        <DarkmodeToggle />
      </div>
    </nav>
  );
};

export default NavBar;
