'use strict';

const properties = require('properties');
const parse = require('deasync')(properties.parse);

let configs = {};

exports.setup = (file) => {
  configs = parse(file, {path: true, sections: true});
};

exports.get = (key, defaultValue) => {
  let value = configs;
  let found = true;
  const splits = key.split('.');
  for (let index = 0; index < splits.length; index += 1) {
    const split = splits[index];
    if (!value[split]) {
      found = false;
      break;
    }
    value = value[split];
  }
  return found ? value : defaultValue;
};
