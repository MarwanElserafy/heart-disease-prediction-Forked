import React, { useState } from "react";

import axios from "axios";

import "../Pages/The_General_Home_Page.css";
import "../fontawesome-free-7.0.0-web/css/all.min.css";
import "../Pages/Profile.css";

import profile from "../Image/prof.png";

const Home = () => {

  // ================= GET USER =================
  const savedUser = JSON.parse(
    localStorage.getItem("user")
  );

  // ================= STATES =================
  const [isEditing, setIsEditing] =
    useState(false);

  const [editData, setEditData] =
    useState({
      username:
        savedUser?.username || "",

      password: "",
    });

  // ================= HANDLE CHANGE =================
  const handleChange = (e) => {

    const { name, value } = e.target;

    setEditData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // ================= HANDLE SAVE =================
  const handleSave = async () => {

    try {

      const token =
        localStorage.getItem("token");

      await axios.put(
        `http://localhost:5000/api/users/${savedUser.id}`,
        {
          username:
            editData.username,

          password:
            editData.password,
        },
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      // ================= UPDATE LOCAL STORAGE =================
      const updatedUser = {
        ...savedUser,
        username:
          editData.username,
      };

      localStorage.setItem(
        "user",
        JSON.stringify(updatedUser)
      );

      alert(
        "Profile Updated Successfully"
      );

      setIsEditing(false);

    } catch (err) {

      console.log(err);

      alert(
        err.response?.data?.message ||
        "Update Failed"
      );
    }
  };

  return (

    <div className="profile-page">

      {/* ================= PROFILE CARD ================= */}
      <div className="profile-container justify-content-center m-auto">

        <h2 className="title">
          My Profile
        </h2>

        <div className="card-box">

          {/* ================= USER INFO ================= */}
          <div className="user-info d-flex justify-content-between align-items-center">

            <div className="d-flex align-items-center gap-3">

              <img
                src={profile}
                className="prof"
                alt="profile"
              />

              <div>

                <h4>
                  {editData.username ||
                    "No Username"}
                </h4>

                <div className="icons">

                  <span className="heart">
                    ❤
                  </span>

                  <span className="plus">
                    #
                  </span>

                </div>

              </div>

            </div>

            <button
              className="edit-btn"
              onClick={() => {

                if (isEditing) {

                  handleSave();

                } else {

                  setIsEditing(true);
                }
              }}
            >

              {
                isEditing
                  ? "Save"
                  : "Edit User Profile"
              }

            </button>

          </div>

          {/* ================= INFO LIST ================= */}
          <div className="info-list">

            {/* ================= NATIONAL ID ================= */}
            <div className="info-item">

              <div>

                <p>
                  National Id
                </p>

                <span>
                  {savedUser?.national_id ||
                    "No National ID"}
                </span>

              </div>

            </div>

            {/* ================= USERNAME ================= */}
            <div className="info-item">

              <div>

                <p>
                  Username
                </p>

                {
                  isEditing ? (

                    <input
                      type="text"
                      name="username"
                      value={editData.username}
                      onChange={handleChange}
                    />

                  ) : (

                    <span>
                      {editData.username}
                    </span>

                  )
                }

              </div>

            </div>

            {/* ================= PASSWORD ================= */}
            <div className="info-item">

              <div>

                <p>
                  Password
                </p>

                {
                  isEditing ? (

                    <input
                      type="password"
                      name="password"
                      placeholder="Enter New Password"
                      value={editData.password}
                      onChange={handleChange}
                    />

                  ) : (

                    <span>
                      ************
                    </span>

                  )
                }

              </div>

            </div>

            {/* ================= EMAIL ================= */}
            <div className="info-item">

              <div>

                <p>
                  Email
                </p>

                <span>
                  {savedUser?.email ||
                    "No Email"}
                </span>

              </div>

            </div>

          </div>

        </div>

      </div>

    </div>
  );
};

export default Home;