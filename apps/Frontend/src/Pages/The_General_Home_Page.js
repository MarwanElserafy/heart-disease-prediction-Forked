import React, { useState } from "react";
import "../Pages/The_General_Home_Page.css";
import "../fontawesome-free-7.0.0-web/css/all.min.css";
import nabd from "../Image/nabd.png";
import heart_icons from "../Image/heart_icons.png";
import Box from "../Image/Box.png";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

function Home() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleStartPrediction = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Please Login First");
        setLoading(false);
        return;
      }

      // Check lab status
      const statusRes = await axios.get("http://localhost:5000/api/labtests/me/status", {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (!statusRes.data.data.hasLabTests) {
        // No Data -> go to prediction page (labs will appear here)
        navigate("/prediction");
        return;
      }

      // Has Data -> start prediction
      const predRes = await axios.post("http://localhost:5000/api/predictions/start", {}, {
        headers: { Authorization: `Bearer ${token}` }
      });

      const predictionData = predRes.data.data;
      localStorage.setItem("prediction", JSON.stringify(predictionData));
      localStorage.setItem("prediction_id", predictionData.prediction_id);

      if (predictionData.probability < 70) {
        navigate("/have_no_risk");
      } else {
        navigate("/have_risk");
      }
    } catch (err) {
      console.log(err);
      alert(err.response?.data?.message || "Prediction Failed");
      navigate("/prediction"); // fallback
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-page">
      {" "}
      
      {/* Hero Section */}{" "}
      <section className="hero text-center">
        {" "}
        <h2 className="hero-title">Heart Disease Prediction Tool</h2>{" "}
        <p className="hero-subtitle">Advanced AI-Powered Analysis To Assess </p>{" "}
        <p className="hero-subtitle">Your Heart Health Risk Factors</p>{" "}
        <div className="hero-buttons">
          {" "}
          <button onClick={handleStartPrediction} disabled={loading} className="btn custom-btn px-4 py-2 rounded-pill me-3">
             {loading ? "Loading..." : "Start Prediction →"}
          </button>

          <Link to="/learnmore" className="btn learn btn-outline-dark rounded-pill">
                       Learn More →
          </Link>
        </div>{" "}
      </section>{" "}
      {/* Features Section */}
      <section className="container my-5">
        <div className="row align-items-stretch justify-content-center text-center g-4">
          {/* Card 1 */}
          <div className="col-md-4">
            <div className="feature-card">
              <div className="icon">
                <img src={nabd} className="image_iconn" alt="accurate analysis icon" />

              </div>
              <h5 className="Title_card">Accurate Analysis</h5>
              <p className="cap_Card">
                Advanced Machine Learning Models Trained On Extensive Medical
                Data
              </p>
            </div>
          </div>

          {/* Card 2 */}
          <div className="col-md-4">
            <div className="feature-card">
              <div className="icon">
                <img src={heart_icons} className="image_iconn" alt="health insights icon" />

              </div>
              <h5 className="Title_card">Health Insights</h5>
              <p className="cap_Card">
                Detailed Risk Factor Analysis And Personalized Health Recommendations
              </p>
            </div>
          </div>

          {/* Card 3 */}
          <div className="col-md-4">
            <div className="feature-card">
              <div className="icon">
                <img src={Box} className="image_iconn" alt="early detection icon" />

              </div>
              <h5 className="Title_card">Early Detection</h5>
              <p className="cap_Card">
                Identify Potential Heart Health Concerns Before They Become
                Serious
              </p>
            </div>
          </div>
        </div>
      </section>
      
    </div>
  );
}
export default Home;
