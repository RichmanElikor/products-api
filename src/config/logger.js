import winston from 'winston';

// createLogger builds your logging system with the settings you define
const logger = winston.createLogger({

  // level sets the minimum priority of logs to record
  // winston's priority order from highest to lowest is:
  // error > warn > info > http > debug
  // setting 'info' means error, warn, and info all get logged
  // debug level logs get ignored
  level: 'info',

  // format defines how each log entry is structured
  format: winston.format.combine(

    // timestamp() adds the current date and time to every log entry
    // without this you would have no idea WHEN something happened
    winston.format.timestamp(),

    // json() formats every log as a JSON object instead of plain text
    // this makes logs searchable and machine readable
    // e.g {"level":"info","message":"...","timestamp":"..."}
    winston.format.json()
  ),

  // transports define WHERE your logs get sent
  // you can have multiple destinations at once
  transports: [

    // this transport ONLY saves logs with level 'error'
    // this file stays small and focused — exactly what you check first when something breaks
    new winston.transports.File({
      filename: 'logs/errors.log',
      level: 'error'
    }),

    // this transport saves EVERY log regardless of level
    // this is your full history of everything that happened
    new winston.transports.File({
      filename: 'logs/combined.log'
    }),
  ],
});

// this block only runs when NOT in production
// during development we also want to see logs in real time in our terminal
// in production we don't want console output cluttering server logs — files are enough
if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.simple() // simple() makes console output more readable than raw JSON
  }));
}

// export so other files can import and use this logger
export default logger;