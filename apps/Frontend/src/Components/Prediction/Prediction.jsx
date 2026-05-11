import React, { useState } from "react";
import axios from "axios";

import "./Prediction.css";
import lab1 from "../../assets/lab1.png";
import lab2 from "../../assets/lab2.png";
import lab3 from "../../assets/lab3.png";
import lab4 from "../../assets/lab4.png";
import lab5 from "../../assets/lab5.png";
import lab6 from "../../assets/lab6.png";

import { Link } from "react-router-dom";

import { BsGeoAltFill } from "react-icons/bs";

import HaveRisk from "../../Pages/Data_have_risk";
import HaveNoRisk from "../../Pages/Have_no_risk";


const Prediction = () => {

  // ================= STATE =================
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // ================= API CALL =================
  const handleStartPrediction = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("token");

      const res = await axios.post(
        "http://localhost:5000/api/predictions/start",
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setResult(res.data.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  // ================= LOADING STATE =================
  if (loading) {
    return (
      <div className="prediction-page">
        <div className="prediction-card">
          <h2>Loading Prediction...</h2>
        </div>
      </div>
    );
  }

  // ================= RESULT LOGIC =================
  if (result) {
    if (result.probability < 70) {
      return <HaveNoRisk />;
    } else {
      return <HaveRisk />;
    }
  }

  // ================= UI (ORIGINAL PAGE) =================
  return (
    <div className="prediction-page">
      <div className="prediction-card">

        <h1>Heart Disease Prediction Tool</h1>

        <p className="subtitle">
          Advanced AI Powered Analysis To Assess<br />
          <span>Your Heart Health Risk Factors</span>
        </p>

        {/* Buttons */}
        <div className="prediction-buttons">

          {/* 🔥 FIXED BUTTON (was Link before) */}
          <button
            onClick={handleStartPrediction}
            className="btn custom-btn px-4 py-2 rounded-pill me-3"
          >
            Start Prediction →
          </button>

          <Link to="/learnmore" className="btn learn btn-outline-dark rounded-pill">
            Learn More →
          </Link>
        </div>

        {/* Report */}
        <p className="report-title">
          The Percentage That You Have Heart Diseases Or Not<br />
          <span className="highlight">
            if the percentage is higher than 70% it means you have Heart Diseases
          </span>
        </p>

        <div className="report-box">
          <h4>You Don't Have Data</h4>
          <span>Or The Lab Doesn't Finish The Report File</span>
        </div>

        <p className="info-text">
          You Should Go To Trusted Medical Labs So You Can Start Prediction
        </p>

        {/* ================= LABS SECTION ================= */}
        <div className="labs-section">

          <div className="labs-top">
            <div>
              <h3 className="labs-title">Trusted Medical Labs</h3>
              <p className="labs-sub">
                There Is Thousands Of Trusted Medical Labs
              </p>
            </div>

            <div className="arrows">
              <button>{"<"}</button>
              <button>{">"}</button>
            </div>
          </div>

          {/* ================= LABS ================= */}
          <div className="labs-wrapper">

            {/* Mokhtabar */}
            <a
              href="https://almokhtabar.com/ar/%d8%a7%d9%84%d9%81%d8%b1%d9%88%d8%b9/"
              target="_blank"
              rel="noopener noreferrer"
              className="lab-card"
            >
              <div className="lab-image">
                <img src={lab1} alt="mokhtabar" />
              </div>

              <div className="lab-content">
                <div className="lab-title-row">
                  <h4>Al Mokhtabar Labs</h4>
                  <span className="rating-badge">⭐ 4.6</span>
                </div>

                <div className="lab-info">
                  <p><BsGeoAltFill /> Cairo, 599 Port Said Street, Bab El Shaaria</p>
                  <p><BsGeoAltFill /> Alexandria – Sporting</p>
                </div>
              </div>
            </a>

            {/* Borg */}
            <a
              href="https://alborglab.com/branches/"
              target="_blank"
              rel="noopener noreferrer"
              className="lab-card"
            >
              <div className="lab-image">
                <img src={lab2} alt="borg" />
              </div>

              <div className="lab-content">
                <div className="lab-title-row">
                  <h4>Al Borg Labs</h4>
                  <span className="rating-badge">⭐ 4.0</span>
                </div>

                <div className="lab-info">
                  <p><BsGeoAltFill /> Cairo, Bab El Shaaria</p>
                  <p><BsGeoAltFill /> Alexandria, Raml Station</p>
                </div>
              </div>
            </a>

            {/* Hassab */}
            <a
              href="https://hassab.com/site/ar/%D9%81%D8%B1%D9%88%D8%B9%D9%86%D8%A7/"
              target="_blank"
              rel="noopener noreferrer"
              className="lab-card"
            >
              <div className="lab-image">
                <img src={lab3} alt="hassab" />
              </div>

              <div className="lab-content">
                <div className="lab-title-row">
                  <h4>Hassab Labs</h4>
                  <span className="rating-badge">⭐ 3.9</span>
                </div>

                <div className="lab-info">
                  <p><BsGeoAltFill /> Cairo, Heliopolis</p>
                  <p><BsGeoAltFill /> Alexandria, Sidi Gaber</p>
                </div>
              </div>
            </a>

            {/* Royal */}
            <a
              href="https://royal-lab.net/ar/%D9%81%D8%B1%D9%88%D8%B9%D9%86%D8%A7/"
              target="_blank"
              rel="noopener noreferrer"
              className="lab-card"
            >
              <div className="lab-image">
                <img src={lab4} alt="royal" />
              </div>

              <div className="lab-content">
                <div className="lab-title-row">
                  <h4>Royal Labs</h4>
                  <span className="rating-badge">⭐ 3.8</span>
                </div>

                <div className="lab-info">
                  <p><BsGeoAltFill /> Cairo, Maadi</p>
                  <p><BsGeoAltFill /> Alexandria, Raml Station</p>
                </div>
              </div>
            </a>

            {/* Shams */}
            <a
              href="http://alshamslabs.com/branches.aspx"
              target="_blank"
              rel="noopener noreferrer"
              className="lab-card"
            >
              <div className="lab-image">
                <img src={lab5} alt="shams" />
              </div>

              <div className="lab-content">
                <div className="lab-title-row">
                  <h4>Al Shams Labs</h4>
                  <span className="rating-badge">⭐ 3.7</span>
                </div>

                <div className="lab-info">
                  <p><BsGeoAltFill /> Cairo, Abbassia</p>
                  <p><BsGeoAltFill /> Alexandria, Moharram Bek</p>
                </div>
              </div>
            </a>

            {/* Nile */}
            <a
              href="https://nilescanandlabs.net/%D9%81%D8%B1%D9%88%D8%B9%D9%86%D8%A7/"
              target="_blank"
              rel="noopener noreferrer"
              className="lab-card"
            >
              <div className="lab-image">
                <img src={lab6} alt="nile" />
              </div>

              <div className="lab-content">
                <div className="lab-title-row">
                  <h4>Nile Scan Labs</h4>
                  <span className="rating-badge">⭐ 3.6</span>
                </div>

                <div className="lab-info">
                  <p><BsGeoAltFill /> Cairo, Downtown</p>
                  <p><BsGeoAltFill /> Alexandria, Raml Station</p>
                </div>
              </div>
            </a>

          </div>
        </div>

      </div>
    </div>
  );
};

export default Prediction;