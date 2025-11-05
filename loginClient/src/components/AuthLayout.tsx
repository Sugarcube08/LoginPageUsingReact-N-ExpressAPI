import React from "react";
import { Outlet } from "react-router-dom";

const AuthLayout: React.FC = () => {
  return (
    <div className="">
      <Outlet />
    </div>
  );
};

export default AuthLayout;
