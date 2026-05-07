const prisma = require("../config/prisma");
const { handlePrismaError } = require("../middlewares/prismaErrors");

const createLab = async (req, res, next) => {
  try {
    const lab = await prisma.lab.create({ data: req.body });
    res.status(201).json({ success: true, data: lab });
  } catch (err) {
    if (handlePrismaError(err, res)) return;
    next(err);
  }
};

const getLabs = async (req, res, next) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
    const skip = (page - 1) * limit;

    const [total, labs] = await Promise.all([
      prisma.lab.count(),
      prisma.lab.findMany({
        skip, take: limit, orderBy: { createdAt: "desc" },
      }),
    ]);

    res.json({
      success: true,
      data: labs,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

const getLabById = async (req, res, next) => {
  try {
    const lab = await prisma.lab.findUnique({ where: { id: req.params.id } });
    if (!lab) return res.status(404).json({ success: false, message: "Lab not found" });
    res.json({ success: true, data: lab });
  } catch (err) {
    next(err);
  }
};

const updateLab = async (req, res, next) => {
  try {
    const lab = await prisma.lab.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, data: lab });
  } catch (err) {
    if (handlePrismaError(err, res)) return;
    next(err);
  }
};

const deleteLab = async (req, res, next) => {
  try {
    await prisma.lab.delete({ where: { id: req.params.id } });
    res.json({ success: true, message: "Lab deleted successfully" });
  } catch (err) {
    if (handlePrismaError(err, res)) return;
    next(err);
  }
};

module.exports = {
  createLab,
  getLabs,
  getLabById,
  updateLab,
  deleteLab,
};
