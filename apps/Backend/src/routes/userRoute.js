const express = require("express");
const { validate } = require("../middlewares/validate");
const { userCreateSchema, userUpdateSchema } = require("../validators/user.schema");
const { authenticate } = require("../middlewares/auth");
const {
  createUser,
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

const router = express.Router();

router.post("/", authenticate, validate(userCreateSchema), createUser);
router.get("/", authenticate, getUsers);
router.get("/:id", authenticate, getUserById);
router.put("/:id", authenticate, validate(userUpdateSchema), updateUser);
router.delete("/:id", authenticate, deleteUser);

module.exports = router;
