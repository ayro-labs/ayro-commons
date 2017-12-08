const configs = require('../configs');

exports.get = (key, defaultValue) => {
  let value = configs.properties;
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
