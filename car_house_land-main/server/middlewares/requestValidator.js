const { validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: 'error',
      errors: errors.array().map(error => ({
        field: error.path || error.param,
        message: error.msg
      }))
    });
  }
  next();
};

module.exports = { validateRequest };
