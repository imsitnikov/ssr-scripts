import path from 'path';
// eslint-disable-next-line import/no-extraneous-dependencies
import chokidar from 'chokidar';
import { format } from './run';
import { writeFile, copyFile, makeDir, copyDir, cleanDir } from '../utils/fs';
import { appPaths } from '../utils/paths';

// eslint-disable-next-line import/no-dynamic-require, @typescript-eslint/no-var-requires
const pkg = require(appPaths.packageJson);

const copy = async () => {
  await makeDir(appPaths.root + '/build');
  await Promise.all([
    writeFile(
      `${appPaths.root}/build/package.json`,
      JSON.stringify(
        {
          private: true,
          engines: pkg.engines,
          dependencies: pkg.dependencies,
          scripts: {
            start: 'node server.js',
          },
        },
        null,
        2,
      ),
    ),
    copyFile(appPaths.packageLockJson, `${appPaths.root}/build/package-lock.json`),
    copyFile(appPaths.envDefaults, `${appPaths.root}/build/.env.defaults`),
    copyDir(appPaths.public, `${appPaths.root}/build/public`),
  ]);

  // if (process.argv.includes('--watch')) {
  //   const watcher = chokidar.watch([`${appPaths.public}/**/*`], {
  //     ignoreInitial: true,
  //   });

  //   watcher.on('all', async (event, filePath) => {
  //     const start = new Date();
  //     const src = path.relative('./', filePath);
  //     const dist = path.join(
  //       `${appPaths.build}/`,
  //       src.startsWith('src') ? path.relative('src', src) : src,
  //     );
  //     switch (event) {
  //       case 'add':
  //       case 'change':
  //         await makeDir(path.dirname(dist));
  //         await copyFile(filePath, dist);
  //         break;
  //       case 'unlink':
  //       case 'unlinkDir':
  //         cleanDir(dist, { nosort: true, dot: true });
  //         break;
  //       default:
  //         return;
  //     }
  //     const end = new Date();
  //     const time = end.getTime() - start.getTime();
  //     console.info(`[${format(end)}] ${event} '${dist}' after ${time} ms`);
  //   });
  // }
};

export default copy;
