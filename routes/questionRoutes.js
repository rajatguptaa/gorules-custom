const express = require('express');
const router = express.Router();
const {
  createQuestion,
  getAllQuestions,
  getQuestionById,
  updateQuestion,
  deleteQuestion,
  getFirstQuestion,
  getNextQuestion,
  reorderQuestions,
  getQuestionsByCategory,
} = require('../controllers/questionController');

/**
 * @swagger
 * /api/questions:
 *   post:
 *     summary: Create a new question
 *     tags: [Questions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateQuestionRequest'
 *     responses:
 *       201:
 *         description: Question created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 */
router.post('/', createQuestion);

/**
 * @swagger
 * /api/questions:
 *   get:
 *     summary: Get all questions
 *     tags: [Questions]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: isActive
 *         schema:
 *           type: boolean
 *         description: Filter by active status
 *       - in: query
 *         name: tags
 *         schema:
 *           type: string
 *         description: Filter by tags (comma-separated)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [order, category, createdAt]
 *         description: Sort field
 *     responses:
 *       200:
 *         description: List of questions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ListResponse'
 *       500:
 *         description: Server error
 */
router.get('/', getAllQuestions);

/**
 * @swagger
 * /api/questions/first:
 *   get:
 *     summary: Get the first question
 *     tags: [Questions]
 *     responses:
 *       200:
 *         description: First question
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       404:
 *         description: No questions found
 */
router.get('/first', getFirstQuestion);

/**
 * @swagger
 * /api/questions/next:
 *   post:
 *     summary: Get next question based on previous answer
 *     tags: [Questions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GetNextQuestionRequest'
 *     responses:
 *       200:
 *         description: Next question or null if no more questions
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Question not found
 */
router.post('/next', getNextQuestion);

/**
 * @swagger
 * /api/questions/reorder:
 *   post:
 *     summary: Reorder questions (Admin)
 *     tags: [Questions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReorderQuestionsRequest'
 *     responses:
 *       200:
 *         description: Questions reordered successfully
 *       400:
 *         description: Validation error
 */
router.post('/reorder', reorderQuestions);

/**
 * @swagger
 * /api/questions/category/{category}:
 *   get:
 *     summary: Get questions by category
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         description: Question category
 *     responses:
 *       200:
 *         description: Questions in category
 *       500:
 *         description: Server error
 */
router.get('/category/:category', getQuestionsByCategory);

/**
 * @swagger
 * /api/questions/{id}:
 *   get:
 *     summary: Get a single question by ID
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Question ID
 *     responses:
 *       200:
 *         description: Question details
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: Question not found
 */
router.get('/:id', getQuestionById);

/**
 * @swagger
 * /api/questions/{id}:
 *   put:
 *     summary: Update a question by ID (Admin)
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Question ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateQuestionRequest'
 *     responses:
 *       200:
 *         description: Question updated successfully
 *       400:
 *         description: Validation error
 *       404:
 *         description: Question not found
 */
router.put('/:id', updateQuestion);

/**
 * @swagger
 * /api/questions/{id}:
 *   delete:
 *     summary: Delete a question by ID (Admin)
 *     tags: [Questions]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Question ID
 *     responses:
 *       204:
 *         description: Question deleted successfully
 *       400:
 *         description: Invalid ID format
 *       404:
 *         description: Question not found
 */
router.delete('/:id', deleteQuestion);

module.exports = router;

