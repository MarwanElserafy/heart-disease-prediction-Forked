<<<<<<< Updated upstream
import React from "react";
=======
import React, { useState } from "react";
>>>>>>> Stashed changes
import "./Login.css";
import heartImg from "../../assets/heartLog.png";
import logo from "../../assets/Logo.png";
import { FaUser, FaLock } from "react-icons/fa";
<<<<<<< Updated upstream
import { Link } from "react-router-dom";

const Login = () => {
=======
import { Link, useNavigate } from "react-router-dom";

  const Login = () => {
  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  // ✅ validation
  const validate = (name, value) => {
    let error = "";

    if (name === "email") {
      if (!value) {
        error = "Email is required";
      } else if (!/^[^\s@]+@[^\s@]+\.[a-zA-Z]{2,}$/.test(value)) {
        error = "Invalid email format";
      }
    }

    if (name === "password") {
      if (!value) {
        error = "Password is required";
      }
    }

    return error;
  };

  // onChange
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({ ...form, [name]: value });

    const error = validate(name, value);

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  // onBlur
  const handleBlur = (e) => {
    const { name, value } = e.target;

    const error = validate(name, value);

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  // submit
  const handleLogin = () => {
    const emailError = validate("email", form.email);
    const passwordError = validate("password", form.password);

    if (emailError || passwordError) {
      setErrors({
        email: emailError,
        password: passwordError,
      });
      return;
    }

    // 🔴 هنا الباك إند بعدين
    /*
    لو الباسورد غلط:
    setErrors({ password: "Incorrect password" });

    لو الإيميل مش موجود:
    setErrors({ email: "User not found" });
    */

    // ✅ مؤقت
    localStorage.setItem("user", "true");
    localStorage.setItem("type", "risk");

    navigate("/the_general");
  };
>>>>>>> Stashed changes
  return (
    <div className="login-container">

      <div className="login-card">

        {/* LEFT SIDE */}
        <div className="login-left">
          <div className="login-content">
            <h2>Login Page</h2>

            <div className="input-group">
              <input type="text" placeholder="Username" />
              <FaUser className="input-icon" />
            </div>

            <div className="input-group">
              <input type="password" placeholder="Password" />
              <FaLock className="input-icon" />
            </div>

            <button className="btn-gradient">Log In</button>

            <div className="register-link">
              Don't have an account? <Link to="/register">Register Now</Link>
            </div>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div
          className="login-right"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.25), rgba(0,0,0,0.25)), url(${heartImg})`,
          }}
        >
          <div className="logo-title-wrapper">
            <img src={logo} className="logo" alt="logo" />
            <h1>Heart Diseases</h1>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Login;