import React, { useState } from "react";
import axios from "axios";
import "./Login.css";
import heartImg from "../../assets/heartLog.png";
import logo from "../../assets/Logo.png";
import { FaUser, FaLock } from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";

const Login = () => {
  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  // ===== VALIDATION =====
  const validate = (name, value) => {
    let error = "";

    if (name === "username") {
      if (!value) error = "Username is required";
    }

    if (name === "password") {
      if (!value) error = "Password is required";
    }

    return error;
  };

  // ===== HANDLE CHANGE =====
  const handleChange = (e) => {
    const { name, value } = e.target;

    setForm({ ...form, [name]: value });

    const error = validate(name, value);

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  // ===== HANDLE BLUR =====
  const handleBlur = (e) => {
    const { name, value } = e.target;

    const error = validate(name, value);

    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  // ===== LOGIN =====
  const handleLogin = async () => {
    const usernameError = validate("username", form.username);
    const passwordError = validate("password", form.password);

    if (usernameError || passwordError) {
      setErrors({
        username: usernameError,
        password: passwordError,
      });
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/auth/login",
        {
          username: form.username,
          password: form.password,
        }
      );

      const { token, data } = res.data;

      // ✅ save auth data
      if (token) {
        localStorage.setItem("token", token);
      }

      localStorage.setItem("user", JSON.stringify(data));

      setErrors({});
      navigate("/the_general");

    } catch (err) {
      const backendError =
        err.response?.data?.message ||
        err.response?.data?.error ||
        "Login failed";

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

        {/* LEFT SIDE */}
        <div className="login-left">
          <div className="login-content">

            <h2>Login Page</h2>

            {/* Username */}
            <div className="input-group">
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={form.username}
                onChange={handleChange}
                onBlur={handleBlur}
              />
              <FaUser className="input-icon" />
              {errors.username && (
                <span className="error">{errors.username}</span>
              )}
            </div>

            {/* Password */}
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
                <span className="error">{errors.password}</span>
              )}
            </div>

            <button
              className="btn-gradient"
              onClick={handleLogin}
              disabled={loading}
            >
              {loading ? "Logging in..." : "Log In"}
            </button>

            <div className="register-link">
              Don't have an account?{" "}
              <Link to="/register">Register Now</Link>
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