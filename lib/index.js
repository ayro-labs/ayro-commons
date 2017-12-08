const properties = require('properties');
const parse = require('deasync')(properties.parse);
const configs = require('./configs');

exports.setupProperties = (file) => {
  configs.properties = parse(file, {path: true, sections: true});
};

exports.setupLogger = (file) => {
  if (!configs.properties) {
    throw new Error('Properties module must be initialized first');
  }
  configs.logger.file = file;
};

exports.properties = require('./utils/properties');
exports.logger = require('./utils/logger');
exports.loggerServer = require('./utils/loggerServer');
exports.commands = require('./utils/commands');
