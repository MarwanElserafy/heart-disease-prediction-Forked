import React from "react";

import { Navigate } from "react-router-dom";

const ProtectedRoute = ({ children }) => {

  const token = localStorage.getItem("token");

  // لو مفيش توكن
  if (!token) {

    return <Navigate to="/login" />;

  }

  // لو فيه توكن
  return children;
};

export default ProtectedRoute;