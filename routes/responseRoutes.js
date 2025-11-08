const express = require('express');
const router = express.Router();
const {
  createOrUpdateResponse,
  getResponseBySession,
  getAllResponses,
  completeResponse,
  getDiagnosisForAnswers,
  deleteResponse,
} = require('../controllers/responseController');

/**
 * @swagger
 * /api/responses:
 *   post:
 *     summary: Save or update user answer
 *     tags: [Responses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/SaveAnswerRequest'
 *     responses:
 *       200:
 *         description: Answer saved successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *       400:
 *         description: Validation error
 *       404:
 *         description: Question not found
 */
router.post('/', createOrUpdateResponse);

/**
 * @swagger
 * /api/responses:
 *   get:
 *     summary: Get all responses (with filters)
 *     tags: [Responses]
 *     parameters:
 *       - in: query
 *         name: userId
 *         schema:
 *           type: string
 *         description: Filter by user ID
 *       - in: query
 *         name: completed
 *         schema:
 *           type: boolean
 *         description: Filter by completion status
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: Limit results
 *       - in: query
 *         name: skip
 *         schema:
 *           type: integer
 *         description: Skip results
 *     responses:
 *       200:
 *         description: List of responses
 *       500:
 *         description: Server error
 */
router.get('/', getAllResponses);

/**
 * @swagger
 * /api/responses/{sessionId}:
 *   get:
 *     summary: Get response by session ID
 *     tags: [Responses]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Response data
 *       404:
 *         description: Response not found
 */
router.get('/:sessionId', getResponseBySession);

/**
 * @swagger
 * /api/responses/{sessionId}/complete:
 *   post:
 *     summary: Complete response and generate diagnosis
 *     tags: [Responses]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Response completed with diagnosis
 *       400:
 *         description: Response already completed
 *       404:
 *         description: Response not found
 */
router.post('/:sessionId/complete', completeResponse);

/**
 * @swagger
 * /api/responses/{sessionId}:
 *   delete:
 *     summary: Delete response by session ID
 *     tags: [Responses]
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
 *     responses:
 *       204:
 *         description: Response deleted
 *       404:
 *         description: Response not found
 */
router.delete('/:sessionId', deleteResponse);

/**
 * @swagger
 * /api/responses/diagnosis:
 *   post:
 *     summary: Get diagnosis for answers (without saving)
 *     tags: [Responses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/GetDiagnosisRequest'
 *     responses:
 *       200:
 *         description: Diagnosis generated
 *       400:
 *         description: Validation error
 *       404:
 *         description: No diagnosis found
 */
router.post('/diagnosis', getDiagnosisForAnswers);

module.exports = router;

