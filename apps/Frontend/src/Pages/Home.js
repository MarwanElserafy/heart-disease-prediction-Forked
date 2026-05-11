import React from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import "../Pages/Home.css";

export default function Home() {

  return (
    <div className="page">

      <div className="main container-fluid p-0">

        <div className="content">

          {/* ================= TEXT ================= */}

          <div className="text">

            <h2>
              Heart Disease Prediction Tool
            </h2>

            <p>
              Advanced AI-Powered Analysis <br />

              To Assess Your Heart Health <br />

              Risk Factors
            </p>

          </div>

          {/* ================= CORNER ================= */}

         <div className="corner">

  {/* WHITE SHAPE */}
  <svg
    className="corner-svg"
    viewBox="0 0 360 230"
    preserveAspectRatio="none"
  >
   <path
  d="
  M0 70

  C0 30 30 0 80 0

  L320 0
  L320 210

  L0 210

  L0 120

  C0 90 18 70 45 70

  C75 70 95 50 95 20

  C95 8 105 0 120 0

  L140 0

  C118 0 105 15 105 35

  C105 62 82 85 50 85

  C20 85 0 100 0 130

  Z
  "
  fill="white"
/>
  </svg>

  {/* BLUE BOX */}
  <div className="info-box">

    <p>Your Heart Is Your Life</p>

    <button className="know-btn">
      Know More →
    </button>

  </div>

</div>

        </div>

      </div>

    </div>
  );
}