'use strict';

const path = require('path');

let rootPath = null;

exports.setup = (rootDir) => {
  rootPath = rootDir;
};

exports.root = (...args) => {
  return path.join(rootPath, ...args);
};

exports.join = (...args) => {
  return path.join(...args);
};
