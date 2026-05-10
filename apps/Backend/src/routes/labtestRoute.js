const express = require("express");
const { validate } = require("../middlewares/validate");
const { labTestCreateSchema, labTestUpdateSchema } = require("../validators/labtest.schema");
const { authenticate } = require("../middlewares/auth");
const { uploadLabTestsCsvs: uploadMiddleware, uploadLabTestCsv: uploadSingleMiddleware } = require("../middlewares/uploadLabTestsCsvs");
const {
  createLabTest,
  uploadLabTestsCsvs,
  uploadLabTestCsvForUser,
  getLabTests,
  getLabTestById,
  getLabTestsByNationalId,
  getLatestLabTestByNationalId,
  getLabTestStatusByNationalId,
  getMyLabTestStatus,
  getLabTestsByLabId,
  updateLabTest,
  deleteLabTest,
} = require("../controllers/labtestController");

const router = express.Router();

router.post("/", authenticate, validate(labTestCreateSchema), createLabTest);
router.post("/upload-csvs", authenticate, uploadMiddleware, uploadLabTestsCsvs);
router.post("/upload-csv", authenticate, uploadSingleMiddleware, uploadLabTestCsvForUser);
router.get("/", getLabTests);
router.get("/me/status", authenticate, getMyLabTestStatus);
// Static path prefixes before /:id so "patient" / "lab" are not treated as ids
router.get("/patient/:national_id/status", getLabTestStatusByNationalId);
router.get("/patient/:national_id/latest", getLatestLabTestByNationalId);
router.get("/patient/:national_id", getLabTestsByNationalId);
router.get("/lab/:lab_id", getLabTestsByLabId);
router.get("/:id", getLabTestById);
router.put("/:id", authenticate, validate(labTestUpdateSchema), updateLabTest);
router.delete("/:id", authenticate, deleteLabTest);

module.exports = router;
