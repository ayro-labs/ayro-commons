const commands = require('./commands');
const fs = require('fs');
const path = require('path');
const Promise = require('bluebird');

const ECR_REPOSITORY_URL = '554511234717.dkr.ecr.us-west-1.amazonaws.com';
const ECR_REPOSITORY_NAMESPACE = 'ayro';
const ECR_REPOSITORY_REGION = 'us-west-1';

const readFileAsync = Promise.promisify(fs.readFile);

let workingDir;
let buildTask;
let beforePublishTask;
let publishTask;
let dockerProject;
let npmProject;

function exec(command, dir) {
  return commands.exec(command, dir || workingDir);
}

function getPackageJson() {
  return Promise.coroutine(function* () {
    const packageFile = path.join(workingDir, 'package.json');
    return JSON.parse(yield readFileAsync(packageFile, 'utf8'));
  })();
}

function checkoutTag(version) {
  return Promise.coroutine(function* () {
    commands.log(`Checking out the tag ${version}...`);
    yield exec(`git checkout ${version}`);
  })();
}

function buildImage(packageJson) {
  return Promise.coroutine(function* () {
    commands.log('Building image...');
    yield exec(`docker build -t ${packageJson.name} .`);
    commands.log('Tagging image...');
    yield exec(`docker tag ${packageJson.name}:latest ${ECR_REPOSITORY_URL}/${ECR_REPOSITORY_NAMESPACE}/${packageJson.name}:latest`);
  })();
}

function publishToECR(packageJson) {
  return Promise.coroutine(function* () {
    commands.log('Signing in to Amazon ECR...');
    yield exec(`eval $(aws ecr get-login --no-include-email --region ${ECR_REPOSITORY_REGION})`);
    commands.log('Publishing to Amazon ECR...');
    yield exec(`docker push ${ECR_REPOSITORY_URL}/${ECR_REPOSITORY_NAMESPACE}/${packageJson.name}:latest`);
  })();
}

function publishToNpm() {
  return Promise.coroutine(function* () {
    commands.log('Publishing to Npm...');
    yield commands.exec('npm publish');
  })();
}

exports.withWorkingDir = (dir) => {
  workingDir = dir;
};

exports.withBuildTask = (task) => {
  buildTask = task;
};

exports.withPublishTask = (task) => {
  publishTask = task;
};

exports.isDockerProject = (value) => {
  dockerProject = value;
};

exports.isNpmProject = (value) => {
  npmProject = value;
};

exports.run = () => {
  Promise.coroutine(function* () {
    try {
      if (!workingDir || !buildTask || (!dockerProject && !npmProject && !publishTask)) {
        commands.log('Working dir, build task and publish task must be defined before running publish task');
        process.exit(1);
      }
      const packageJson = yield getPackageJson();
      const {version} = packageJson;
      commands.log(`Publishing version ${version}...`);
      yield checkoutTag(version);
      yield buildTask(packageJson);
      if (beforePublishTask) {
        yield beforePublishTask(packageJson);
      }
      if (dockerProject) {
        yield buildImage(packageJson);
        yield publishToECR(packageJson);
      }
      if (npmProject) {
        yield publishToNpm();
      }
      if (publishTask) {
        yield publishTask(packageJson);
      }
      yield checkoutTag('master');
      commands.log(`Version ${version} published with success!`);
    } catch (err) {
      commands.logError(err);
      process.exit(1);
    }
  })();
};
