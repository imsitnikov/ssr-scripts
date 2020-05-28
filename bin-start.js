const { execSync } = require('child_process');

const args = process.argv.slice(2);

const scriptIndex = args.findIndex(
  x => x === 'start' || x === 'build'
);

const script = scriptIndex === -1 ? args[0] : args[scriptIndex];
// const nodeArgs = scriptIndex > 0 ? args.slice(0, scriptIndex) : [];

if (['start', 'build'].includes(script)) {
  // const runPath = require.resolve('./scripts/run');
  // const babelNodeConfigPath = require.resolve('./configs/babel-node.config.js');

  switch (script) {
    case 'start':
      execSync('npm run start');
      break;
    case 'build':
      execSync('npm run build');
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
  // process.exit(1);
} else {
  console.log('Unknown script "' + script + '".');
}