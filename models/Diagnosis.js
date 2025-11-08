const mongoose = require('mongoose');

/**
 * Diagnosis Schema
 * Stores diagnosis/recommendation templates based on answer patterns
 */
const diagnosisSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Diagnosis name is required'],
      trim: true,
      maxlength: [200, 'Name cannot exceed 200 characters'],
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    category: {
      type: String,
      enum: ['hair-care', 'scalp-treatment', 'product-recommendation', 'lifestyle', 'general'],
      default: 'general',
    },
    conditions: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
      description: 'JSON Logic conditions that must be met for this diagnosis',
    },
    recommendations: {
      type: [String],
      default: [],
      description: 'List of recommendations for this diagnosis',
    },
    products: {
      type: [String],
      default: [],
      description: 'Recommended product names or IDs',
    },
    severity: {
      type: String,
      enum: ['low', 'medium', 'high', 'critical'],
      default: 'medium',
    },
    priority: {
      type: Number,
      default: 0,
      description: 'Priority order when multiple diagnoses match',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      description: 'Additional metadata',
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

// Indexes
diagnosisSchema.index({ category: 1, priority: -1 });
diagnosisSchema.index({ isActive: 1 });
diagnosisSchema.index({ priority: -1 });

const Diagnosis = mongoose.model('Diagnosis', diagnosisSchema);

module.exports = Diagnosis;

