# Heart Disease Prediction — Frontend API Guide

Welcome! This guide is designed to help frontend developers (React, Vue, HTML/JS) connect to the Heart Disease Prediction Backend. We have kept things simple and straightforward.

**Base URL:** `http://localhost:5000` (Use this when running the project locally on your machine).

> **Beginner Tip:** You only need to talk to the Node.js server running on port `5000`. The Node.js server will handle talking to the AI model behind the scenes. Never try to call the Python AI server (port `8000`) directly from your frontend code.

---

## 1. The Big Picture (How the app works)

Here is the exact journey a user takes in your frontend app, and the APIs you need to call at each step:

1. **Create an Account / Login:** The user registers or logs in. The backend gives you a "Token" (like a digital ID card).
2. **Check Lab Tests:** You ask the backend, "Does this user have any lab tests uploaded?"
3. **Upload Data:** If they don't have tests, you let them upload a CSV file with their medical data.
4. **Predict Risk:** You tell the backend to run the AI prediction on their latest data.
5. **Show Results:** 
   - If the risk is **Low**, you just show them a happy message.
   - If the risk is **High**, you show them the AI Explanation Image (SHAP), a downloadable PDF Medical Report, and a list of nearby hospitals.

---

## 2. Authentication (Logging In)

Most of our APIs require the user to be logged in. When a user logs in, the backend sends back a `token`. You must send this token in the **Headers** of almost every request you make.

**How to send the token in JavaScript (Fetch API example):**
```javascript
fetch('http://localhost:5000/api/some-endpoint', {
  method: 'GET',
  headers: {
    'Authorization': 'Bearer YOUR_TOKEN_HERE',
    'Content-Type': 'application/json'
  }
})
```

### Register a New User
- **Endpoint:** `POST /api/auth/register`
- **What to send (Body):** `national_id` (14 digits), `username`, `email`, `password` (min 6 chars).
- **What you get back:** User info and the `token`. Save this token!

### Login an Existing User
- **Endpoint:** `POST /api/auth/login`
- **What to send (Body):** `username`, `password`.
- **What you get back:** User info and the `token`.

---

## 3. The Core Journey (Labs & Predictions)

Make sure you include the `Authorization: Bearer <token>` header for all these requests!

### Step A: Check if the user has data
- **Endpoint:** `GET /api/labtests/me/status`
- **Why use this?** To know if you should show the "Upload Data" screen or the "Start Prediction" screen.
- **What you get back:** A boolean `hasLabTests`. If it's `false`, ask them to upload data.

### Step B: Upload Medical Data (CSV)
- **Endpoint:** `POST /api/labtests/upload-csv`
- **How to send:** Use `FormData` in JavaScript. Append the file under the key `file`.
- **Note:** The `national_id` inside the CSV must match the logged-in user's ID.

### Step C: Start the AI Prediction
- **Endpoint:** `POST /api/predictions/start`
- **Why use this?** This tells the AI to look at the user's latest lab test and calculate their heart disease risk.
- **What you get back:**
  ```json
  {
    "success": true,
    "data": {
      "prediction_id": "some-unique-id",
      "decision": "high", 
      "probability": 72.5,
      "show_shap": true,
      "show_report": true,
      "show_hospitals": true
    }
  }
  ```
> **Beginner Tip:** Save the `prediction_id`! You will need it in the next step to get the images and reports. Also, if `decision` is "low", the `show_shap`, `show_report`, and `show_hospitals` will all be `false` (so you don't show the hospital section either).

### Step D: Get AI Explanations & Reports (High Risk Only)
If the prediction from Step C says `show_shap` is `true`, you can fetch these files.

**1. Get the AI Explanation Image (SHAP)**
- **Endpoint:** `GET /api/predictions/:id/shap` (Replace `:id` with the `prediction_id`)
- **What you get back:** An actual PNG image file.
- **How to use it in HTML:** You can't just put this URL in an `<img src="...">` directly because it needs the Authorization header. You have to fetch it as a "blob" in JavaScript, create an object URL, and then put that in the image tag.
- **Error 400:** If you try to call this for a "Low Risk" patient, the server will block it and return a 400 error.

**2. Get the PDF Medical Report**
- **Endpoint:** `GET /api/predictions/:id/report`
- **What you get back:** A downloadable PDF file. 
- **Error 400:** Just like the image, this is blocked for "Low Risk" patients.

---

## 4. Hospitals (Where to go)

If the user is High Risk, you might want to show them nearby hospitals.

### Get a list of hospitals
- **Endpoint:** `GET /api/hospitals`
- **What you get back:** A list of hospitals with their names, areas, and Google Maps links.

### Search hospitals by city/area
- **Endpoint:** `GET /api/hospitals/area/:area`
- **Example:** `GET /api/hospitals/area/Cairo`

---

## 5. Understanding Responses & Errors

When you call our API, we always try to reply in a predictable way so your frontend code is easy to write.

**A Successful Request looks like this:**
```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": { ... } 
}
```

**A Failed Request looks like this:**
```json
{
  "success": false,
  "message": "Something went wrong",
  "errors": [ ... ]
}
```

**Common Status Codes you will see:**
- `200` or `201`: Success! Everything worked.
- `400`: Bad Request (You might have sent missing data, or asked for a PDF for a low-risk patient).
- `401`: Unauthorized (Your token is missing, expired, or wrong. Time to log the user out!).
- `404`: Not Found (The data doesn't exist).
- `500` or `502`: Server Error (Something broke on our end or the AI's end).

---

## 6. Security Rules for Frontend Developers

1. **Never put Admin Keys in your frontend code.** If you see `ADMIN_API_KEY` or `INTERNAL_API_KEY` mentioned anywhere, those belong on the server, not in React/Vue.
2. **Keep the Token Safe.** Store the JWT token securely.
3. **Handle Errors Gracefully.** If the AI takes too long or fails (502 error), show a nice "Please try again later" message to the user instead of a blank screen.