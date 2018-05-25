'use strict';

const {commands, publish} = require('../lib');
const path = require('path');

const WORKING_DIR = path.resolve();

async function lintProject() {
  commands.log('Linting project...');
  await commands.exec('npm run lint', WORKING_DIR);
}

// Run this if call directly from command line
if (require.main === module) {
  publish.withWorkingDir(WORKING_DIR);
  publish.withBuildTask(lintProject);
  publish.isNpmProject(true);
  publish.run();
}
