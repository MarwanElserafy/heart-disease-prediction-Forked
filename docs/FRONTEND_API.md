# Heart Disease Prediction — Backend API (Frontend Integration)

This document describes the **Node.js API** the frontend must use.  
**Do not call the Python/FastAI service (port `8000`) from the browser** — ML, SHAP, and PDF reports are only reachable through these gateway routes.

**Default base URL (local):** `http://localhost:5000`  
(Production: replace with your deployed API origin.)

---

## 1. Conventions

### 1.1 Authentication (JWT)

Most user-facing write operations and predictions require a **Bearer token** from login/register.

```http
Authorization: Bearer <token>
```

- Token payload includes `userId` (server-side user id / CUID).
- Expiry is configured on the server (`JWT_EXPIRE`, often `30d`).
- **401** if missing, invalid, or expired.

### 1.2 Admin key (hospitals only)

Creating/updating/deleting **hospitals** requires:

```http
x-admin-key: <ADMIN_API_KEY>
```

Value must match `ADMIN_API_KEY` in the backend `.env`. Use only for trusted admin/seed tools — **not** in public frontend builds.

### 1.3 Success response (typical)

```json
{
  "success": true,
  "message": "…",
  "data": { }
}
```

Lists often include pagination:

```json
{
  "success": true,
  "data": [ ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10
  }
}
```

### 1.4 Error response (typical)

```json
{
  "success": false,
  "message": "Human readable message",
  "errors": [ ]
}
```

In **development**, `errors` may include stack traces. In production, `errors` is usually empty.

### 1.5 Validation errors (Zod)

Status **400**:

```json
{
  "success": false,
  "error": "Validation failed",
  "details": [
    { "field": "body.email", "message": "…" }
  ]
}
```

### 1.6 Rate limiting

All routes under `/api` are rate-limited (default **300 requests / 15 minutes** per IP). On limit, expect **429** (per `express-rate-limit`).

### 1.7 CORS

Backend uses `cors` with `credentials: true`. Set `CORS_ORIGIN` on the server to your frontend origin in production.

---

## 2. Auth

### `POST /api/auth/register`

**Body (JSON):**

| Field | Type | Rules |
|--------|------|--------|
| `national_id` | string | Exactly **14** digits |
| `username` | string | 2–50 chars |
| `email` | string | Valid email |
| `password` | string | Min **6** chars |

**201 example:**

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "id": "clx…",
    "national_id": "29501010001001",
    "username": "ahmed",
    "email": "ahmed@example.com",
    "createdAt": "…",
    "updatedAt": "…"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9…"
}
```

Store `token` (e.g. memory + `httpOnly` cookie pattern, or `localStorage` for coursework — know the XSS tradeoff).

---

### `POST /api/auth/login`

**Body (JSON):**

| Field | Type |
|--------|------|
| `username` | string |
| `password` | string |

**200 example:** Same shape as register: `success`, `message`, `data` (user without password), `token`.

**401:** Invalid credentials.

---

## 3. Predictions (gateway — primary ML flow)

All routes require **`Authorization: Bearer <token>`**.

The server picks the **latest lab test** for the logged-in user’s `national_id`, runs the internal AI pipeline, and returns a **`prediction_id`** for follow-up assets.

### `POST /api/predictions/start`

**Body:** optional `{}` (no fields required).

**201 example:**

```json
{
  "success": true,
  "message": "Prediction completed successfully",
  "data": {
    "prediction_id": "uuid-or-cuid",
    "lab_test_id": "…",
    "decision": "high",
    "probability": 72.5,
    "risk_level": "…",
    "risk_color": "…",
    "decision_label": "…",
    "show_shap": true,
    "show_report": true,
    "show_hospitals": true
  }
}
```

For **low** risk, `show_shap`, `show_report`, and `show_hospitals` are typically **`false`** — UI can hide those sections.

**404:** No lab test exists for this user’s national ID.

**502 / 5xx:** AI service or internal error — show a generic error; details may be in `message`.

---

### `GET /api/predictions/:id/shap`

- **`:id`** = `prediction_id` from `POST /api/predictions/start`.
- **Response:** raw **PNG** (`Content-Type: image/png`).
- **403:** Prediction belongs to another user.
- **404:** Prediction not found.

---

### `GET /api/predictions/:id/report`

- **`:id`** = `prediction_id`.
- **Response:** **PDF** download (`Content-Type: application/pdf`).
- **403 / 404:** Same as SHAP.

---

## 4. Lab tests

### `POST /api/labtests`

**Auth:** required.

**Body (JSON):**

```json
{
  "lab_id": "<lab CUID>",
  "national_id": "29501010001001",
  "features": {
    "age": 55,
    "sex": 1,
    "chest_pain_type": 2,
    "resting_bp_s": 140,
    "cholesterol": 250,
    "fasting_blood_sugar": 0,
    "resting_ecg": 1,
    "max_heart_rate": 150,
    "exercise_angina": 0,
    "oldpeak": 1.5,
    "st_slope": 1
  }
}
```

Feature constraints match Zod in `validators/labtest.schema.js` (ranges for age, BP, cholesterol, etc.).

**201:** `{ "success": true, "data": { …, "features": { … }, "lab": { … } } }`

---

### `POST /api/labtests/upload-csv`

**Auth:** required.

**Content-Type:** `multipart/form-data`

| Field | Type | Notes |
|--------|------|--------|
| `file` | file | One `.csv` (preferred key) |
| `files` | file | Alternative single file key |

CSV must contain **one data row** with columns including:  
`lab_id`, `national_id`, `lab_code`, and all feature columns (see bulk upload comment in backend).  
**`national_id` in the CSV must match** the logged-in user’s national ID.

**201 example:**

```json
{
  "success": true,
  "message": "Lab test CSV processed for current user",
  "created": {
    "id": "…",
    "national_id": "…",
    "lab_id": "…",
    "lab_code": "…",
    "file": { "originalname": "…" },
    "data": { … }
  }
}
```

---

### `POST /api/labtests/upload-csvs`

**Auth:** required.

**multipart/form-data:** field **`files`**, **1–5** CSV files (max 10 MB each).

Each file = one row, one patient. Used for batch/admin workflows.

**201:** `created`, `failures`, `createdCount`, etc.

---

### `GET /api/labtests`

**Auth:** not required (public list).

**Query:** `page`, `limit` (defaults: page 1, limit 10, max 100).

---

### `GET /api/labtests/me/status`

**Auth:** required.

**200 example:**

```json
{
  "success": true,
  "data": {
    "national_id": "29501010001001",
    "labTestsCount": 1,
    "hasLabTests": true,
    "recommendation": "labtests"
  }
}
```

If `hasLabTests` is `false`, `recommendation` is `"labs"` — UI can prompt user to pick a lab / upload flow.

---

### `GET /api/labtests/patient/:national_id`

All lab tests for a national ID (newest ordering in list implementation).

---

### `GET /api/labtests/patient/:national_id/latest`

Latest single lab test or **404**.

---

### `GET /api/labtests/patient/:national_id/status`

Count / `hasLabTests` for that national ID (no auth).

---

### `GET /api/labtests/lab/:lab_id`

All tests for a given lab.

---

### `GET /api/labtests/:id`

Single lab test by id.

---

### `PUT /api/labtests/:id` / `DELETE /api/labtests/:id`

**Auth:** required. Body for PUT uses optional `lab_id`, `national_id`, `features` (partial allowed).

---

## 5. Labs

### `POST /api/labs`

**Auth:** required.  
**Body:** `{ "name", "lab_code", "address" }`

### `GET /api/labs`

**Query:** `page`, `limit`.

### `GET /api/labs/:id`

### `PUT /api/labs/:id` / `DELETE /api/labs/:id`

**Auth:** required.

---

## 6. Hospitals

### `GET /api/hospitals`

**Query:** `page`, `limit`.

### `GET /api/hospitals/area/:area`

Case-insensitive **contains** match on `area` (define this path **before** `/:id` on the server).

Example: `GET /api/hospitals/area/Cairo`

### `GET /api/hospitals/:id`

### `POST /api/hospitals`

**Auth:** Bearer **+** `x-admin-key`.

**Body:** `{ "name", "area", "google_maps_link" }` (URL must be valid).

### `PUT /api/hospitals/:id` / `DELETE /api/hospitals/:id`

**Auth:** Bearer **+** `x-admin-key`.

---

## 7. Users (CRUD)

All require **Bearer** token.

| Method | Path | Notes |
|--------|------|--------|
| `POST` | `/api/users` | Same body rules as register (national_id, username, email, password) |
| `GET` | `/api/users` | `page`, `limit` query |
| `GET` | `/api/users/:id` | |
| `PUT` | `/api/users/:id` | Optional username, email, password |
| `DELETE` | `/api/users/:id` | |

---

## 8. Recommended frontend flow

1. **Register** or **Login** → store `token`.
2. **`GET /api/labtests/me/status`** → if no tests, show labs / upload UX.
3. **`POST /api/labtests/upload-csv`** (or create via JSON) so `national_id` matches the user.
4. **`POST /api/predictions/start`** → read `data.prediction_id`, `decision`, `probability`, flags.
5. If `show_shap` / `show_report`:  
   - `GET /api/predictions/<prediction_id>/shap` (show as image)  
   - `GET /api/predictions/<prediction_id>/report` (open/download PDF)
6. If high risk: **`GET /api/hospitals`** or **`GET /api/hospitals/area/<city>`** for nearby hospitals.

---

## 9. Security checklist for frontend

- Never expose **`INTERNAL_API_KEY`** or **`ADMIN_API_KEY`** in frontend code.
- Never call **`http://127.0.0.1:8000`** (FastAPI) from the client for predict/SHAP/report.
- Send JWT only over **HTTPS** in production.
- Treat **`prediction_id`** as sensitive; always use with the user’s own session.

---

## 10. Quick reference

| Area | Base path |
|------|-----------|
| Auth | `/api/auth` |
| Users | `/api/users` |
| Labs | `/api/labs` |
| Lab tests | `/api/labtests` |
| Hospitals | `/api/hospitals` |
| Predictions | `/api/predictions` |

---

*Generated for frontend integration. Backend version aligns with Express routes under `apps/Backend/src/routes/`.*
