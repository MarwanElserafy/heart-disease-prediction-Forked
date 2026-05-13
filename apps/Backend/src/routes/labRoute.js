const express = require("express");
const { validate } = require("../middlewares/validate");
const { labCreateSchema, labUpdateSchema } = require("../validators/lab.schema");
const { authenticate } = require("../middlewares/auth");
const {
  createLab,
  getLabs,
  getLabById,
  updateLab,
  deleteLab,
} = require("../controllers/labController");

const router = express.Router();

router.post("/", authenticate, validate(labCreateSchema), createLab);
router.get("/", getLabs);
router.get("/:id", getLabById);
router.put("/:id", authenticate, validate(labUpdateSchema), updateLab);
router.delete("/:id", authenticate, deleteLab);

module.exports = router;
