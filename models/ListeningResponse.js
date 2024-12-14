const mongoose = require("mongoose");

const ListeningResponseSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User", // Reference to the User model
  },
  quizId: {
    type: String, // Unique identifier for the quiz (e.g., "listening-quiz-1")
    required: true,
  },
  audioFile: {
    type: String, // Name of the audio file associated with the quiz
    required: true,
  },
  responses: [
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
        required: true,
      },
    },
  ],
  score: {
    type: Number,
    required: true, // Total score of the user
  },
  percentage: {
    type: Number,
    required: true, // Percentage score
  },
  reviewTime: {
    type: Number, // Time user took to review answers (in seconds)
    default: 0,
  },
  timestamp: {
    type: Date,
    default: Date.now, // When the quiz was submitted
  },
});

const ListeningResponse = mongoose.model("ListeningResponse", ListeningResponseSchema);

module.exports = ListeningResponse;
