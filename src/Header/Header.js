import React, { Component } from "react";
import logo from "../assets/logo/variations/full-logo-01.png";
import "./Header.css";

class Header extends Component {
  state = { clicked: false };

  render() {
    return (
      <header id="header">
        <h1>
          <img src={logo} className="logo" alt="PanicSwap" />
        </h1>
      </header>
    );
  }
}

export default Header;
