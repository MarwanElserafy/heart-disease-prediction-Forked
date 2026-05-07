const express = require("express");
const { validate } = require("../middlewares/validate");
const { labTestCreateSchema, labTestUpdateSchema } = require("../validators/labtest.schema");
const { authenticate } = require("../middlewares/auth");
const {
  createLabTest,
  getLabTests,
  getLabTestById,
  getLabTestsByNationalId,
  getLatestLabTestByNationalId,
  getLabTestsByLabId,
  updateLabTest,
  deleteLabTest,
} = require("../controllers/labtestController");

const router = express.Router();

router.post("/", authenticate, validate(labTestCreateSchema), createLabTest);
router.get("/", getLabTests);
router.get("/:id", getLabTestById);
router.get("/patient/:national_id", getLabTestsByNationalId);
router.get("/patient/:national_id/latest", getLatestLabTestByNationalId);
router.get("/lab/:lab_id", getLabTestsByLabId);
router.put("/:id", authenticate, validate(labTestUpdateSchema), updateLabTest);
router.delete("/:id", authenticate, deleteLabTest);

module.exports = router;
