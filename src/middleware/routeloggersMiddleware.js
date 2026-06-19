import logger from '../config/logger.js';

const requestLogger = (req, res, next) => {

  // instead of console.log we now use logger.info
  // this writes to combined.log AND prints to console (in development)
  // every request that hits your server gets permanently recorded
  logger.info(`${req.method} ${req.url}`);

  next(); // move forward to the next middleware — unchanged from before
};

export default requestLogger;