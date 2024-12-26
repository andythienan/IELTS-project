// models/LessonItem.js
const mongoose = require("mongoose");

const LessonItemSchema = new mongoose.Schema({
  category: {
    type: String, // e.g., "grammar", "vocabulary", ...
    required: true,
  },
  title: {
    type: String, // e.g., "Lesson 1: Parts of Speech"
    required: true,
  },
  url: {
    type: String,
    default: "", // e.g., /lesson/lesson1
  },
  isAvailable: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("LessonItem", LessonItemSchema);
