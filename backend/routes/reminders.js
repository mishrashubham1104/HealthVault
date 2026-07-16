import express from 'express';
import { body } from 'express-validator';
import {
  createReminder,
  getReminders,
  updateReminder,
  deleteReminder
} from '../controllers/reminderController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.use(protect);

router.post(
  '/',
  [
    body('title')
      .trim()
      .notEmpty()
      .withMessage('Title is required'),
    body('dosage')
      .trim()
      .notEmpty()
      .withMessage('Dosage is required'),
    body('time')
      .trim()
      .notEmpty()
      .withMessage('Time is required')
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Time must be in valid HH:MM format (24-hour)'),
    body('frequency')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Frequency cannot be empty')
  ],
  validate,
  createReminder
);

router.get('/', getReminders);

router.put(
  '/:id',
  [
    body('title')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Title cannot be empty'),
    body('dosage')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Dosage cannot be empty'),
    body('time')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Time cannot be empty')
      .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
      .withMessage('Time must be in valid HH:MM format (24-hour)'),
    body('frequency')
      .optional()
      .trim()
      .notEmpty()
      .withMessage('Frequency cannot be empty'),
    body('isActive')
      .optional()
      .isBoolean()
      .withMessage('isActive must be a boolean')
  ],
  validate,
  updateReminder
);

router.delete('/:id', deleteReminder);

export default router;
