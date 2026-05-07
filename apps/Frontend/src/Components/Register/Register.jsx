import React from "react";
import "./Register.css";

import heartImg from "../../assets/heart.png";
import logo from "../../assets/Logo.png";

import {
  FaUser,
  FaEnvelope,
  FaLock,
  FaIdCard,
} from "react-icons/fa";

import { Link } from "react-router-dom";

const Register = () => {
  return (
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
            <h1>Heart Diseases</h1>
          </div>
        </div>

        {/* RIGHT FORM SIDE */}
        <div className="register-form-side">

          <div className="form-content">

            <h2>Register Page</h2>

            {/* EMAIL */}
            <div className="input-group">
              <input type="email" placeholder="Email" />
              <FaEnvelope className="input-icon" />
            </div>

            {/* NATIONAL ID */}
            <div className="input-group">
              <input type="text" placeholder="National Id" />
              <FaIdCard className="input-icon" />
            </div>

            {/* USERNAME */}
            <div className="input-group">
              <input type="text" placeholder="Username" />
              <FaUser className="input-icon" />
            </div>

            {/* PASSWORD */}
            <div className="input-group">
              <input type="password" placeholder="Password" />
              <FaLock className="input-icon" />
            </div>

            <button className="create-btn">
              Create Account
            </button>

            <p className="login-text">
              Already Have An Account?
              <Link to="/login"> Log In</Link>
            </p>

          </div>

        </div>

      </div>
    </div>
  );
};

export default Register;