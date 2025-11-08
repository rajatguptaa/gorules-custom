const mongoose = require('mongoose');

/**
 * Answer Schema
 * Individual answer to a question
 */
const answerSchema = new mongoose.Schema({
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true,
  },
  questionText: {
    type: String,
    required: true,
  },
  selectedOptionId: {
    type: String,
    required: false, // Not required for text/number type questions
  },
  selectedOptionText: {
    type: String,
    required: false,
  },
  answerValue: {
    type: mongoose.Schema.Types.Mixed,
    required: true, // Can be string, number, or array
  },
  answeredAt: {
    type: Date,
    default: Date.now,
  },
}, { _id: false });

/**
 * Response Schema
 * Stores complete user questionnaire responses
 */
const responseSchema = new mongoose.Schema(
  {
    sessionId: {
      type: String,
      required: true,
      index: true,
      description: 'Unique session identifier for the user',
    },
    userId: {
      type: String,
      index: true,
      description: 'User identifier (if user is logged in)',
    },
    answers: {
      type: [answerSchema],
      default: [],
    },
    allAnswers: {
      type: mongoose.Schema.Types.Mixed,
      description: 'Flattened object of all answers for easy querying',
      default: {},
    },
    completed: {
      type: Boolean,
      default: false,
    },
    completedAt: {
      type: Date,
    },
    diagnosis: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Diagnosis',
      default: null,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      description: 'Additional metadata (device, browser, etc.)',
      default: {},
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes for faster queries
responseSchema.index({ sessionId: 1, createdAt: -1 });
responseSchema.index({ userId: 1, createdAt: -1 });
responseSchema.index({ completed: 1 });
responseSchema.index({ diagnosis: 1 });

// Method to add an answer
responseSchema.methods.addAnswer = function(questionId, questionText, selectedOptionId, selectedOptionText, answerValue) {
  this.answers.push({
    questionId,
    questionText,
    selectedOptionId,
    selectedOptionText,
    answerValue,
    answeredAt: new Date(),
  });
  
  // Update flattened answers object
  if (selectedOptionId) {
    this.allAnswers[selectedOptionId] = answerValue;
  }
  
  return this.save();
};

// Method to mark as completed
responseSchema.methods.markCompleted = function(diagnosisId) {
  this.completed = true;
  this.completedAt = new Date();
  if (diagnosisId) {
    this.diagnosis = diagnosisId;
  }
  return this.save();
};

const Response = mongoose.model('Response', responseSchema);

module.exports = Response;

