const express = require("express");
const { requireLabKey } = require("../middlewares/requireLabKey");
const {
  uploadLabTestsCsvs: uploadBulkMiddleware,
  uploadLabTestCsv: uploadSingleMiddleware,
} = require("../middlewares/uploadLabTestsCsvs");
const {
  uploadLabTestsCsvs,
  uploadLabTestCsv,
} = require("../controllers/labPortalController");

const router = express.Router();

router.use(requireLabKey);

router.post("/upload-csvs", uploadBulkMiddleware, uploadLabTestsCsvs);
router.post("/upload-csv", uploadSingleMiddleware, uploadLabTestCsv);

module.exports = router;
