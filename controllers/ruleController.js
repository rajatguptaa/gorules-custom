const Rule = require('../models/Rule');
const jsonLogic = require('json-logic-js');

/**
 * Create a new rule
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createRule = async (req, res) => {
  try {
    const { name, description, rule } = req.body;

    // Validation
    if (!name || !rule) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'name and rule are required',
      });
    }

    const newRule = new Rule({
      name,
      description: description || '',
      rule,
    });

    const savedRule = await newRule.save();
    res.status(201).json({
      success: true,
      data: savedRule,
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
 * Get all rules
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllRules = async (req, res) => {
  try {
    const rules = await Rule.find({}).select('id name description createdAt updatedAt').sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      count: rules.length,
      data: rules,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Server error',
      message: error.message,
    });
  }
};

/**
 * Get a single rule by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getRuleById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        error: 'Invalid ID format',
      });
    }

    const rule = await Rule.findById(id);

    if (!rule) {
      return res.status(404).json({
        error: 'Rule not found',
      });
    }

    res.status(200).json({
      success: true,
      data: rule,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Server error',
      message: error.message,
    });
  }
};

/**
 * Update a rule by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateRule = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, rule } = req.body;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        error: 'Invalid ID format',
      });
    }

    const existingRule = await Rule.findById(id);

    if (!existingRule) {
      return res.status(404).json({
        error: 'Rule not found',
      });
    }

    // Update only provided fields
    if (name !== undefined) existingRule.name = name;
    if (description !== undefined) existingRule.description = description;
    if (rule !== undefined) existingRule.rule = rule;

    const updatedRule = await existingRule.save();

    res.status(200).json({
      success: true,
      data: updatedRule,
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
 * Delete a rule by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteRule = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        error: 'Invalid ID format',
      });
    }

    const rule = await Rule.findByIdAndDelete(id);

    if (!rule) {
      return res.status(404).json({
        error: 'Rule not found',
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

/**
 * Evaluate a stored rule by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const evaluateRuleById = async (req, res) => {
  try {
    const { id } = req.params;
    const { data } = req.body;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        error: 'Invalid ID format',
      });
    }

    const rule = await Rule.findById(id);

    if (!rule) {
      return res.status(404).json({
        error: 'Rule not found',
      });
    }

    try {
      const result = jsonLogic.apply(rule.rule, data || {});
      res.status(200).json({
        success: true,
        data: {
          ruleId: rule.id,
          ruleName: rule.name,
          result,
          evaluatedAt: new Date().toISOString(),
        },
      });
    } catch (evalError) {
      res.status(400).json({
        error: 'Rule evaluation failed',
        message: evalError.message,
      });
    }
  } catch (error) {
    res.status(500).json({
      error: 'Server error',
      message: error.message,
    });
  }
};

/**
 * Evaluate an ad-hoc rule (not stored)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const evaluateAdHocRule = async (req, res) => {
  try {
    const { rule, data } = req.body;

    if (!rule) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'rule is required',
      });
    }

    try {
      const result = jsonLogic.apply(rule, data || {});
      res.status(200).json({
        success: true,
        data: {
          result,
          evaluatedAt: new Date().toISOString(),
        },
      });
    } catch (evalError) {
      res.status(400).json({
        error: 'Rule evaluation failed',
        message: evalError.message,
      });
    }
  } catch (error) {
    res.status(500).json({
      error: 'Server error',
      message: error.message,
    });
  }
};

module.exports = {
  createRule,
  getAllRules,
  getRuleById,
  updateRule,
  deleteRule,
  evaluateRuleById,
  evaluateAdHocRule,
};

