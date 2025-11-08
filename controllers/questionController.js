const Question = require('../models/Question');
const jsonLogic = require('json-logic-js');

/**
 * Create a new question
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const createQuestion = async (req, res) => {
  try {
    const {
      questionText,
      questionType,
      options,
      category,
      tags,
      order,
      isActive,
      isFirstQuestion,
      conditionalLogic,
      metadata,
    } = req.body;

    // Validation
    if (!questionText || !category) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'questionText and category are required',
      });
    }

    // If this is set as first question, unset others
    if (isFirstQuestion) {
      await Question.updateMany({ isFirstQuestion: true }, { isFirstQuestion: false });
    }

    const newQuestion = new Question({
      questionText,
      questionType: questionType || 'single-choice',
      options: options || [],
      category,
      tags: tags || [],
      order: order !== undefined ? order : await Question.countDocuments(),
      isActive: isActive !== undefined ? isActive : true,
      isFirstQuestion: isFirstQuestion || false,
      conditionalLogic: conditionalLogic || null,
      metadata: metadata || {},
    });

    const savedQuestion = await newQuestion.save();
    res.status(201).json({
      success: true,
      data: savedQuestion,
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
 * Get all questions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getAllQuestions = async (req, res) => {
  try {
    const { category, isActive, tags, sortBy = 'order' } = req.query;
    const query = {};

    if (category) {
      query.category = category;
    }
    if (isActive !== undefined) {
      query.isActive = isActive === 'true';
    }
    if (tags) {
      query.tags = { $in: Array.isArray(tags) ? tags : [tags] };
    }

    const sortOptions = {};
    if (sortBy === 'order') {
      sortOptions.order = 1;
      sortOptions.createdAt = 1;
    } else if (sortBy === 'category') {
      sortOptions.category = 1;
      sortOptions.order = 1;
    } else {
      sortOptions[sortBy] = 1;
    }

    const questions = await Question.find(query).sort(sortOptions);
    res.status(200).json({
      success: true,
      count: questions.length,
      data: questions,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Server error',
      message: error.message,
    });
  }
};

/**
 * Get a single question by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getQuestionById = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        error: 'Invalid ID format',
      });
    }

    const question = await Question.findById(id);

    if (!question) {
      return res.status(404).json({
        error: 'Question not found',
      });
    }

    res.status(200).json({
      success: true,
      data: question,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Server error',
      message: error.message,
    });
  }
};

/**
 * Update a question by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const updateQuestion = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        error: 'Invalid ID format',
      });
    }

    const existingQuestion = await Question.findById(id);

    if (!existingQuestion) {
      return res.status(404).json({
        error: 'Question not found',
      });
    }

    // If setting as first question, unset others
    if (updateData.isFirstQuestion === true) {
      await Question.updateMany(
        { _id: { $ne: id }, isFirstQuestion: true },
        { isFirstQuestion: false }
      );
    }

    // Update fields
    Object.keys(updateData).forEach((key) => {
      if (updateData[key] !== undefined) {
        existingQuestion[key] = updateData[key];
      }
    });

    const updatedQuestion = await existingQuestion.save();

    res.status(200).json({
      success: true,
      data: updatedQuestion,
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
 * Delete a question by ID
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const deleteQuestion = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        error: 'Invalid ID format',
      });
    }

    const question = await Question.findByIdAndDelete(id);

    if (!question) {
      return res.status(404).json({
        error: 'Question not found',
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
 * Get the first question
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getFirstQuestion = async (req, res) => {
  try {
    const question = await Question.findOne({ isFirstQuestion: true, isActive: true });

    if (!question) {
      // Fallback to first question by order
      const fallbackQuestion = await Question.findOne({ isActive: true })
        .sort({ order: 1, createdAt: 1 });

      if (!fallbackQuestion) {
        return res.status(404).json({
          error: 'No questions found',
        });
      }

      return res.status(200).json({
        success: true,
        data: fallbackQuestion,
      });
    }

    res.status(200).json({
      success: true,
      data: question,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Server error',
      message: error.message,
    });
  }
};

/**
 * Get next question based on previous answers
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getNextQuestion = async (req, res) => {
  try {
    const { currentQuestionId, selectedOptionId, answers } = req.body;

    if (!currentQuestionId) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'currentQuestionId is required',
      });
    }

    if (!currentQuestionId.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        error: 'Invalid question ID format',
      });
    }

    const currentQuestion = await Question.findById(currentQuestionId);

    if (!currentQuestion) {
      return res.status(404).json({
        error: 'Current question not found',
      });
    }

    // If option has nextQuestionId, use it
    if (selectedOptionId && currentQuestion.options) {
      const selectedOption = currentQuestion.options.find(
        (opt) => opt.id === selectedOptionId
      );

      if (selectedOption && selectedOption.nextQuestionId) {
        const nextQuestion = await Question.findById(selectedOption.nextQuestionId);

        if (nextQuestion && nextQuestion.isActive) {
          return res.status(200).json({
            success: true,
            data: nextQuestion,
          });
        }
      }
    }

    // Check conditional logic if provided
    if (currentQuestion.conditionalLogic && answers) {
      try {
        const shouldShow = jsonLogic.apply(currentQuestion.conditionalLogic, answers);
        if (shouldShow) {
          // Find next question based on tags or category
          const nextQuestion = await Question.findOne({
            _id: { $ne: currentQuestionId },
            isActive: true,
            tags: { $in: currentQuestion.tags },
          }).sort({ order: 1 });

          if (nextQuestion) {
            return res.status(200).json({
              success: true,
              data: nextQuestion,
            });
          }
        }
      } catch (evalError) {
        console.error('Conditional logic evaluation error:', evalError);
      }
    }

    // Default: Get next question by order
    const nextQuestion = await Question.findOne({
      _id: { $ne: currentQuestionId },
      isActive: true,
      order: { $gte: currentQuestion.order },
    }).sort({ order: 1 });

    if (!nextQuestion) {
      return res.status(200).json({
        success: true,
        data: null,
        message: 'No more questions available',
      });
    }

    res.status(200).json({
      success: true,
      data: nextQuestion,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Server error',
      message: error.message,
    });
  }
};

/**
 * Reorder questions
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const reorderQuestions = async (req, res) => {
  try {
    const { questionOrders } = req.body; // Array of { questionId, order }

    if (!Array.isArray(questionOrders)) {
      return res.status(400).json({
        error: 'Validation failed',
        message: 'questionOrders must be an array',
      });
    }

    const updatePromises = questionOrders.map(({ questionId, order }) => {
      if (!questionId.match(/^[0-9a-fA-F]{24}$/)) {
        return Promise.reject(new Error(`Invalid question ID: ${questionId}`));
      }
      return Question.findByIdAndUpdate(questionId, { order }, { new: true });
    });

    await Promise.all(updatePromises);

    const updatedQuestions = await Question.find({
      _id: { $in: questionOrders.map((q) => q.questionId) },
    }).sort({ order: 1 });

    res.status(200).json({
      success: true,
      data: updatedQuestions,
      message: 'Questions reordered successfully',
    });
  } catch (error) {
    res.status(500).json({
      error: 'Server error',
      message: error.message,
    });
  }
};

/**
 * Get questions by category
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getQuestionsByCategory = async (req, res) => {
  try {
    const { category } = req.params;

    const questions = await Question.find({
      category,
      isActive: true,
    }).sort({ order: 1 });

    res.status(200).json({
      success: true,
      count: questions.length,
      data: questions,
    });
  } catch (error) {
    res.status(500).json({
      error: 'Server error',
      message: error.message,
    });
  }
};

module.exports = {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  getFirstQuestion,
  getNextQuestion,
  reorderQuestions,
  getQuestionsByCategory,
};

