const Diagnosis = require('../models/Diagnosis');

/**
 * Create a new diagnosis
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createDiagnosis = async (req, res) => {
  try {
    const {
      name,
      description,
      category,
      conditions,
      recommendations,
      products,
      severity,
      priority,
      isActive,
      metadata,
    } = req.body;

    if (!name || !conditions) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'name and conditions are required',
      });
    }

    const newDiagnosis = new Diagnosis({
      name,
      description: description || '',
      category: category || 'general',
      conditions,
      recommendations: recommendations || [],
      products: products || [],
      severity: severity || 'medium',
      priority: priority !== undefined ? priority : 0,
      isActive: isActive !== undefined ? isActive : true,
      metadata: metadata || {},
    });

    const savedDiagnosis = await newDiagnosis.save();
    res.status(201).json({
      success: true,
      data: savedDiagnosis,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation failed',
        message: error.message,
      });
    }
    res.status(500).json({
      error: 'Server error',
      message: error.message,
    });
  }
};

/**
 * Get all diagnoses
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllDiagnoses = async (req, res) => {
  try {
    const { category, isActive, severity } = req.query;
    const query = {};

    if (category) {
      query.category = category;
    }
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    if (severity) {
      query.severity = severity;
    }

    const diagnoses = await Diagnosis.find(query).sort({ priority: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: diagnoses.length,
      data: diagnoses,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Server error',
      message: error.message,
    });
  }
};

/**
 * Get diagnosis by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDiagnosisById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        error: 'Invalid ID format',
      });
    }

    const diagnosis = await Diagnosis.findById(id);

    if (!diagnosis) {
      return res.status(404).json({
        error: 'Diagnosis not found',
      });
    }

    res.status(200).json({
      success: true,
      data: diagnosis,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Server error',
      message: error.message,
    });
  }
};

/**
 * Update diagnosis by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateDiagnosis = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        error: 'Invalid ID format',
      });
    }

    const existingDiagnosis = await Diagnosis.findById(id);

    if (!existingDiagnosis) {
      return res.status(404).json({
        error: 'Diagnosis not found',
      });
    }

    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined) {
        existingDiagnosis[key] = updateData[key];
      }
    });

    const updatedDiagnosis = await existingDiagnosis.save();

    res.status(200).json({
      success: true,
      data: updatedDiagnosis,
    });
  } catch (error) {
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        error: 'Validation failed',
        message: error.message,
      });
    }
    res.status(500).json({
      error: 'Server error',
      message: error.message,
    });
  }
};

/**
 * Delete diagnosis by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteDiagnosis = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        error: 'Invalid ID format',
      });
    }

    const diagnosis = await Diagnosis.findByIdAndDelete(id);

    if (!diagnosis) {
      return res.status(404).json({
        error: 'Diagnosis not found',
      });
    }

    res.status(204).send();
  } catch (error) {
    res.status(500).json({
      error: 'Server error',
      message: error.message,
    });
  }
};

module.exports = {
  createDiagnosis,
  getAllDiagnoses,
  getDiagnosisById,
  updateDiagnosis,
  deleteDiagnosis,
};

