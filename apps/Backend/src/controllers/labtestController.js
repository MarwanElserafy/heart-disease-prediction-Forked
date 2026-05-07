const prisma = require("../config/prisma");
const { handlePrismaError } = require("../middlewares/prismaErrors");

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
  getLabTests,
  getLabTestById,
  getLabTestsByNationalId,
  getLatestLabTestByNationalId,
  getLabTestsByLabId,
  updateLabTest,
  deleteLabTest,
};
