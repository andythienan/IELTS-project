const mongoose = require('mongoose');

const LessonCompletionSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    lessonId: { type: String, required: true },
    completedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('LessonCompletion', LessonCompletionSchema);
