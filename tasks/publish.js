const {publishTask, commands} = require('../lib');
const path = require('path');
const Promise = require('bluebird');

const WORKING_DIR = path.resolve(__dirname, '../');

function lintProject() {
  return Promise.coroutine(function* () {
    commands.log('Linting project...');
    yield commands.exec('npm run lint', WORKING_DIR);
  })();
}

// Run this if call directly from command line
if (require.main === module) {
  publishTask.withWorkingDir(WORKING_DIR);
  publishTask.withBuildTask(lintProject);
  publishTask.isNpmProject(true);
  publishTask.run();
}
