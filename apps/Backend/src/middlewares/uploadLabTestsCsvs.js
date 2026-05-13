const path = require("path");
const multer = require("multer");

const storage = multer.memoryStorage();

const csvOnly = (req, file, cb) => {
  const ext = path.extname(file.originalname || "").toLowerCase();
  const mimetype = String(file.mimetype || "").toLowerCase();
  const isCsv = ext === ".csv" || mimetype.includes("csv") || mimetype === "application/vnd.ms-excel";
  if (!isCsv) return cb(new Error("Only .csv files are allowed"));
  cb(null, true);
};

// Expect exactly 5 CSV files uploaded as: form-data key = files (multiple)
const uploadLabTestsCsvs = multer({
  storage,
  fileFilter: csvOnly,
  limits: {
    files: 5,
    fileSize: 10 * 1024 * 1024, // 10MB per CSV
  },
}).array("files", 5);

// Single CSV upload: accept key = file OR files (to be forgiving in Postman)
const uploadLabTestCsv = multer({
  storage,
  fileFilter: csvOnly,
  limits: {
    files: 1,
    fileSize: 10 * 1024 * 1024,
  },
}).fields([
  { name: "file", maxCount: 1 },
  { name: "files", maxCount: 1 },
]);

module.exports = { uploadLabTestsCsvs, uploadLabTestCsv };

