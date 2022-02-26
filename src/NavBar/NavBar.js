import React, { Component } from "react";
import { NavLink } from "react-router-dom";
import { MenuItems } from "./MenuItems";

const NavBar = () => {
  return (
    <nav className="mt-4 mb-4 grid grid-cols-4 gap-2 max-w-md mx-auto">
      {MenuItems.map((item, index) => (
        <NavLink
          key={index}
          className="border-2 border-blue-400  p-2 px-3 rounded-2xl text-center bg-gradient-to-r from-blue-300 to-blue-400 font-bold text-white hover:no-underline hover:border-blue-300"
          to={item.url}
        >
          {item.title}
        </NavLink>
      ))}
    </nav>
  );
};

export default NavBar;
