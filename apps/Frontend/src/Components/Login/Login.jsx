import React, { useState } from "react";
import "./Login.css";

import heartImg from "../../assets/heartLog.png";
import logo from "../../assets/Logo.png";

import { FaEnvelope, FaLock } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

import axios from "axios";

const Login = () => {

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ================= VALIDATION =================
  const validate = (name, value) => {

    let error = "";

    // EMAIL
    if (name === "email") {

      if (!value.trim()) {

        error = "Email is required";

      } else if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
      ) {

        error = "Invalid email format";
      }
    }

    // PASSWORD
    if (name === "password") {

      if (!value.trim()) {

        error = "Password is required";

      } else if (value.length < 6) {

        error =
          "Password must be at least 6 characters";
      }
    }

    return error;
  };

  // ================= HANDLE CHANGE =================
  const handleChange = (e) => {

    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));

    const error = validate(name, value);

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  // ================= HANDLE BLUR =================
  const handleBlur = (e) => {

    const { name, value } = e.target;

    const error = validate(name, value);

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  // ================= LOGIN =================
  const handleLogin = async () => {

    const emailError = validate(
      "email",
      form.email
    );

    const passwordError = validate(
      "password",
      form.password
    );

    if (emailError || passwordError) {

      setErrors({
        email: emailError,
        password: passwordError,
      });

      return;
    }

    try {

      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          email: form.email,
          password: form.password,
        }
      );

      // ================= SUCCESS =================
      alert("Login Successfully");

      // ================= GET TOKEN =================
      const token =
        res.data.token ||
        res.data.data?.token;

      // ================= SAVE TOKEN =================
      if (token) {

        localStorage.setItem(
          "token",
          token
        );
      }

      // ================= SAVE USER =================
      localStorage.setItem(
        "user",
        JSON.stringify(
          res.data.data || res.data.user
        )
      );

      // ================= CLEAR ERRORS =================
      setErrors({});

      // ================= NAVIGATE =================
      navigate("/the_general");

    } catch (err) {

      console.log(
        "FULL ERROR => ",
        err.response?.data
      );

      const backendError =
        "Invalid email or password";

      setErrors({
        password: backendError,
      });

    } finally {

      setLoading(false);
    }
  };

  return (

    <div className="login-container">

      <div className="login-card">

        {/* ================= LEFT SIDE ================= */}
        <div className="login-left">

          <div className="login-content">

            <h2>
              Login Page
            </h2>

            {/* ================= EMAIL ================= */}
            <div className="input-group">

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
              />

              <FaEnvelope className="input-icon" />

              {errors.email && (

                <span className="error">
                  {errors.email}
                </span>

              )}

            </div>

            {/* ================= PASSWORD ================= */}
            <div className="input-group">

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={form.password}
                onChange={handleChange}
                onBlur={handleBlur}
              />

              <FaLock className="input-icon" />

              {errors.password && (

                <span className="error">
                  {errors.password}
                </span>

              )}

            </div>

            {/* ================= BUTTON ================= */}
            <button
              className="btn-gradient"
              onClick={handleLogin}
              disabled={loading}
            >

              {loading
                ? "Logging in..."
                : "Log In"}

            </button>

            {/* ================= REGISTER ================= */}
            <div className="register-link">

              Don't have an account?{" "}

              <Link to="/register">
                Register Now
              </Link>

            </div>

          </div>

        </div>

        {/* ================= RIGHT SIDE ================= */}
        <div
          className="login-right"
          style={{
            backgroundImage: `linear-gradient(
              rgba(0,0,0,0.25),
              rgba(0,0,0,0.25)
            ), url(${heartImg})`,
          }}
        >

          <div className="logo-title-wrapper">

            <img
              src={logo}
              className="logo"
              alt="logo"
            />

            <h1>
              Heart Diseases
            </h1>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Login;