import { NavLink } from "react-router-dom";


const SignupButton = () => (
  <NavLink
    to='/auth/signup'
    className={({ isActive }) =>
      [
        "cursor-pointer bg-white/20 text-white text-sm font-bold px-4 py-2.5 rounded-[12px]",
        "shadow-[0_0_10px_rgba(0,0,0,0.3)] transition-all duration-200 text-center whitespace-nowrap",
        "bg-transparent hover:bg-[#ffb6ff1a] hover:scale-110",
        isActive ? "ring-2 ring-[#ffb6ff]" : "",
      ].join(" ")
    }
  >
    Sign Up
  </NavLink>
);

export default SignupButton;
