'use strict';

const winston = require('winston');

const consoleLogger = new (winston.Logger)();
const fileLogger = new (winston.Logger)();

exports.setup = (options) => {
  consoleLogger.add(winston.transports.Console, {
    level: options.level,
    timestamp: true,
    colorize: true,
  });
  fileLogger.add(winston.transports.Console, {
    level: options.level,
    timestamp: true,
    colorize: true,
  });
  if (options.file) {
    fileLogger.add(winston.transports.File, {
      level: options.level,
      filename: options.file,
    });
  }
};

exports.file = fileLogger;
exports.console = consoleLogger;

exports.debug = fileLogger.debug;
exports.info = fileLogger.info;
exports.warn = fileLogger.warn;
exports.error = fileLogger.error;
