const mongoose = require("mongoose");
const dotenv = require("dotenv");
const User = require("./models/userModel");

mongoose.set("strictQuery", true);
dotenv.config();

exports.connectDB = async () => {
  try {
    const dbUrl = process.env.DB_URL;

    await mongoose.connect(dbUrl);
    console.log("connected to the database");

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_PASSWORD;

    const adminExists = await User.findOne({
      email: adminEmail
    });

    if (!adminExists) {
      await User.create({
        name: "SkillBridge Admin",
        email: adminEmail,
        password: adminPassword,
        passwordConfirm: adminPassword,
        role: "Admin"
      });

      console.log("Default admin created successfully");
    }

  } catch (err) {
    console.log("Database error:", err.message);
    process.exit(1);
  }
};