const mongoose = require("mongoose");

const QuizResponseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User", // Reference to the User model
  },
  quizId: {
      type: String, // You can use a String to identify the quiz (e.g., "reading-quiz-1")
      required: true
  },
  questions: [
    {
      question: {
        type: String,
        required: true,
      },
      userAnswer: {
        type: String,
        required: true,
      },
      correctAnswer: {
        type: String,
        required: true,
      },
      isCorrect: {
        type: Boolean,
        required: true
      }
    }
  ],
  score: {
    type: Number,
    required: true,
  },
  percentage: {
    type: Number,
    required: true,
  },
  highlights: {
    type: Array,
    default: [],
  },
  notes: {
    type: String,
    default: "",
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const QuizResponse = mongoose.model("QuizResponse", QuizResponseSchema);

module.exports = QuizResponse;