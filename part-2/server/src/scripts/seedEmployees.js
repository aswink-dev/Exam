import "dotenv/config";
import mongoose from "mongoose";
import Employee from "../models/Employee.js";
import User from "../models/User.js";
import sampleEmployees from "../data/sampleEmployees.js";

async function seedEmployees() {
  const email = process.argv[2]?.trim().toLowerCase();
  if (!email) {
    throw new Error("Provide an existing account email: npm run seed:employees -- you@example.com");
  }
  if (!process.env.MONGODB_URI) {
    throw new Error("MONGODB_URI is required. Add it to the .env file.");
  }

  await mongoose.connect(process.env.MONGODB_URI);
  try {
    const user = await User.findOne({ email }).select("_id");
    if (!user) {
      throw new Error(`No Greenboard account found for ${email}. Register in the app first.`);
    }

    let inserted = 0;
    for (const employee of sampleEmployees) {
      const result = await Employee.updateOne(
        { createdBy: user._id, email: employee.email },
        { $setOnInsert: { ...employee, createdBy: user._id } },
        { upsert: true, runValidators: true },
      );
      inserted += result.upsertedCount;
    }

    console.log(`Seed complete: added ${inserted} sample employee(s); existing samples were left unchanged.`);
  } finally {
    await mongoose.disconnect();
  }
}

seedEmployees().catch((error) => {
  console.error(`Could not seed sample employees: ${error.message}`);
  process.exitCode = 1;
});
