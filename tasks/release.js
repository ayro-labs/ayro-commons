const utils = require('./utils');
const fs = require('fs');
const path = require('path');
const semver = require('semver');
const Promise = require('bluebird');
const _ = require('lodash');

const WORKING_DIR = path.resolve(__dirname, '../');
const PACKAGE_FILE = path.join(WORKING_DIR, 'package.json');

const readFileAsync = Promise.promisify(fs.readFile);
const writeFileAsync = Promise.promisify(fs.writeFile);

function exec(command, dir) {
  return utils.exec(command, dir || WORKING_DIR);
}

function updateMaster() {
  return Promise.coroutine(function* () {
    utils.log('Updating master branch...');
    yield exec('git checkout master');
    yield exec('git pull origin master');
  })();
}

function updateVersion(versionType, versionNumber) {
  return Promise.coroutine(function* () {
    utils.log('Updating version...');
    const projectPackage = JSON.parse(yield readFileAsync(PACKAGE_FILE, 'utf8'));
    utils.log(`  Current version is ${projectPackage.version}`);
    const nextVersion = versionNumber || semver.inc(projectPackage.version, versionType);
    utils.log(`  Next version is ${nextVersion}`);
    projectPackage.version = nextVersion;
    yield writeFileAsync(PACKAGE_FILE, JSON.stringify(projectPackage, null, 2));
    return nextVersion;
  })();
}

function lintLibrary() {
  return Promise.coroutine(function* () {
    utils.log('Linting library...');
    yield exec('npm run lint');
  })();
}

function commitFiles(version) {
  return Promise.coroutine(function* () {
    utils.log('Committing files...');
    yield exec('git add --all');
    yield exec(`git commit -am "Release ${version}"`);
  })();
}

function pushFiles() {
  return Promise.coroutine(function* () {
    utils.log('Pushing files to remote...');
    yield exec('git push origin master');
  })();
}

function createTag(version) {
  return Promise.coroutine(function* () {
    utils.log(`Creating tag ${version}...`);
    yield exec(`git tag ${version}`);
  })();
}

function pushTag() {
  return Promise.coroutine(function* () {
    utils.log('Pushing tag to remote...');
    yield exec('git push --tags');
  })();
}

function validateArgs() {
  const versionType = process.argv[2];
  const versionNumber = process.argv[3];
  const versionTypes = ['major', 'minor', 'patch', 'version'];
  if (!_.includes(versionTypes, versionType) || (versionType === 'version' && !versionNumber)) {
    utils.log('Usage:');
    utils.log('npm run release -- major|minor|patch|version <version>');
    process.exit(1);
  }
  return {versionType, versionNumber};
}

// Run this if call directly from command line
if (require.main === module) {
  const {versionType, versionNumber} = validateArgs();
  Promise.coroutine(function* () {
    try {
      yield updateMaster();
      const version = yield updateVersion(versionType, versionNumber);
      utils.log(`Releasing version ${version} to remote...`);
      yield lintLibrary();
      yield commitFiles(version);
      yield pushFiles();
      yield createTag(version);
      yield pushTag();
      utils.log(`Version ${version} released with success!`);
    } catch (err) {
      utils.logError(err);
      process.exit(1);
    }
  })();
}
