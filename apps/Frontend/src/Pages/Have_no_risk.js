import React, { useEffect, useState } from "react";

import "../Pages/Have_no_risk.css";

import { Link, useNavigate } from "react-router-dom";

function Home() {

  const [prediction, setPrediction] = useState(null);

  const navigate = useNavigate();

  // ================= GET PREDICTION =================
  useEffect(() => {

    const token = localStorage.getItem("token");

    // PROTECT PAGE
    if (!token) {

      navigate("/login");

      return;
    }

    const savedPrediction = localStorage.getItem("prediction");

    if (savedPrediction) {

      setPrediction(
        JSON.parse(savedPrediction)
      );

    }

  }, [navigate]);

  return (

    <div className="home-page">

      {/* Hero Section */}
      <section className="hero text-center">

        <h2 className="hero-title">
          Heart Disease Prediction Tool
        </h2>

        <p className="hero-subtitle">
          Advanced AI-Powered Analysis To Assess
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

          <Link
            to="/learnmore"
            className="btn learn btn-outline-dark rounded-pill"
          >
            Learn More →
          </Link>

        </div>

      </section>

      {/* Result Section */}
      <section className="result-section text-center">

        <h3 className="title-result">
          The Percentage That You Have Heart Diseases Or Not
        </h3>

        <p className="result-note_">
          If The Percentage Is Higher Than 70%
          It Means You Have Heart Diseases
        </p>

        <div className="result-card mx-auto">

          <p className="result-label">
            The Percentage Is :
          </p>

          <h2 className="result-value_">

            {prediction?.probability
              ? `${prediction.probability}%`
              : "0%"}

          </h2>

          <p className="result-status">

            {prediction?.probability < 70
              ? "You Are Ok ❤️"
              : "You Have Risk ⚠️"}

          </p>

          {/* STATUS */}
          {prediction?.status && (

            <p className="mt-2">

              Status :
              {" "}
              <strong>
                {prediction.status}
              </strong>

            </p>

          )}

          {/* MOST AFFECTED FACTOR */}
          {prediction?.most_affected_factor && (

            <p>

              Most Affected Factor :
              {" "}
              <strong>
                {prediction.most_affected_factor}
              </strong>

            </p>

          )}

        </div>

      </section>

    </div>
  );
}

export default Home;