import logger from '../config/logger.js';

const errHandler = (err, req, res, next) => {

  // logger.error writes to BOTH errors.log and combined.log
  // we include the error message AND which request caused it
  // this is the exact information you need at 2am when something breaks
  logger.error(`${err.message} - ${req.method} ${req.url}`);

  // we still send a clean generic message to the client
  // we never expose internal error details to the outside world — that's a security risk
  res.status(500).json({ message: 'An unexpected error occurred' });
};

export default errHandler;