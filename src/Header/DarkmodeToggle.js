import { useEffect, useState } from "react";
import { MdOutlineDarkMode, MdOutlineWbSunny } from "react-icons/md";

const DarkmodeToggle = () => {
  const [darkMode, setDarkMode] = useState(null);

  useEffect(() => {
    if (document.documentElement.classList.contains("dark")) {
      setDarkMode(true);
    } else {
      setDarkMode(false);
    }
  });

  const handleModeChange = () => {
    if (localStorage.theme === "light") {
      localStorage.theme = "dark";
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    } else {
      localStorage.theme = "light";
      document.documentElement.classList.remove("dark");
      setDarkMode(false);
    }
    // localStorage.removeItem("theme");
  };

  return (
    <div
      onClick={handleModeChange}
      className="text-gray-500 bg-lightGray hover:text-blue-500 dark:bg-gray-700 dark:hover:text-amber-300 transition-colors p-2 rounded-full  text-2xl cursor-pointer dark:text-gray-400"
    >
      {darkMode ? <MdOutlineWbSunny /> : <MdOutlineDarkMode />}
    </div>
  );
};

export default DarkmodeToggle;
