import React, { Component } from "react";
import { NavLink  } from "react-router-dom";
import { MenuItems } from "./MenuItems";
import "./NavBar.css";

class NavBar extends Component {
  state = { clicked: false };

  render() {
    return (
      <nav id="nav">
        <div className="NavbarItems">
          <ul className={`nav-menu`}>
            {MenuItems.map((item, index) => {
              return (
                <li key={index}>
                  <NavLink className={"nav-links"} to={item.url}>
                    {item.title}
                  </NavLink>
                </li>
              );
            })}
          </ul>
        </div>
      </nav>
    );
  }
}

export default NavBar;
