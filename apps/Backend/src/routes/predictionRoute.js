const express = require("express");
const { authenticate } = require("../middlewares/auth");
const { startPrediction, getShap, getReport } = require("../controllers/predictionController");

const router = express.Router();

router.use(authenticate);

router.post("/start", startPrediction);
router.get("/:id/shap", getShap);
router.get("/:id/report", getReport);

module.exports = router;
