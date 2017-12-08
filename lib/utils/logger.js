const configs = require('../configs');
const properties = require('./properties');
const winston = require('winston');

module.exports = () => {
  const level = properties.get('app.debug') ? 'debug' : 'info';
  const transports = [
    new (winston.transports.Console)({
      level,
      timestamp: true,
      colorize: true,
      debugStdout: level === 'debug',
    }),
  ];
  if (configs.logger.file) {
    transports.push(new (winston.transports.File)({
      level,
      filename: configs.logger.file,
    }));
  }
  return new (winston.Logger)({transports});
};
