// config/db.js
const mongoose = require("mongoose");

const DB_URI =
  "mongodb+srv://Mikeblocky:iamawizardty%3AD%21@learnenglish.tnwoh.mongodb.net/?retryWrites=true&w=majority&appName=learnEnglish";

const connectDB = async () => {
  try {
    await mongoose.connect(DB_URI, {
      dbName: "myDatabase",
    });
    console.log("Connected to MongoDB");
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1); // Exit process with failure
  }
};

module.exports = connectDB;