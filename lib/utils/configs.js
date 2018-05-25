'use strict';

const yaml = require('yamljs');
const _ = require('lodash');

exports.load = (file) => {
  const config = yaml.load(file);
  return {
    obj: config,
    get: (path, defaultValue) => {
      return _.get(config, path, defaultValue);
    },
  };
};
