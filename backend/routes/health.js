import express from 'express';
import { body } from 'express-validator';
import {
  getVisits,
  createVisit,
  getAuditLogs
} from '../controllers/healthController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.use(protect);

router.get('/visits', getVisits);
router.post(
  '/visits',
  [
    body('doctorName')
      .trim()
      .notEmpty()
      .withMessage('Doctor name is required'),
    body('specialty')
      .trim()
      .notEmpty()
      .withMessage('Specialty is required'),
    body('date')
      .optional()
      .trim()
      .isISO8601()
      .withMessage('Date must be a valid ISO 8601 date format'),
    body('notes')
      .optional()
      .trim(),
    body('diagnosis')
      .optional()
      .trim(),
    body('prescriptions')
      .optional()
      .isArray()
      .withMessage('Prescriptions must be an array of strings')
  ],
  validate,
  createVisit
);
router.get('/audit-logs', getAuditLogs);

export default router;
