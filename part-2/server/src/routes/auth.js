import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import rateLimit from "express-rate-limit";
import { body, validationResult } from "express-validator";
import User from "../models/User.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 30,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { message: "Too many attempts. Please try again in a few minutes." },
});

const registrationRules = [
  body("name").trim().isLength({ min: 2, max: 80 }).withMessage("Name must be 2–80 characters."),
  body("email").trim().isEmail().withMessage("Enter a valid email address.").normalizeEmail(),
  body("password")
    .isLength({ min: 8, max: 72 })
    .withMessage("Password must be at least 8 characters."),
];

const loginRules = [
  body("email").trim().isEmail().withMessage("Enter a valid email address.").normalizeEmail(),
  body("password").notEmpty().withMessage("Password is required."),
];

function validationError(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Please correct the highlighted fields.",
      errors: errors.array().map(({ path, msg }) => ({ field: path, message: msg })),
    });
  }
  return next();
}

function createToken(user) {
  return jwt.sign({ sub: user.id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });
}

router.post("/register", authLimiter, registrationRules, validationError, async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(409).json({ message: "An account with this email already exists." });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({ name, email, password: hashedPassword });
    return res.status(201).json({
      token: createToken(user),
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    return next(error);
  }
});

router.post("/login", authLimiter, loginRules, validationError, async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email }).select("+password");
    const validPassword = user && (await bcrypt.compare(req.body.password, user.password));
    if (!validPassword) {
      return res.status(401).json({ message: "Email or password is incorrect." });
    }

    return res.json({
      token: createToken(user),
      user: { id: user.id, name: user.name, email: user.email },
    });
  } catch (error) {
    return next(error);
  }
});

router.get("/me", requireAuth, (req, res) => {
  res.json({ user: { id: req.user.id, name: req.user.name, email: req.user.email } });
});

export default router;
