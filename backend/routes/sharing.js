import express from 'express';
import { body, param } from 'express-validator';
import {
  createShareLink,
  getSharedRecords,
  getPatientShares,
  revokeShareLink
} from '../controllers/sharingController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.post(
  '/create',
  protect,
  [
    body('recordIds')
      .isArray({ min: 1 })
      .withMessage('At least one record ID must be selected'),
    body('doctorEmail')
      .optional({ checkFalsy: true })
      .isEmail()
      .withMessage('Please provide a valid doctor email address')
      .normalizeEmail(),
    body('expiresHours')
      .optional()
      .isInt({ min: 1 })
      .withMessage('Expiry time must be a positive integer (hours)'),
    body('passcode')
      .optional({ checkFalsy: true })
      .isLength({ min: 4 })
      .withMessage('Passcode must be at least 4 characters long')
  ],
  validate,
  createShareLink
);

router.get('/active', protect, getPatientShares);
router.delete('/:id', protect, revokeShareLink);

// Public route for doctors (passcode checked inside controller if required)
router.post(
  '/access/:code',
  [
    param('code')
      .trim()
      .notEmpty()
      .withMessage('Sharing code is required')
      .isHexadecimal()
      .withMessage('Invalid sharing code format')
      .isLength({ min: 32, max: 32 })
      .withMessage('Invalid sharing code length'),
    body('passcode')
      .optional({ checkFalsy: true })
      .trim()
      .notEmpty()
      .withMessage('Passcode cannot be empty')
  ],
  validate,
  getSharedRecords
);

export default router;
