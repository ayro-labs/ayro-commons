const properties = require('properties');
const path = require('path');
const parse = require('deasync')(properties.parse);

function getValue(config, key, defaultValue) => {
  let value = config;
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

exports.parse = (file) => {
  const config = parse(file, {path: true, sections: true});
  return {
    getValue: (key, defaultValue) => {
      return getValue(config, key, defaultValue);
    },
  };
};
