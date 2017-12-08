const projectPackage = require('../package');
const utils = require('./utils');
const path = require('path');
const Promise = require('bluebird');

const WORKING_DIR = path.resolve(__dirname, '../');

function exec(command, dir) {
  return utils.exec(command, dir || WORKING_DIR);
}

function checkoutTag(version) {
  return Promise.coroutine(function* () {
    utils.log(`Checking out the tag ${version}...`);
    yield exec(`git checkout ${version}`);
  })();
}

function lintLibrary() {
  return Promise.coroutine(function* () {
    utils.log('Linting library...');
    yield exec('npm run lint');
  })();
}

function publishToNpm() {
  return Promise.coroutine(function* () {
    utils.log('Publishing to Npm...');
    yield exec('npm publish');
  })();
}

// Run this if call directly from command line
if (require.main === module) {
  Promise.coroutine(function* () {
    try {
      const {version} = projectPackage;
      utils.log(`Publishing version ${version} to Github and Npm...`);
      yield checkoutTag(version);
      yield lintLibrary();
      yield publishToNpm();
      yield checkoutTag('master');
      utils.log(`Version ${version} published with success!`);
    } catch (err) {
      utils.logError(err);
      process.exit(1);
    }
  })();
}
