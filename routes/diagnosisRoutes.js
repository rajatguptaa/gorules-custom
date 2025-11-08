const express = require('express');
const router = express.Router();
const {
  createDiagnosis,
  getAllDiagnoses,
  getDiagnosisById,
  updateDiagnosis,
  deleteDiagnosis,
} = require('../controllers/diagnosisController');

/**
 * @swagger
 * /api/diagnoses:
 *   post:
 *     summary: Create a new diagnosis (Admin)
 *     tags: [Diagnoses]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CreateDiagnosisRequest'
 *     responses:
 *       201:
 *         description: Diagnosis created successfully
 *       400:
 *         description: Validation error
 */
router.post('/', createDiagnosis);

/**
 * @swagger
 * /api/diagnoses:
 *   get:
 *     summary: Get all diagnoses
 *     tags: [Diagnoses]
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
 *         name: severity
 *         schema:
 *           type: string
 *         description: Filter by severity
 *     responses:
 *       200:
 *         description: List of diagnoses
 */
router.get('/', getAllDiagnoses);

/**
 * @swagger
 * /api/diagnoses/{id}:
 *   get:
 *     summary: Get diagnosis by ID
 *     tags: [Diagnoses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Diagnosis ID
 *     responses:
 *       200:
 *         description: Diagnosis details
 *       404:
 *         description: Diagnosis not found
 */
router.get('/:id', getDiagnosisById);

/**
 * @swagger
 * /api/diagnoses/{id}:
 *   put:
 *     summary: Update diagnosis by ID (Admin)
 *     tags: [Diagnoses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Diagnosis ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UpdateDiagnosisRequest'
 *     responses:
 *       200:
 *         description: Diagnosis updated
 *       404:
 *         description: Diagnosis not found
 */
router.put('/:id', updateDiagnosis);

/**
 * @swagger
 * /api/diagnoses/{id}:
 *   delete:
 *     summary: Delete diagnosis by ID (Admin)
 *     tags: [Diagnoses]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Diagnosis ID
 *     responses:
 *       204:
 *         description: Diagnosis deleted
 *       404:
 *         description: Diagnosis not found
 */
router.delete('/:id', deleteDiagnosis);

module.exports = router;

