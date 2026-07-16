import { validationResult } from 'express-validator';

/**
 * Reusable middleware to intercept express-validator validation results
 * and return 400 Bad Request with formatted error messages.
 */
export const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const formattedErrors = errors.array().map(err => ({
      field: err.path || err.param,
      message: err.msg
    }));

    return res.status(400).json({
      success: false,
      errors: formattedErrors,
      message: 'Validation failed: ' + errors.array().map(e => e.msg).join(', ')
    });
  }
  next();
};
