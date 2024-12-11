const mongoose = require("mongoose");

const WritingResponseSchema = new mongoose.Schema({
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: "User",
    },
    task: {
      type: String,
      required: true,
    },
    response: {
      type: String,
      required: true,
    },
    wordCount: {
      type: Number,
      required: true,
    },
    timestamp: {
      type: Date,
      default: Date.now, // Use default value for current timestamp
    },
    completedAt: {
      type: Date,
      default: Date.now, // Use default value for completion time
    },
  });
  
const WritingResponse = mongoose.model(
  "WritingResponse",
  WritingResponseSchema
);

module.exports = WritingResponse;