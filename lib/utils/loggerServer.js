'use strict';

const properties = require('./properties');
const winston = require('winston');

const logger = new (winston.Logger)();

module.exports = logger;
module.exports.setup = () => {
  const level = properties.get('app.debug') ? 'debug' : 'info';
  logger.add(winston.transports.Console, {level, timestamp: true, colorize: true, debugStdout: level === 'debug'});
};
