import React from "react";
import logo from "../../Image/logo.png"; // 👈 نفس مسار اللوجو عندك
import "../Footer/Footer.css";
export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="row text-start">
          {/* Column 1 */}
          <div className="col-md-3 mb-3">
            <div className="d-flex align-items-center gap-2 mb-2">
              <img src={logo} className="logo" alt="logo" />
              <span className="brand">Heart Diseases</span>
            </div>

            <p className="footer-text">
              Check your heart care and make your life better.
            </p>

            <div className="social-icons d-flex gap-3">
              {/* ⚠️ في React لازم className مش class */}
              <i className="fa-brands fa-x-twitter"></i>
              <i className="fa-brands fa-facebook"></i>
              <i className="fa-brands fa-instagram"></i>
              <i className="fa-brands fa-linkedin"></i>
            </div>
          </div>

          {/* Column 2 */}
          <div className="col-md-3 mb-3">
            <h6 className="footer-title">Heart Disease</h6>
            <ul className="footer-list">
              <li>Heart Care</li>
              <li>Health Care</li>
              <li>About Us</li>
              <li>Contact Us</li>
            </ul>
          </div>

          {/* Column 3 */}
          <div className="col-md-3 mb-3">
            <h6 className="footer-title">Labs</h6>
            <ul className="footer-list">
              <li>AlMokhtabar</li>
              <li>Al Borg</li>
              <li>Hassab</li>
              <li>Al Shams</li>
            </ul>
          </div>

          {/* Column 4 */}
          <div className="col-md-3 mb-3">
            <h6 className="footer-title">Resources</h6>
            <ul className="footer-list">
              <li>AHA</li>
              <li>CDC</li>
              <li>NHLBI</li>
              <li>HFSA</li>
            </ul>
          </div>
        </div>

        <hr className="footer-line" />

        <p className="text-center copyright">
          © 2026 Heart Diseases. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
}
