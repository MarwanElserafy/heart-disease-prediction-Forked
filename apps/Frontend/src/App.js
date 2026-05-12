import React from "react";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";

import Navbar from "./Components/Navbar/Navbar";
import Footer from "./Components/Footer/Footer";

import Home from "./Pages/Home";
import TheGeneralHome from "./Pages/The_General_Home_Page";
import HaveRisk from "./Pages/Data_have_risk";
import HaveNoRisk from "./Pages/Have_no_risk";
import Profile from "./Pages/Profile";
import Login from "./Components/Login/Login";
import Register from "./Components/Register/Register";
import Prediction from "./Components/Prediction/Prediction";
import Learnmore from "./Components/Learnmore/Learnmore";
import ProtectedRoute from "./Components/ProtectedRoute";

import { AuthProvider } from "./Context/AuthContext";

export default function App() {
  const location = useLocation();

  const hideNavbar =
    location.pathname === "/login" ||
    location.pathname === "/register";

  const hideFooter =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/home";

  return (
    <AuthProvider>
      <div className="app-container">

        {/* NAVBAR */}
        {!hideNavbar && <Navbar />}

        {/* PAGE CONTENT */}
        <div className="page-content">
          <Routes>

  <Route path="/" element={<Navigate to="/home" />} />

  {/* PUBLIC ROUTES */}
  <Route path="/home" element={<Home />} />
  <Route path="/login" element={<Login />} />
  <Route path="/register" element={<Register />} />

  {/* PROTECTED ROUTES */}
  <Route
    path="/the_general"
    element={
      <ProtectedRoute>
        <TheGeneralHome />
      </ProtectedRoute>
    }
  />

  <Route
    path="/have_risk"
    element={
      <ProtectedRoute>
        <HaveRisk />
      </ProtectedRoute>
    }
  />

  <Route
    path="/have_no_risk"
    element={
      <ProtectedRoute>
        <HaveNoRisk />
      </ProtectedRoute>
    }
  />

  <Route
    path="/prediction"
    element={
      <ProtectedRoute>
        <Prediction />
      </ProtectedRoute>
    }
  />

  <Route
    path="/profile"
    element={
      <ProtectedRoute>
        <Profile />
      </ProtectedRoute>
    }
  />

  <Route
    path="/learnmore"
    element={
      <ProtectedRoute>
        <Learnmore />
      </ProtectedRoute>
    }
  />

</Routes>
        </div>

        {/* FOOTER */}
        {!hideFooter && <Footer />}

      </div>
    </AuthProvider>
  );
}