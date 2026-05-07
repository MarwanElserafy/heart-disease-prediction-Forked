const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const prisma = require("../config/prisma");

const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.trim() === "") {
    throw new Error("Server misconfiguration: JWT_SECRET is not set in .env");
  }
  return jwt.sign({ userId }, secret, {
    expiresIn: process.env.JWT_EXPIRE || "30d",
  });
};

const registerUser = async (req, res, next) => {
  try {
    const { national_id, username, email, password } = req.body;

    const existingUser = await prisma.user.findFirst({
      where: { OR: [{ email }, { national_id }] },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User with this email or national ID already exists",
      });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await prisma.user.create({
      data: { national_id, username, email: email.toLowerCase(), password: hashedPassword },
    });

    const token = generateToken(user.id);
    const { password: _, ...userWithoutPassword } = user;

    res.status(201).json({
      success: true,
      message: "User registered successfully",
      data: userWithoutPassword,
      token,
    });
  } catch (err) {
    next(err);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const token = generateToken(user.id);
    const { password: _, ...userWithoutPassword } = user;

    res.json({
      success: true,
      message: "Login successful",
      data: userWithoutPassword,
      token,
    });
  } catch (err) {
    next(err);
  }
};

module.exports = {
  registerUser,
  loginUser,
};
