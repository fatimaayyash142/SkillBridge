const mongoose = require('mongoose');
const dotenv = require('dotenv');
mongoose.set('strictQuery', true);
dotenv.config();

exports.connectDB = async () => {
  try {
    
    const dbUrl = process.env.DB_URL;
    await mongoose.connect(dbUrl);
    console.log("connected to the database");
  } catch (err) {
    process.exit(1);
  }
};