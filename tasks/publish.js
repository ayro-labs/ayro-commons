'use strict';

const {commands, publish} = require('release-n-publish');
const path = require('path');

const WORKING_DIR = path.resolve();

async function lintProject() {
  commands.log('Linting project...');
  await commands.exec('npm run lint', WORKING_DIR);
}

// Run this if call directly from command line
if (require.main === module) {
  publish.setWorkingDir(WORKING_DIR);
  publish.setLintTask(lintProject);
  publish.setNpmProject(true);
  publish.run();
}
