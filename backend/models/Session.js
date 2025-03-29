const mongoose = require('mongoose');

const keystrokeSchema = new mongoose.Schema({
  char: String,
  typedChar: String,
  correct: Boolean,
  timestamp: Number,
  latency: Number,
  surroundingChars: String
});

const sessionSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  wpm: {
    type: Number,
    required: true,
    min: 0,
    max: 300
  },
  accuracy: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  totalErrors: {
    type: Number,
    required: true,
    min: 0
  },
  errorWords: [{
    word: String,
    errorCount: Number,
    averageLatency: Number,
    type: mongoose.Schema.Types.Mixed,
  }],
  typingDurations: [Number],
  keystrokes: [keystrokeSchema],
  text: String,
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Indexes for faster queries
sessionSchema.index({ user: 1, createdAt: -1 });
sessionSchema.index({ 'errorWords.word': 1 });

module.exports = mongoose.model('Session', sessionSchema);