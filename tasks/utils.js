const childProcess = require('child_process');
const colors = require('colors/safe');
const Promise = require('bluebird');

const $ = this;

function logBuffer(data, buffer) {
  buffer += data.toString();
  const lines = buffer.split('\n');
  for (let i = 0; i < lines.length - 1; i += 1) {
    const line = lines[i];
    $.log(line, false);
  }
  return lines[lines.length - 1];
}

exports.exec = (command, dir) => {
  return new Promise((resolve, reject) => {
    const child = childProcess.spawn(command, {
      shell: true,
      cwd: dir,
    });
    let outBuffer = '';
    let errBuffer = '';
    child.stdout.on('data', (data) => {
      outBuffer = logBuffer(data, outBuffer);
    });
    child.stderr.on('data', (data) => {
      errBuffer = logBuffer(data, errBuffer);
    });
    child.on('exit', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Command "${command}" returned error`));
      }
    });
  });
};

exports.log = (text, colored) => {
  console.info(colored === false ? text : colors.green(text));
};

exports.logError = (text, colored) => {
  console.error(colored === false ? text : colors.red(text));
};
