const express = require('express');
const router = express.Router();
const { evaluateAdHocRule } = require('../controllers/ruleController');

/**
 * @swagger
 * /api/evaluate:
 *   post:
 *     summary: Evaluate an ad-hoc rule (not stored)
 *     tags: [Evaluation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/AdHocEvaluateRequest'
 *     responses:
 *       200:
 *         description: Rule evaluation result
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/AdHocEvaluateResponse'
 *       400:
 *         description: Validation error or evaluation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *       500:
 *         description: Server error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/', evaluateAdHocRule);

module.exports = router;

