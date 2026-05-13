/**
 * Internal AI service client (FastAPI).
 * Injects X-INTERNAL-API-KEY on every request — never call from browser code.
 */

const axios = require("axios");
const { logger } = require("../utils/logger");

const baseURL = process.env.AI_SERVICE_URL || "http://127.0.0.1:8000";
const internalKey = process.env.INTERNAL_API_KEY || "";

const aiClient = axios.create({
  baseURL,
  timeout: Number(process.env.AI_REQUEST_TIMEOUT_MS) || 120000,
  headers: {
    "Content-Type": "application/json",
  },
  validateStatus: () => true,
});

aiClient.interceptors.request.use((config) => {
  if (!internalKey) {
    throw new Error("INTERNAL_API_KEY is not set on the Node gateway");
  }
  config.headers["X-INTERNAL-API-KEY"] = internalKey;
  config.metadata = { start: Date.now() };
  return config;
});

aiClient.interceptors.response.use(
  (response) => {
    const ms = Date.now() - (response.config.metadata?.start || Date.now());
    logger.info("ai_service_response", {
      event: "ai_service_response",
      method: response.config.method,
      path: response.config.url,
      status: response.status,
      duration_ms: ms,
    });
    return response;
  },
  (error) => {
    const cfg = error.config || {};
    const ms = Date.now() - (cfg.metadata?.start || Date.now());
    logger.error("ai_service_error", {
      event: "ai_service_error",
      method: cfg.method,
      path: cfg.url,
      message: error.message,
      duration_ms: ms,
    });
    return Promise.reject(error);
  }
);

function parseErrorPayload(data) {
  if (data == null) return null;
  if (Buffer.isBuffer(data)) {
    try {
      const j = JSON.parse(data.toString("utf8"));
      return j.message || j.detail || j.error || null;
    } catch {
      return data.toString("utf8").slice(0, 300);
    }
  }
  if (typeof data === "object") {
    return data.message || data.detail || data.error || null;
  }
  return String(data);
}

function assertOk(response, context) {
  if (response.status === 401) {
    const err = new Error("Unauthorized");
    err.statusCode = 502;
    throw err;
  }
  if (response.status >= 400) {
    const detail = parseErrorPayload(response.data) || response.statusText;
    const err = new Error(`${context} failed: ${detail}`);
    err.statusCode = response.status >= 500 ? 502 : response.status;
    throw err;
  }
}

async function internalPredict(labTestId, userId) {
  const res = await aiClient.post("/internal/predict", {
    target_id: labTestId,
    user_id: userId,
  });
  assertOk(res, "internal predict");
  return res.data;
}

async function internalShapPng(labTestId) {
  const res = await aiClient.post(
    "/internal/shap",
    { target_id: labTestId, user_id: null },
    { responseType: "arraybuffer" }
  );
  assertOk(res, "internal shap");
  return Buffer.from(res.data);
}

async function internalReportPdf(labTestId) {
  const res = await aiClient.post(
    "/internal/report",
    { target_id: labTestId, user_id: null },
    { responseType: "arraybuffer" }
  );
  assertOk(res, "internal report");
  return Buffer.from(res.data);
}

module.exports = {
  aiClient,
  internalPredict,
  internalShapPng,
  internalReportPdf,
};
