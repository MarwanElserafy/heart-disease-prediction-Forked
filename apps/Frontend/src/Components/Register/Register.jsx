import React from "react";
import "./Register.css";
<<<<<<< Updated upstream
import heartImg from "../../assets/heart.png";
import logo from "../../assets/Logo.png";
import { FaUser, FaEnvelope, FaLock, FaIdCard } from "react-icons/fa";
=======

import heartImg from "../../assets/heart.png";
import logo from "../../assets/Logo.png";

import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaIdCard,
} from "react-icons/fa";

>>>>>>> Stashed changes
import { Link } from "react-router-dom";

const Register = () => {
  return (
<<<<<<< Updated upstream
    <div className="container-fluid register-container p-0">

      <div className="row register-card w-10 g-4 ">

        {/* LEFT SIDE */}
        <div
          className="col-lg-4 col-12 left-side"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.2), rgba(0,0,0,0.2)), url(${heartImg})`,
            backgroundSize: "cover",
            backgroundPosition: "center",
          }}
        >
          <div className="logo-title-wrapper">
            <img src={logo} alt="logo" className="logo" />
=======
    <div className="register-page">

      

      <div className="register-card">

        {/* LEFT IMAGE SIDE */}
        <div
          className="register-image-side"
          style={{
            backgroundImage: `
              linear-gradient(
                rgba(0,0,0,0.12),
                rgba(0,0,0,0.12)
              ),
              url(${heartImg})
            `,
          }}
        >
          <div className="brand">
            <img src={logo} alt="logo" className="brand-logo" />
>>>>>>> Stashed changes
            <h1>Heart Diseases</h1>
          </div>
        </div>

<<<<<<< Updated upstream
        {/* RIGHT SIDE */}
        <div className="col-lg-8 col-12 right-side">

          <div className="register-content">

            <h2>egister Page</h2>

=======
        {/* RIGHT FORM SIDE */}
        <div className="register-form-side">

          <div className="form-content">

            <h2>Register Page</h2>

            {/* EMAIL */}
>>>>>>> Stashed changes
            <div className="input-group">
              <input type="email" placeholder="Email" />
              <FaEnvelope className="input-icon" />
            </div>

<<<<<<< Updated upstream
            <div className="input-group">
              <input type="text" placeholder="National ID" />
              <FaIdCard className="input-icon" />
            </div>

=======
            {/* NATIONAL ID */}
            <div className="input-group">
              <input type="text" placeholder="National Id" />
              <FaIdCard className="input-icon" />
            </div>

            {/* USERNAME */}
>>>>>>> Stashed changes
            <div className="input-group">
              <input type="text" placeholder="Username" />
              <FaUser className="input-icon" />
            </div>

<<<<<<< Updated upstream
=======
            {/* PASSWORD */}
>>>>>>> Stashed changes
            <div className="input-group">
              <input type="password" placeholder="Password" />
              <FaLock className="input-icon" />
            </div>

<<<<<<< Updated upstream
            <button className="btn-gradient">
              Create Account
            </button>

            <div className="login-link">
              Already have an account?{" "}
              <Link to="/login">Login</Link>
            </div>
=======
            <button className="create-btn">
              Create Account
            </button>

            <p className="login-text">
              Already Have An Account?
              <Link to="/login"> Log In</Link>
            </p>
>>>>>>> Stashed changes

          </div>

        </div>

      </div>
<<<<<<< Updated upstream
    // </div>
=======
    </div>
>>>>>>> Stashed changes
  );
};

export default Register;