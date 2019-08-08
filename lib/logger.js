const { createLogger, format, transports } = require('winston');
const fs = require('fs');
const path = require('path');

const env = process.env.NODE_ENV || 'development';
const logDir = 'logs';

// Create the log directory if it does not exist
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir);
}

const filename = path.join(logDir, 'results.log');

// Patch to fix bug with logging Error objects
const enumerateErrorFormat = format(info => {
  if (info.message instanceof Error) {
    info.message = Object.assign({
      message: info.message.message,
      stack: info.message.stack
    }, info.message);
  }

  if (info instanceof Error) {
    return Object.assign({
      message: { message: info.message, stack: info.stack },
      stack: info.stack
    }, info);
  }

  return info;
});

const printf = format.printf(info => {
  if (info.message.constructor === Object) {
    info.message = JSON.stringify(info.message, null, 4)
  }
  return `${info.timestamp} ${info.level} [${info.label}]: ${info.message}`;
})

const logger = createLogger({
  // change level if in dev environment versus production
  level: env === 'production' ? 'info' : 'debug',
  format: format.combine(
    enumerateErrorFormat(),
    format.label({ label: path.basename(process.mainModule.filename) }),
    format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' })
  ),
  transports: [
    new transports.Console({
      format: format.combine(
        format.prettyPrint(),
        format.colorize(),
        printf,
      )
    }),
    new transports.File({
      filename,
      format: format.combine(
        printf,
      )
    })
  ]
});

module.exports = logger;
