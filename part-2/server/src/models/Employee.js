import mongoose from "mongoose";

const employeeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      maxlength: 254,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },
    position: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    department: {
      type: String,
      required: true,
      trim: true,
      maxlength: 80,
    },
    salary: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ["Active", "On leave", "Inactive"],
      default: "Active",
    },
    joiningDate: {
      type: Date,
      required: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
  },
  { timestamps: true },
);

employeeSchema.index({ createdBy: 1, email: 1 }, { unique: true });

export default mongoose.model("Employee", employeeSchema);
