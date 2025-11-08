const mongoose = require('mongoose');

/**
 * Rule Schema
 * Defines the structure for rules stored in MongoDB
 */
const ruleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Rule name is required'],
      trim: true,
      maxlength: [200, 'Rule name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
      default: '',
    },
    rule: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, 'Rule logic is required'],
      validate: {
        validator: function (v) {
          // Basic validation to ensure rule is an object
          return typeof v === 'object' && v !== null;
        },
        message: 'Rule must be a valid JSON object',
      },
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
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

// Index for faster queries
ruleSchema.index({ name: 1 });
ruleSchema.index({ createdAt: -1 });

const Rule = mongoose.model('Rule', ruleSchema);

module.exports = Rule;

