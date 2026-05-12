import React, { useState, useEffect } from "react";
import axios from "axios";

import "./Prediction.css";

import { Link, useNavigate } from "react-router-dom";

import { BsGeoAltFill } from "react-icons/bs";
import { FaFileCsv } from "react-icons/fa";

const Prediction = () => {

  // ================= STATE =================
  const [result, setResult] = useState(null);

  const [loading, setLoading] = useState(false);

  const [csvFile, setCsvFile] = useState(null);

  const [labs, setLabs] = useState([]);

  // ================= USER LOCATION =================
  const [userLocation, setUserLocation] =
    useState(null);

  const navigate = useNavigate();

  // ================= GET LABS =================
  useEffect(() => {

    fetchLabs();

    // ================= GET USER LOCATION =================
    navigator.geolocation.getCurrentPosition(

      (position) => {

        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });

      },

      (error) => {

        console.log(error);

      }

    );

  }, []);

  // ================= FETCH LABS =================
  const fetchLabs = async () => {

    try {

      const res = await axios.get(
        "http://localhost:5000/api/labs"
      );

      console.log(
        "LABS => ",
        res.data
      );

      setLabs(res.data.data);

    } catch (err) {

      console.log(err);
    }
  };

  // ================= UPLOAD CSV =================
  const handleUploadCSV = async () => {

    if (!csvFile) {

      alert("Please choose CSV file");

      return;
    }

    try {

      const token = localStorage.getItem("token");

      const formData = new FormData();

      formData.append("file", csvFile);

      const res = await axios.post(
        "http://localhost:5000/api/labtests/upload-csv",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      console.log(
        "CSV Uploaded => ",
        res.data
      );

      alert("CSV Uploaded Successfully");

    } catch (err) {

      console.log(
        err.response?.data || err
      );

      alert(
        err.response?.data?.message ||
        "CSV Upload Failed"
      );
    }
  };

  // ================= START PREDICTION =================
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

      console.log(
        "FULL RESPONSE => ",
        res.data
      );

      // ================= GET DATA =================
      const predictionData = res.data.data;

      console.log(
        "PREDICTION DATA => ",
        predictionData
      );

      // ================= SAVE =================
      localStorage.setItem(
        "prediction",
        JSON.stringify(predictionData)
      );

      setResult(predictionData);

      // ================= NAVIGATE =================
      if (predictionData.probability < 70) {

        navigate("/have-no-risk");

      } else {

        navigate("/have-risk");
      }

    } catch (err) {

      console.log(err);

      alert(
        err.response?.data?.message ||
        "Prediction Failed"
      );

    } finally {

      setLoading(false);
    }
  };

  // ================= LOADING =================
  if (loading) {

    return (

      <div className="prediction-page">

        <div className="prediction-card">

          <h2>
            Loading Prediction...
          </h2>

        </div>

      </div>
    );
  }

  // ================= UI =================
  return (

    <div className="prediction-page">

      <div className="prediction-card">

        <h1>
          Heart Disease Prediction Tool
        </h1>

        <p className="subtitle">

          Advanced AI Powered Analysis To Assess

          <br />

          <span>
            Your Heart Health Risk Factors
          </span>

        </p>

        {/* ================= CSV SECTION ================= */}
        <div className="upload-section">

          <div className="custom-file-upload">

            <label
              htmlFor="csvUpload"
              className="file-label"
            >

              <FaFileCsv className="csv-icon" />

              <span>

                {csvFile
                  ? csvFile.name
                  : "Choose CSV File"}

              </span>

            </label>

            <input
              id="csvUpload"
              type="file"
              accept=".csv"
              onChange={(e) =>
                setCsvFile(e.target.files[0])
              }
            />

          </div>

          <button
            onClick={handleUploadCSV}
            className="btn upload-btn"
          >

            Upload CSV

          </button>

        </div>

        {/* ================= BUTTONS ================= */}
        <div className="prediction-buttons">

          <button
            onClick={handleStartPrediction}
            className="btn custom-btn px-4 py-2 rounded-pill me-3"
          >

            Start Prediction →

          </button>

          <Link
            to="/learnmore"
            className="btn learn btn-outline-dark rounded-pill"
          >

            Learn More →

          </Link>

        </div>

        {/* ================= REPORT ================= */}
        <p className="report-title">

          The Percentage That You Have Heart Diseases Or Not

          <br />

          <span className="highlight">

            if the percentage is higher than 70%
            it means you have Heart Diseases

          </span>

        </p>

        <div className="report-box">

          <h4>

            {result?.probability
              ? `${result.probability}%`
              : "You Don't Have Data"}

          </h4>

          <span>

            {result
              ? "Prediction Completed Successfully"
              : "Or The Lab Doesn't Finish The Report File"}

          </span>

        </div>

        <p className="info-text">

          You Should Go To Trusted Medical Labs
          So You Can Start Prediction

        </p>

        {/* ================= LABS SECTION ================= */}
        <div className="labs-section">

          <div className="labs-top">

            <div>

              <h3 className="labs-title">
                Trusted Medical Labs
              </h3>

              <p className="labs-sub">

                There Is Thousands Of Trusted Medical Labs

              </p>

            </div>

          </div>

          {/* ================= DYNAMIC LABS ================= */}
          <div className="labs-wrapper">

            {labs.map((lab) => (

              <a
                key={lab.id}

                href={
                  userLocation
                    ? `https://www.google.com/maps/dir/${userLocation.lat},${userLocation.lng}/${encodeURIComponent(lab.address)}`
                    : `https://www.google.com/maps/search/${encodeURIComponent(lab.address)}`
                }

                target="_blank"
                rel="noopener noreferrer"
                className="lab-card"
              >

                <div className="lab-content">

                  <div className="lab-title-row">

                    <h4>
                      {lab.name}
                    </h4>

                    <span className="rating-badge">
                      Lab
                    </span>

                  </div>

                  <div className="lab-info">

                    <p>

                      <BsGeoAltFill />

                      {lab.address}

                    </p>

                   

                  </div>

                </div>

              </a>

            ))}

          </div>

        </div>

      </div>

    </div>
  );
};

export default Prediction;