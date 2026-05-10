const prisma = require("../config/prisma");
const { handlePrismaError } = require("../middlewares/prismaErrors");
const fs = require("fs/promises");
const path = require("path");
const { parse } = require("csv-parse/sync");

// Helper: flatten features object into top-level Prisma fields
const flattenFeatures = (body) => {
  const { features, ...rest } = body;
  return { ...rest, ...(features || {}) };
};

// Helper: nest flat Prisma fields back into features object for response
const shapeLabTest = (labTest) => {
  if (!labTest) return null;
  const {
    age, sex, chest_pain_type, resting_bp_s, cholesterol,
    fasting_blood_sugar, resting_ecg, max_heart_rate,
    exercise_angina, oldpeak, st_slope, ...rest
  } = labTest;
  return {
    ...rest,
    features: {
      age, sex, chest_pain_type, resting_bp_s, cholesterol,
      fasting_blood_sugar, resting_ecg, max_heart_rate,
      exercise_angina, oldpeak, st_slope,
    },
  };
};

const labTestInclude = { lab: true };

const normalizeLabCode = (labCode) => String(labCode || "").trim();

const isAllowedLabCode = (labCode) => {
  const v = normalizeLabCode(labCode).toLowerCase();
  return v.includes("al borg") || v.includes("al mokhtabar");
};

const parseSingleRowCsv = (csvText) => {
  const records = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
  });
  if (!records || records.length === 0) {
    throw new Error("CSV contains no data rows");
  }
  return records[0];
};

const rowToLabTestData = async ({ row, file, enforceNationalId, reqUser }) => {
  const lab_id = String(row.lab_id || "").trim();
  const national_id = String(row.national_id || enforceNationalId || "").trim();
  const lab_code = normalizeLabCode(row.lab_code);

  if (!lab_id || !national_id || !lab_code) {
    throw new Error("CSV row must include lab_id, national_id, lab_code");
  }
  if (!/^\d{14}$/.test(national_id)) {
    throw new Error("national_id must be exactly 14 digits");
  }

  if (reqUser?.national_id && enforceNationalId) {
    if (national_id !== String(reqUser.national_id)) {
      throw new Error("CSV national_id must match the logged-in user national_id");
    }
  }

  if (!isAllowedLabCode(lab_code)) {
    throw new Error("lab_code must belong to AL Borg Labs or AL Mokhtabar labs only");
  }

  const lab = await prisma.lab.findUnique({ where: { id: lab_id } });
  if (!lab) throw new Error("lab_id does not exist");
  if (String(lab.lab_code).trim() !== lab_code) {
    throw new Error("lab_code does not match the lab_id in database");
  }

  const numeric = (k) => (row[k] === undefined || row[k] === null || row[k] === "" ? undefined : Number(row[k]));
  const intLike = (k) => (row[k] === undefined || row[k] === null || row[k] === "" ? undefined : parseInt(row[k], 10));

  const data = {
    lab_id,
    national_id,
    age: numeric("age"),
    sex: intLike("sex"),
    chest_pain_type: intLike("chest_pain_type"),
    resting_bp_s: numeric("resting_bp_s"),
    cholesterol: numeric("cholesterol"),
    fasting_blood_sugar: intLike("fasting_blood_sugar"),
    resting_ecg: intLike("resting_ecg"),
    max_heart_rate: numeric("max_heart_rate"),
    exercise_angina: intLike("exercise_angina"),
    oldpeak: numeric("oldpeak"),
    st_slope: intLike("st_slope"),
  };

  const requiredKeys = [
    "age",
    "sex",
    "chest_pain_type",
    "resting_bp_s",
    "cholesterol",
    "fasting_blood_sugar",
    "resting_ecg",
    "max_heart_rate",
    "exercise_angina",
    "oldpeak",
    "st_slope",
  ];
  for (const k of requiredKeys) {
    if (data[k] === undefined || Number.isNaN(data[k])) {
      throw new Error(`Missing/invalid column: ${k}`);
    }
  }

  const labTest = await prisma.labTest.create({
    data,
    include: labTestInclude,
  });

  return {
    id: labTest.id,
    national_id,
    lab_id,
    lab_code,
    file: {
      originalname: file?.originalname,
    },
    data: shapeLabTest(labTest),
  };
};

const createLabTest = async (req, res, next) => {
  try {
    const data = flattenFeatures(req.body);
    const labTest = await prisma.labTest.create({
      data,
      include: labTestInclude,
    });
    res.status(201).json({ success: true, data: shapeLabTest(labTest) });
  } catch (err) {
    if (handlePrismaError(err, res)) return;
    next(err);
  }
};

// Upload 5 CSV files (form-data key: files) and create 5 LabTest rows (1 per file).
// Each CSV must contain ONE data row with at least:
// lab_id, national_id, lab_code, age, sex, chest_pain_type, resting_bp_s, cholesterol,
// fasting_blood_sugar, resting_ecg, max_heart_rate, exercise_angina, oldpeak, st_slope
const uploadLabTestsCsvs = async (req, res, next) => {
  try {
    const files = Array.isArray(req.files) ? req.files : [];
    if (files.length < 1 || files.length > 5) {
      return res.status(400).json({
        success: false,
        message: "Upload between 1 and 5 CSV files (form-data key: files)",
      });
    }

    const created = [];
    const failures = [];
    const seenNationalIds = new Set();

    for (const file of files) {
      try {
        const csvText = file.buffer.toString("utf8");
        const row = parseSingleRowCsv(csvText);
        const national_id = String(row.national_id || "").trim();
        if (seenNationalIds.has(national_id)) {
          throw new Error("Duplicate national_id across uploaded CSVs (each user must have 1 CSV)");
        }
        const createdOne = await rowToLabTestData({ row, file, enforceNationalId: null, reqUser: null });
        seenNationalIds.add(createdOne.national_id);
        created.push(createdOne);
      } catch (e) {
        failures.push({
          file: file?.originalname,
          error: e?.message || String(e),
        });
      }
    }

    if (created.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No lab tests created from uploaded CSV files",
        failures,
      });
    }

    res.status(201).json({
      success: true,
      message: "Lab test CSV files processed",
      createdCount: created.length,
      failuresCount: failures.length,
      created,
      failures,
    });
  } catch (err) {
    next(err);
  }
};

// Upload ONE CSV for the LOGGED-IN user only (form-data key: file).
const uploadLabTestCsvForUser = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const fileFromFields =
      (req.files && Array.isArray(req.files.file) && req.files.file[0]) ||
      (req.files && Array.isArray(req.files.files) && req.files.files[0]) ||
      null;
    const file = req.file || fileFromFields;
    if (!file) {
      return res.status(400).json({
        success: false,
        message: "CSV file is required (form-data key: file)",
      });
    }

    const csvText = file.buffer.toString("utf8");
    const row = parseSingleRowCsv(csvText);

    // Must match logged-in user national_id to prevent mixing users.
    const createdOne = await rowToLabTestData({
      row,
      file,
      enforceNationalId: req.user.national_id,
      reqUser: req.user,
    });

    res.status(201).json({
      success: true,
      message: "Lab test CSV processed for current user",
      created: createdOne,
    });
  } catch (err) {
    next(err);
  }
};

const getLabTests = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const [total, labTests] = await Promise.all([
      prisma.labTest.count(),
      prisma.labTest.findMany({
        skip, take: limit,
        orderBy: { createdAt: "desc" },
        include: labTestInclude,
      }),
    ]);

    res.json({
      success: true,
      data: labTests.map(shapeLabTest),
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

const getLabTestById = async (req, res, next) => {
  try {
    const labTest = await prisma.labTest.findUnique({
      where: { id: req.params.id },
      include: labTestInclude,
    });
    if (!labTest) return res.status(404).json({ success: false, message: "Lab test not found" });
    res.json({ success: true, data: shapeLabTest(labTest) });
  } catch (err) {
    next(err);
  }
};

const getLabTestsByNationalId = async (req, res, next) => {
  try {
    const labTests = await prisma.labTest.findMany({
      where: { national_id: req.params.national_id },
      orderBy: { createdAt: "desc" },
      include: labTestInclude,
    });
    res.json({ success: true, data: labTests.map(shapeLabTest) });
  } catch (err) {
    next(err);
  }
};

const getLatestLabTestByNationalId = async (req, res, next) => {
  try {
    const labTest = await prisma.labTest.findFirst({
      where: { national_id: req.params.national_id },
      orderBy: { createdAt: "desc" },
      include: labTestInclude,
    });
    if (!labTest) return res.status(404).json({ success: false, message: "No lab tests found for this patient" });
    res.json({ success: true, data: shapeLabTest(labTest) });
  } catch (err) {
    next(err);
  }
};

// Helps frontend decide: if no lab tests, recommend showing Labs page.
const getLabTestStatusByNationalId = async (req, res, next) => {
  try {
    const national_id = req.params.national_id;
    const count = await prisma.labTest.count({ where: { national_id } });
    res.json({
      success: true,
      data: {
        national_id,
        labTestsCount: count,
        hasLabTests: count > 0,
        recommendation: count > 0 ? "labtests" : "labs",
      },
    });
  } catch (err) {
    next(err);
  }
};

// Same as status-by-national-id but uses the logged-in user (no national_id in URL).
const getMyLabTestStatus = async (req, res, next) => {
  try {
    if (!req.user?.national_id) {
      return res.status(401).json({ success: false, message: "Unauthorized" });
    }
    const national_id = String(req.user.national_id);
    const count = await prisma.labTest.count({ where: { national_id } });
    res.json({
      success: true,
      data: {
        national_id,
        labTestsCount: count,
        hasLabTests: count > 0,
        recommendation: count > 0 ? "labtests" : "labs",
      },
    });
  } catch (err) {
    next(err);
  }
};

const getLabTestsByLabId = async (req, res, next) => {
  try {
    const labTests = await prisma.labTest.findMany({
      where: { lab_id: req.params.lab_id },
      orderBy: { createdAt: "desc" },
      include: labTestInclude,
    });
    res.json({ success: true, data: labTests.map(shapeLabTest) });
  } catch (err) {
    next(err);
  }
};

const updateLabTest = async (req, res, next) => {
  try {
    const data = flattenFeatures(req.body);
    const labTest = await prisma.labTest.update({
      where: { id: req.params.id },
      data,
      include: labTestInclude,
    });
    res.json({ success: true, data: shapeLabTest(labTest) });
  } catch (err) {
    if (handlePrismaError(err, res)) return;
    next(err);
  }
};

const deleteLabTest = async (req, res, next) => {
  try {
    await prisma.labTest.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Lab test deleted successfully" });
  } catch (err) {
    if (handlePrismaError(err, res)) return;
    next(err);
  }
};

module.exports = {
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
};
