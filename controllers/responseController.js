const Response = require('../models/Response');
const Question = require('../models/Question');
const Diagnosis = require('../models/Diagnosis');
const jsonLogic = require('json-logic-js');
const crypto = require('crypto');

/**
 * Create or update a response session
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createOrUpdateResponse = async (req, res) => {
  try {
    const { sessionId, userId, questionId, selectedOptionId, answerValue, metadata } = req.body;

    if (!questionId) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'questionId is required',
      });
    }

    // Get question details
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({
        error: 'Question not found',
      });
    }

    // Determine answer value
    let finalAnswerValue = answerValue;
    let selectedOptionText = '';

    if (selectedOptionId) {
      const option = question.options.find(opt => opt.id === selectedOptionId);
      if (option) {
        finalAnswerValue = option.value;
        selectedOptionText = option.text;
      }
    }

    // Generate or use provided sessionId
    const finalSessionId = sessionId || crypto.randomUUID();

    // Find or create response
    let response = await Response.findOne({ sessionId: finalSessionId });

    if (!response) {
      response = new Response({
        sessionId: finalSessionId,
        userId: userId || null,
        metadata: metadata || {},
      });
    }

    // Check if question already answered
    const existingAnswerIndex = response.answers.findIndex(
      ans => ans.questionId.toString() === questionId
    );

    const answerData = {
      questionId,
      questionText: question.questionText,
      selectedOptionId: selectedOptionId || null,
      selectedOptionText,
      answerValue: finalAnswerValue,
      answeredAt: new Date(),
    };

    if (existingAnswerIndex >= 0) {
      // Update existing answer
      response.answers[existingAnswerIndex] = answerData;
    } else {
      // Add new answer
      response.answers.push(answerData);
    }

    // Update flattened answers object
    if (selectedOptionId) {
      response.allAnswers[selectedOptionId] = finalAnswerValue;
    }
    // Also store by question value
    response.allAnswers[questionId] = finalAnswerValue;

    await response.save();

    res.status(200).json({
      success: true,
      data: response,
      sessionId: finalSessionId,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Server error',
      message: error.message,
    });
  }
};

/**
 * Get response by session ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getResponseBySession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const response = await Response.findOne({ sessionId })
      .populate('diagnosis')
      .sort({ createdAt: -1 });

    if (!response) {
      return res.status(404).json({
        error: 'Response not found',
      });
    }

    res.status(200).json({
      success: true,
      data: response,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Server error',
      message: error.message,
    });
  }
};

/**
 * Get all responses (with filters)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllResponses = async (req, res) => {
  try {
    const { userId, completed, limit = 50, skip = 0 } = req.query;
    const query = {};

    if (userId) {
      query.userId = userId;
    }
    if (completed !== undefined) {
      query.completed = completed === 'true';
    }

    const responses = await Response.find(query)
      .populate('diagnosis')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(skip));

    const total = await Response.countDocuments(query);

    res.status(200).json({
      success: true,
      count: responses.length,
      total,
      data: responses,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Server error',
      message: error.message,
    });
  }
};

/**
 * Complete response and generate diagnosis
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const completeResponse = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const response = await Response.findOne({ sessionId });

    if (!response) {
      return res.status(404).json({
        error: 'Response not found',
      });
    }

    if (response.completed) {
      return res.status(400).json({
        error: 'Response already completed',
      });
    }

    // Generate diagnosis based on answers
    const diagnosis = await generateDiagnosis(response.allAnswers);

    // Mark response as completed
    response.completed = true;
    response.completedAt = new Date();
    if (diagnosis) {
      response.diagnosis = diagnosis._id;
    }

    await response.save();

    const populatedResponse = await Response.findById(response._id)
      .populate('diagnosis');

    res.status(200).json({
      success: true,
      data: populatedResponse,
      message: 'Response completed and diagnosis generated',
    });
  } catch (error) {
    res.status(500).json({
      error: 'Server error',
      message: error.message,
    });
  }
};

/**
 * Generate diagnosis based on answers
 * @param {Object} answers - Flattened answers object
 * @returns {Promise<Object|null>} - Diagnosis object or null
 */
const generateDiagnosis = async (answers) => {
  try {
    // Get all active diagnoses
    const diagnoses = await Diagnosis.find({ isActive: true })
      .sort({ priority: -1 });

    // Evaluate each diagnosis condition
    for (const diagnosis of diagnoses) {
      try {
        const matches = jsonLogic.apply(diagnosis.conditions, answers);
        if (matches) {
          return diagnosis;
        }
      } catch (evalError) {
        console.error(`Error evaluating diagnosis ${diagnosis._id}:`, evalError);
        continue;
      }
    }

    // Return default diagnosis if no match
    return await Diagnosis.findOne({ 
      name: 'General Hair Care',
      isActive: true 
    });
  } catch (error) {
    console.error('Error generating diagnosis:', error);
    return null;
  }
};

/**
 * Get diagnosis for answers (without saving response)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getDiagnosisForAnswers = async (req, res) => {
  try {
    const { answers } = req.body;

    if (!answers || typeof answers !== 'object') {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'answers object is required',
      });
    }

    const diagnosis = await generateDiagnosis(answers);

    if (!diagnosis) {
      return res.status(404).json({
        error: 'No diagnosis found',
        message: 'No matching diagnosis found for the provided answers',
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
 * Delete response by session ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteResponse = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const response = await Response.findOneAndDelete({ sessionId });

    if (!response) {
      return res.status(404).json({
        error: 'Response not found',
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
  createOrUpdateResponse,
  getResponseBySession,
  getAllResponses,
  completeResponse,
  getDiagnosisForAnswers,
  deleteResponse,
};

