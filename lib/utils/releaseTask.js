const commands = require('./commands');
const fs = require('fs');
const path = require('path');
const semver = require('semver');
const Promise = require('bluebird');
const _ = require('lodash');

const readFileAsync = Promise.promisify(fs.readFile);
const writeFileAsync = Promise.promisify(fs.writeFile);

let workingDir;
let buildTask;
let updateVersionTask;

function exec(command, dir) {
  return commands.exec(command, dir || workingDir);
}

function updateMaster() {
  return Promise.coroutine(function* () {
    commands.log('Updating master branch...');
    yield exec('git checkout master');
    yield exec('git pull origin master');
  })();
}

function updateVersion(versionType, versionNumber) {
  return Promise.coroutine(function* () {
    commands.log('Updating version...');
    const packageFile = path.join(workingDir, 'package.json');
    const packageJson = JSON.parse(yield readFileAsync(packageFile, 'utf8'));
    commands.log(`  Current version is ${packageJson.version}`);
    const nextVersion = versionNumber || semver.inc(packageJson.version, versionType);
    commands.log(`  Next version is ${nextVersion}`);
    packageJson.version = nextVersion;
    yield writeFileAsync(packageFile, JSON.stringify(packageJson, null, 2));
    return nextVersion;
  })();
}

function commitFiles(version) {
  return Promise.coroutine(function* () {
    commands.log('Committing files...');
    yield exec('git add --all');
    yield exec(`git commit -am "Release ${version}"`);
  })();
}

function pushFiles() {
  return Promise.coroutine(function* () {
    commands.log('Pushing files to remote...');
    yield exec('git push origin master');
  })();
}

function createTag(version) {
  return Promise.coroutine(function* () {
    commands.log(`Creating tag ${version}...`);
    yield exec(`git tag ${version}`);
  })();
}

function pushTag() {
  return Promise.coroutine(function* () {
    commands.log('Pushing tag to remote...');
    yield exec('git push --tags');
  })();
}

function validateArgs(versionType, versionNumber) {
  const versionTypes = ['major', 'minor', 'patch', 'version'];
  if (!_.includes(versionTypes, versionType) || (versionType === 'version' && !versionNumber)) {
    commands.log('Usage:');
    commands.log('npm run release -- major|minor|patch|version <version>');
    process.exit(1);
  }
}

exports.withWorkingDir = (dir) => {
  workingDir = dir;
};

exports.withBuildTask = (task) => {
  buildTask = task;
};

exports.withUpdateVersionTask = (task) => {
  updateVersionTask = task;
};

exports.run = (versionType, versionNumber) => {
  Promise.coroutine(function* () {
    try {
      if (!workingDir || !buildTask) {
        commands.log('Working dir and build task must be defined before running release task');
        process.exit(1);
      }
      validateArgs(versionType, versionNumber);
      yield updateMaster();
      const updateVersionFunction = !updateVersionTask ? updateVersion : updateVersionTask;
      const version = yield updateVersionFunction(versionType, versionNumber);
      commands.log(`Releasing version ${version} to remote...`);
      yield buildTask();
      yield commitFiles(version);
      yield pushFiles();
      yield createTag(version);
      yield pushTag();
      commands.log(`Version ${version} released with success!`);
    } catch (err) {
      commands.logError(err);
      process.exit(1);
    }
  })();
};