import React from "react";
import { NavLink } from "react-router-dom";

const Navbar: React.FC = () => {
  const navItems = [
    { to: "/network", label: "Home" },
    { to: "/about", label: "About" },
    { to: "/clubs-rooms", label: "Clubs/Rooms" },
    { to: "/projects", label: "Live Projects" },
  ];

  return (
    <nav className="navbar">
      {navItems.map(({ to, label }) => (
        <NavLink
          key={to}
          to={to}
          className={({ isActive }) =>
            `nav-btn ${isActive ? "active" : ""}`
          }
        >
          {label}
        </NavLink>
      ))}
    </nav>
  );
};

export default Navbar;
