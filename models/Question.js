const mongoose = require('mongoose');

/**
 * Question Option Schema
 * Defines individual options for a question
 */
const optionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    required: true,
    trim: true,
  },
  value: {
    type: String,
    required: true,
    trim: true,
  },
  nextQuestionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    default: null,
  },
  tags: [{
    type: String,
    trim: true,
  }],
}, { _id: false });

/**
 * Question Schema
 * Defines questions for the hair care questionnaire
 */
const questionSchema = new mongoose.Schema(
  {
    questionText: {
      type: String,
      required: [true, 'Question text is required'],
      trim: true,
      maxlength: [500, 'Question text cannot exceed 500 characters'],
    },
    questionType: {
      type: String,
      enum: ['single-choice', 'multiple-choice', 'text', 'number'],
      default: 'single-choice',
    },
    options: {
      type: [optionSchema],
      required: function() {
        return this.questionType === 'single-choice' || this.questionType === 'multiple-choice';
      },
      validate: {
        validator: function(v) {
          if (this.questionType === 'single-choice' || this.questionType === 'multiple-choice') {
            return v && v.length > 0;
          }
          return true;
        },
        message: 'Options are required for single-choice and multiple-choice questions',
      },
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      lowercase: true,
      enum: ['hair-type', 'scalp-condition', 'hair-problem', 'hair-goal', 'lifestyle', 'other'],
      default: 'other',
    },
    tags: [{
      type: String,
      trim: true,
      lowercase: true,
    }],
    order: {
      type: Number,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    isFirstQuestion: {
      type: Boolean,
      default: false,
    },
    conditionalLogic: {
      type: mongoose.Schema.Types.Mixed,
      description: 'JSON Logic for conditional question display',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      description: 'Additional metadata for the question',
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
questionSchema.index({ category: 1, order: 1 });
questionSchema.index({ isActive: 1, isFirstQuestion: 1 });
questionSchema.index({ tags: 1 });
questionSchema.index({ order: 1 });

// Ensure only one first question is active at a time
questionSchema.pre('save', async function(next) {
  if (this.isFirstQuestion && this.isActive) {
    await mongoose.model('Question').updateMany(
      { _id: { $ne: this._id }, isFirstQuestion: true },
      { isFirstQuestion: false }
    );
  }
  next();
});

const Question = mongoose.model('Question', questionSchema);

module.exports = Question;

