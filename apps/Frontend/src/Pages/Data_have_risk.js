import React, { useEffect, useState } from "react";
import axios from "axios";

import "../Pages/Data_have_risk.css";
import "../fontawesome-free-7.0.0-web/css/all.min.css";

import { Link, useNavigate } from "react-router-dom";

import {
  FaMapMarkerAlt,
  FaDownload,
} from "react-icons/fa";

function Home() {

  const [prediction, setPrediction] =
    useState(null);

  const [hospitals, setHospitals] =
    useState([]);

  const [shapImage, setShapImage] =
    useState(null);

  const navigate = useNavigate();

  // ================= GET DATA =================
  useEffect(() => {

    const token =
      localStorage.getItem("token");

    // ================= PROTECT PAGE =================
    if (!token) {

      navigate("/login");

      return;
    }

    // ================= GET PREDICTION =================
    const savedPrediction =
      localStorage.getItem("prediction");

    // ================= NO PREDICTION =================
    if (!savedPrediction) {

      navigate("/prediction");

      return;
    }

    const parsedPrediction =
      JSON.parse(savedPrediction);

    setPrediction(parsedPrediction);

    // ================= REDIRECT IF LOW RISK =================
    if (
      parsedPrediction?.probability < 70
    ) {

      navigate("/have_no_risk");


      return;
    }

    // ================= GET SHAP IMAGE =================
    if (parsedPrediction.show_shap) {

      fetchShapImage(
        parsedPrediction.prediction_id
      );
    }

    // ================= GET HOSPITALS =================
    fetchHospitals();

  }, [navigate]);

  // ================= FETCH SHAP IMAGE =================
  const fetchShapImage = async (
    predictionId
  ) => {

    try {

      const token =
        localStorage.getItem("token");

      const res = await axios.get(
        `http://localhost:5000/api/predictions/${predictionId}/shap`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          responseType: "blob",
        }
      );

      const imageUrl =
        URL.createObjectURL(res.data);

      setShapImage(imageUrl);

    } catch (err) {

      console.log(err);

    }
  };

  // ================= GET NEAR HOSPITALS =================
  const fetchHospitals = async () => {

    try {

      navigator.geolocation.getCurrentPosition(

        async (position) => {

          const lat =
            position.coords.latitude;

          const lon =
            position.coords.longitude;

          // ================= GET USER CITY =================
          const geoRes = await axios.get(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`
          );

          let city =
            geoRes.data.address.city ||
            geoRes.data.address.state ||
            geoRes.data.address.county ||
            "Cairo";

          // ================= NORMALIZE CITY =================
          city = city.toLowerCase();

          if (
            city.includes("alex") ||
            city.includes("الإسكندرية")
          ) {

            city = "Alexandria , Egypt";

          } else {

            city = "Cairo , Egypt";
          }

          // ================= GET HOSPITALS BY AREA =================
          const hospitalsRes = await axios.get(
            `http://localhost:5000/api/hospitals/area/${encodeURIComponent(city)}`
          );

          setHospitals(
            hospitalsRes.data.data
          );

        },

        (error) => {

          console.log(error);

          alert(
            "Please Allow Location Access"
          );

        }
      );

    } catch (err) {

      console.log(err);

    }
  };

  // ================= DOWNLOAD REPORT =================
  const handleDownloadReport =
    async () => {

      try {

        const token =
          localStorage.getItem("token");

        const predictionId =
          prediction?.prediction_id;

        if (!predictionId) {

          alert("No Report Found");

          return;
        }

        const res = await axios.get(
          `http://localhost:5000/api/predictions/${predictionId}/report`,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
            responseType: "blob",
          }
        );

        const url =
          window.URL.createObjectURL(
            new Blob([res.data])
          );

        const link =
          document.createElement("a");

        link.href = url;

        link.setAttribute(
          "download",
          "Heart_Report.pdf"
        );

        document.body.appendChild(link);

        link.click();

      } catch (err) {

        console.log(err);

        alert(
          "Failed To Download Report"
        );
      }
    };

  return (

    <div className="home-page">

      {/* HERO SECTION */}
      <section className="hero text-center">

        <h2 className="hero-title">
          Heart Disease Prediction Tool
        </h2>

        <p className="hero-subtitle">
          Advanced AI Powered Analysis
        </p>

        <p className="hero-subtitle">
          To Assess Your Heart Health
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

      {/* RESULT SECTION */}
      <section className="result-section text-center">

        <h3 className="result-title">

          The Percentage That You Have Heart Disease Or Not

        </h3>

        <p className="result-note">

          If the percentage is higher than 70%
          it means you have heart disease

        </p>

        <div className="result-card mx-auto">

          <p className="result-label">

            The Percentage Is :

          </p>

          <p className="result-value">

            {prediction?.probability
              ? `${prediction.probability}%`
              : "0%"}

          </p>

          <p className="result-status">

            {prediction?.decision_label ||
              "Heart Disease Risk"}

          </p>

        </div>

        {/* ================= SHAP IMAGE ================= */}
        {prediction?.show_shap &&
          shapImage && (

            <div className="shap-container">

              <h3 className="medical-report-title">

                AI Explanation (SHAP)

              </h3>

              <img
                src={shapImage}
                alt="SHAP Explanation"
                className="shap-image"
              />

            </div>

          )}

        {/* REPORT */}
        {prediction?.show_report && (

          <div className="medical-report-container">

            <h3 className="medical-report-title">

              Your Medical Report:

            </h3>

            <button
              onClick={handleDownloadReport}
              className="download-report-btn"
            >

              <FaDownload className="download-icon" />

              Download Report

            </button>

          </div>

        )}

      </section>

      {/* HOSPITALS */}
      {prediction?.show_hospitals && (

        <section className="hospitals-section">

          <h3 className="cap-effect">

            You should go to one of these hospitals
            that specialize in heart disease.

          </h3>

          <div className="hospitals-container">

            {hospitals.length > 0 ? (

              hospitals.map((hospital) => {

                return (

                  <a
                    key={hospital.id}
                    href={hospital.google_maps_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hospital-card"
                  >

                    {/* HOSPITAL NAME */}
                    <p className="hospital-name">

                      {hospital.name}

                    </p>

                    {/* LOCATION */}
                    <div className="location">

                      <FaMapMarkerAlt className="location_icon" />

                      <span className="location_name">

                        {hospital.area}

                      </span>

                    </div>

                    {/* GOOGLE MAP */}
                    <iframe
                      title={hospital.name}
                      src={`https://maps.google.com/maps?q=${encodeURIComponent(
                        hospital.name + " " + hospital.area
                      )}&t=&z=13&ie=UTF8&iwloc=&output=embed`}
                      className="hospital-map"
                      loading="lazy"
                    ></iframe>

                  </a>
                );
              })

            ) : (

              <h3 className="text-center mt-5">

                No Nearby Hospitals Found

              </h3>
            )}

          </div>

        </section>

      )}

    </div>
  );
}

export default Home;