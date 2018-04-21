'use strict';

const commands = require('./commands');
const fs = require('fs');
const path = require('path');
const semver = require('semver');
const Promise = require('bluebird');
const _ = require('lodash');

const readFileAsync = Promise.promisify(fs.readFile);
const writeFileAsync = Promise.promisify(fs.writeFile);

let workingDir;
let afterVersionUpdateTask;
let lintTask;
let buildTask;

async function exec(command, dir) {
  return commands.exec(command, dir || workingDir);
}

async function checkoutMaster() {
  commands.log('Checking out master branch...');
  await exec('git checkout master');
}

async function updateMaster() {
  commands.log('Updating master branch...');
  await exec('git pull origin master');
}

async function updateVersion(versionType, versionNumber) {
  commands.log('Updating version...');
  const packageFile = path.join(workingDir, 'package.json');
  const packageJson = JSON.parse(await readFileAsync(packageFile, 'utf8'));
  commands.log(`  Current version is ${packageJson.version}`);
  const nextVersion = versionNumber || semver.inc(packageJson.version, versionType);
  commands.log(`  Next version is ${nextVersion}`);
  packageJson.version = nextVersion;
  await writeFileAsync(packageFile, JSON.stringify(packageJson, null, 2));
  return nextVersion;
}

async function commitFiles(version) {
  commands.log('Committing files...');
  await exec('git add --all');
  await exec(`git commit -am "Release ${version}"`);
}

async function pushFiles() {
  commands.log('Pushing files to remote...');
  await exec('git push origin master');
}

async function createTag(version) {
  commands.log(`Creating tag ${version}...`);
  await exec(`git tag ${version}`);
}

async function pushTag() {
  commands.log('Pushing tag to remote...');
  await exec('git push --tags');
}

async function validateArgs(versionType, versionNumber) {
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

exports.withAfterVersionUpdateTask = (task) => {
  afterVersionUpdateTask = task;
};

exports.withLintTask = (task) => {
  lintTask = task;
};

exports.withBuildTask = (task) => {
  buildTask = task;
};

exports.run = async (versionType, versionNumber) => {
  try {
    if (!workingDir || !buildTask) {
      commands.logError('Working dir and build task must be defined.');
      process.exit(1);
    }
    validateArgs(versionType, versionNumber);
    await checkoutMaster();
    await updateMaster();
    if (lintTask) {
      await lintTask();
    }
    const version = await updateVersion(versionType, versionNumber);
    if (afterVersionUpdateTask) {
      await afterVersionUpdateTask(version);
    }
    await buildTask();
    commands.log(`Releasing version ${version} to remote...`);
    await commitFiles(version);
    await pushFiles();
    await createTag(version);
    await pushTag();
    commands.log(`Version ${version} released with success!`);
  } catch (err) {
    commands.logError(err);
    await checkoutMaster();
    process.exit(1);
  }
};
