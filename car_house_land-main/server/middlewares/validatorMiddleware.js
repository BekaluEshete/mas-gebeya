const { validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorArray = errors.array();
    console.log(`[validateRequest] Path: ${req.path}, Errors:`, JSON.stringify(errorArray, null, 2));
    console.log(`[validateRequest] Body Keys:`, Object.keys(req.body));

    return res.status(400).json({
      status: 'error',
      message: errorArray[0].msg, // Added top-level message for frontend compatibility
      errors: errorArray.map(error => ({
        field: error.path || error.param,
        message: error.msg
      }))
    });
  }
  next();
};

module.exports = { validateRequest };
