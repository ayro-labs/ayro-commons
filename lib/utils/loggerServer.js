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
  return new (winston.Logger)({transports});
};
