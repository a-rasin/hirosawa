const { validationResult } = require('express-validator');

module.exports = {
  // Middleware for checking authentication
  isAuthenticated: (req, res, next) => {
    if (!req.isAuthenticated()) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    next();
  },

  // Middleware for data validation
  dataValidationErrorManagement: (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    next();
  }
}
