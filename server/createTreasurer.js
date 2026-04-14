import mongoose from "mongoose";
import dotenv from "dotenv";
import Member from "./src/members/member.model.js";

dotenv.config();

const parseArgs = () => {
  const args = process.argv.slice(2);
  const parsed = {};

  for (let i = 0; i < args.length; i += 1) {
    const arg = args[i];
    if (!arg.startsWith("--")) continue;

    const key = arg.slice(2);
    const value = args[i + 1] && !args[i + 1].startsWith("--") ? args[i + 1] : true;
    parsed[key] = value;
    if (value !== true) i += 1;
  }

  return parsed;
};

const usage = () => {
  console.log("Usage:");
  console.log("  node createTreasurer.js --name \"Treasurer Name\" --email treasurer@example.com --password \"StrongPass123\"");
  console.log("Optional:");
  console.log("  --force   Update existing member with same email to TREASURER and reset name/password");
};

const main = async () => {
  const { name, email, password, force } = parseArgs();

  if (!name || !email || !password) {
    usage();
    process.exit(1);
  }

  if (!process.env.MONGO_URI) {
    console.error("MONGO_URI is missing in environment.");
    process.exit(1);
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const normalizedName = String(name).trim();
  const normalizedPassword = String(password);

  if (normalizedPassword.length < 6) {
    console.error("Password must be at least 6 characters.");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existing = await Member.findOne({ email: normalizedEmail }).select("+password");

    if (existing && !force) {
      console.error("A member with this email already exists. Use --force to update it as TREASURER.");
      process.exit(1);
    }

    let member;
    if (existing && force) {
      existing.name = normalizedName;
      existing.password = normalizedPassword;
      existing.role = "TREASURER";
      existing.isActive = true;
      member = await existing.save();
      console.log("Updated existing member as TREASURER.");
    } else {
      member = await Member.create({
        name: normalizedName,
        email: normalizedEmail,
        password: normalizedPassword,
        role: "TREASURER",
        isActive: true,
      });
      console.log("Created TREASURER account.");
    }

    console.log("Name:", member.name);
    console.log("Email:", member.email);
    console.log("Role:", member.role);
    console.log("Active:", member.isActive);

    process.exit(0);
  } catch (error) {
    console.error("Failed to create/update treasurer:", error.message);
    process.exit(1);
  }
};

main();
