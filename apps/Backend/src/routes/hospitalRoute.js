const express = require("express");
const { validate } = require("../middlewares/validate");
const { hospitalCreateSchema, hospitalUpdateSchema } = require("../validators/hospital.schema");
const { authenticate } = require("../middlewares/auth");
const {
  createHospital,
  getHospitals,
  getHospitalById,
  getHospitalsByArea,
  updateHospital,
  deleteHospital,
} = require("../controllers/hospitalController");

const router = express.Router();

router.post("/", authenticate, validate(hospitalCreateSchema), createHospital);
router.get("/", getHospitals);
router.get("/:id", getHospitalById);
router.get("/area/:area", getHospitalsByArea);
router.put("/:id", authenticate, validate(hospitalUpdateSchema), updateHospital);
router.delete("/:id", authenticate, deleteHospital);

module.exports = router;
