#!/usr/bin/env node

'use strict';

process.on('unhandledRejection', err => {
  throw err;
});

const path = require('path'); 
const { spawnSync } = require('child_process');

const args = process.argv.slice(2);

const scriptIndex = args.findIndex(
  x => x === 'start' || x === 'build'
);

const script = scriptIndex === -1 ? args[0] : args[scriptIndex];
// const nodeArgs = scriptIndex > 0 ? args.slice(0, scriptIndex) : [];

if (['start', 'build'].includes(script)) {
  const prefix = path.resolve(__dirname, '../');
  // const babelNodeConfigPath = require.resolve('./configs/babel-node.config.js');

  switch (script) {
    case 'start':
      spawnSync('npm run start --prefix ' + prefix, { stdio: 'inherit' });
      break;
    case 'build':
      spawnSync('npm run build --prefix ' + prefix, { stdio: 'inherit' });
      break;
  }
  // const result = spawn.sync(
  //   'node',
  //   nodeArgs
  //     .concat(require.resolve('../scripts/' + script))
  //     .concat(args.slice(scriptIndex + 1)),
  //   { stdio: 'inherit' }
  // );
  // if (result.signal) {
  //   if (result.signal === 'SIGKILL') {
  //     console.log(
  //       'The build failed because the process exited too early. ' +
  //         'This probably means the system ran out of memory or someone called ' +
  //         '`kill -9` on the process.'
  //     );
  //   } else if (result.signal === 'SIGTERM') {
  //     console.log(
  //       'The build failed because the process exited too early. ' +
  //         'Someone might have called `kill` or `killall`, or the system could ' +
  //         'be shutting down.'
  //     );
  //   }
  //   process.exit(1);
  // }
} else {
  console.log('Unknown script "' + script + '".');
}
