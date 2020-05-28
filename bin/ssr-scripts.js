#!/usr/bin/env node

'use strict';

process.on('unhandledRejection', err => {
  throw err;
});

const path = require('path'); 
const spawn = require('react-dev-utils/crossSpawn');

const args = process.argv.slice(2);

const scriptIndex = args.findIndex(
  x => x === 'start' || x === 'build'
);

const script = scriptIndex === -1 ? args[0] : args[scriptIndex];
const nodeArgs = scriptIndex > 0 ? args.slice(0, scriptIndex) : [];

if (['start', 'build'].includes(script)) {
  const prefix = path.resolve(__dirname, '../');
  // const runPath = require.resolve('../scripts/run.js');
  // const babelNodeConfigPath = require.resolve('../configs/babel-node.config.js');

  const result = spawn.sync(
    'npm run ' + script + ' --prefix ' + prefix + ' -- --app-cwd=' + process.cwd(),
    { stdio: 'inherit', shell: true }
  );

  if (result.signal) {
    if (result.signal === 'SIGKILL') {
      console.log(
        'The build failed because the process exited too early. ' +
          'This probably means the system ran out of memory or someone called ' +
          '`kill -9` on the process.'
      );
    } else if (result.signal === 'SIGTERM') {
      console.log(
        'The build failed because the process exited too early. ' +
          'Someone might have called `kill` or `killall`, or the system could ' +
          'be shutting down.'
      );
    }
    process.exit(1);
  }
  process.exit(result.status);
} else {
  console.log('Unknown script "' + script + '".');
}
