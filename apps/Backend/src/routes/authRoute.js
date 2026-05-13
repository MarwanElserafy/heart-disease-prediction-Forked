const express = require("express");
const { validate } = require("../middlewares/validate");
const { userCreateSchema, userLoginSchema } = require("../validators/user.schema");
const { registerUser, loginUser } = require("../controllers/authController");

const router = express.Router();

// Register new user
router.post("/register", validate(userCreateSchema), registerUser);

// Login user
router.post("/login", validate(userLoginSchema), loginUser);

module.exports = router;
