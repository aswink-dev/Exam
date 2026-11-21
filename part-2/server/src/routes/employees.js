import { Router } from "express";
import mongoose from "mongoose";
import { body, param, validationResult } from "express-validator";
import Employee from "../models/Employee.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

const fields = [
  body("name").trim().isLength({ min: 2, max: 100 }).withMessage("Name must be 2–100 characters."),
  body("email").trim().isEmail().withMessage("Enter a valid email address.").normalizeEmail(),
  body("phone")
    .trim()
    .matches(/^[+()\d\s.-]{7,30}$/)
    .withMessage("Enter a valid phone number."),
  body("position").trim().isLength({ min: 2, max: 100 }).withMessage("Position is required."),
  body("department").trim().isLength({ min: 2, max: 80 }).withMessage("Department is required."),
  body("salary").isFloat({ min: 0 }).withMessage("Salary must be zero or more.").toFloat(),
  body("status").isIn(["Active", "On leave", "Inactive"]).withMessage("Choose a valid employee status."),
  body("joiningDate").isISO8601().withMessage("Enter a valid joining date.").toDate(),
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

function validId(req, res, next) {
  if (!mongoose.isValidObjectId(req.params.id)) {
    return res.status(400).json({ message: "The employee ID is invalid." });
  }
  return next();
}

function employeeFields(body) {
  const { name, email, phone, position, department, salary, status, joiningDate } = body;
  return { name, email, phone, position, department, salary, status, joiningDate };
}

router.get("/", async (req, res, next) => {
  try {
    const filter = { createdBy: req.user.id };
    const department = typeof req.query.department === "string" ? req.query.department.trim() : "";
    const search = typeof req.query.search === "string" ? req.query.search.trim().slice(0, 100) : "";

    if (department && department !== "All departments") {
      filter.department = department;
    }
    if (search) {
      const escaped = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      filter.$or = [
        { name: { $regex: escaped, $options: "i" } },
        { email: { $regex: escaped, $options: "i" } },
        { position: { $regex: escaped, $options: "i" } },
      ];
    }

    const employees = await Employee.find(filter).sort({ createdAt: -1 }).lean();
    return res.json({ employees });
  } catch (error) {
    return next(error);
  }
});

router.post("/", fields, validationError, async (req, res, next) => {
  try {
    const employee = await Employee.create({ ...employeeFields(req.body), createdBy: req.user.id });
    return res.status(201).json({ employee });
  } catch (error) {
    return next(error);
  }
});

router.patch("/:id", validId, fields, validationError, async (req, res, next) => {
  try {
    const employee = await Employee.findOneAndUpdate(
      { _id: req.params.id, createdBy: req.user.id },
      employeeFields(req.body),
      { new: true, runValidators: true },
    );
    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }
    return res.json({ employee });
  } catch (error) {
    return next(error);
  }
});

router.delete("/:id", validId, async (req, res, next) => {
  try {
    const employee = await Employee.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user.id,
    });
    if (!employee) {
      return res.status(404).json({ message: "Employee not found." });
    }
    return res.json({ message: "Employee deleted." });
  } catch (error) {
    return next(error);
  }
});

export default router;
