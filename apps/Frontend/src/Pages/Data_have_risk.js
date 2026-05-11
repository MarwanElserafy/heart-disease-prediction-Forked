import React from "react";
import "../Pages/Data_have_risk.css";
import "../fontawesome-free-7.0.0-web/css/all.min.css";

import effect from "../Image/The_most_factor.jpg";
import logo from "../Image/logo.png";
import location_icon from "../Image/Loction_icon.png";

import { Link } from "react-router-dom";

function Home() {
  return (
    <div className="home-page">

      {/* HERO SECTION */}
      <section className="hero text-center">
        <h2 className="hero-title">Heart Disease Prediction Tool</h2>

        <p className="hero-subtitle">
          Advanced AI Powered Analysis To Assess
        </p>
        <p className="hero-subtitle">
          Your Heart Health Risk Factors
        </p>

        <div className="hero-buttons">
          <Link to="/prediction">
            <button className="btn custom-btn px-4 py-2 rounded-pill me-3">
              Start Prediction →
            </button>
          </Link>

          <Link to="/learnmore" className="btn learn btn-outline-dark rounded-pill">
            Learn More →
          </Link>
        </div>
      </section>

      {/* RESULT SECTION */}
      <section className="result-section text-center">
        <h3 className="result-title">
          The Percentage That You Have Heart Disease Or Not
        </h3>

        <p className="result-note">
          If the percentage is higher than 70% it means you have heart disease
        </p>

        <div className="result-card mx-auto">
          <p className="result-label">The Percentage Is :</p>
          <p className="result-value">70%</p>
          <p className="result-status">You Have A Problem</p>
        </div>

        <div className="most-effect">
          <h3 className="effect-title">
            The Most Affected Factor In The Result
          </h3>
          <img className="effect-img" src={effect} alt="effect" />
        </div>
      </section>

      {/* HOSPITALS SECTION */}
      <section className="hospitals-section">

        <h3 className="cap-effect">
          You should go to one of these hospitals <br />
          that specialize in heart diseases
        </h3>

        {/* CITY: ALEXANDRIA */}
        <div className="city-box">
          <h5 className="city-title">Alexandria</h5>
        </div>

        <div className="hospitals-container">

          {/* Hospital Card */}
          <a
            href="https://www.google.com/maps"
            target="_blank"
            rel="noopener noreferrer"
            className="hospital-card"
          >
            <p className="hospital-name">Elite Hospital</p>

            <div className="location">
              <img src={location_icon} alt="location" />
              <p>Alexandria, Egypt</p>
            </div>

            <iframe
              className="hospital-map"
              src="https://maps.google.com/maps?q=31.17,29.94&z=15&output=embed"
              loading="lazy"
              title="map"
            />
          </a>

        </div>

        {/* CITY: CAIRO */}
        <div className="city-box">
          <h5 className="city-title">Cairo</h5>
        </div>

        <div className="hospitals-container">

          <a
            href="https://www.google.com/maps"
            target="_blank"
            rel="noopener noreferrer"
            className="hospital-card"
          >
            <p className="hospital-name">Al Salam Hospital</p>

            <div className="location">
              <img src={location_icon} alt="location" />
              <p>Cairo, Egypt</p>
            </div>

            <iframe
              className="hospital-map"
              src="https://maps.google.com/maps?q=30.05,31.23&z=15&output=embed"
              loading="lazy"
              title="map"
            />
          </a>

        </div>
      </section>

      {/* FOOTER */}
      <footer className="footer">
        <img src={logo} alt="logo" />

        <p>Heart Diseases - Check your heart care and improve your life</p>

        <div className="footer-links">
          <span>Home</span>
          <span>About</span>
          <span>Labs</span>
          <span>Contact</span>
        </div>

        <p className="copyright">
          © 2026 Heart Diseases. All Rights Reserved.
        </p>
      </footer>

    </div>
  );
}

export default Home;