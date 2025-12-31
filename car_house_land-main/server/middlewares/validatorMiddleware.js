const { validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const errorArray = errors.array();
    // Log detailed information for debugging
    console.log(`[validateRequest] Path: ${req.path}`);
    console.log(`[validateRequest] Errors:`, JSON.stringify(errorArray, null, 2));
    console.log(`[validateRequest] Body (keys):`, Object.keys(req.body));

    // Create a readable summary for logging
    const summary = errorArray.map(e => `${e.path || e.param}: ${e.msg}`).join(', ');
    console.log(`[validateRequest] Summary: ${summary}`);

    return res.status(400).json({
      status: 'error',
      message: errorArray[0].msg, // Return most specific error to frontend
      errors: errorArray.map(error => ({
        field: error.path || error.param,
        message: error.msg
      }))
    });
  }
  next();
};

module.exports = { validateRequest };
