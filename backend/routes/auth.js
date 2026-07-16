import express from 'express';
import { body } from 'express-validator';
import {
  registerUser,
  loginUser,
  getUserProfile,
  updateUserProfile,
  setup2FA,
  verify2FA,
  disable2FA,
  getEmergencyProfile,
  changePassword
} from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.post(
  '/register',
  [
    body('name')
      .trim()
      .notEmpty()
      .withMessage('Name is required'),
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    body('password')
      .isLength({ min: 6 })
      .withMessage('Password must be at least 6 characters long'),
    body('role')
      .optional()
      .isIn(['Patient'])
      .withMessage('Role must be Patient')
  ],
  validate,
  registerUser
);

router.post(
  '/login',
  [
    body('email')
      .isEmail()
      .withMessage('Please provide a valid email address')
      .normalizeEmail(),
    body('password')
      .notEmpty()
      .withMessage('Password is required'),
    body('token2fa')
      .optional()
      .isLength({ min: 6, max: 6 })
      .withMessage('2FA Token must be exactly 6 digits')
      .isNumeric()
      .withMessage('2FA Token must be numeric')
  ],
  validate,
  loginUser
);

router.get('/profile', protect, getUserProfile);
router.put('/profile', protect, updateUserProfile);
router.put(
  '/change-password',
  protect,
  [
    body('oldPassword').notEmpty().withMessage('Old password is required'),
    body('newPassword').isLength({ min: 6 }).withMessage('New password must be at least 6 characters long')
  ],
  validate,
  changePassword
);
router.get('/emergency-profile/:id', getEmergencyProfile);

// 2FA Routes
router.post('/2fa/setup', protect, setup2FA);
router.post(
  '/2fa/verify',
  protect,
  [
    body('token')
      .trim()
      .isLength({ min: 6, max: 6 })
      .withMessage('2FA Verification token must be exactly 6 digits')
      .isNumeric()
      .withMessage('2FA Verification token must be numeric')
  ],
  validate,
  verify2FA
);
router.post('/2fa/disable', protect, disable2FA);

export default router;
