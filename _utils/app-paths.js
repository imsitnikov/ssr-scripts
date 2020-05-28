/* eslint-disable import/no-extraneous-dependencies */
import fs from 'fs';
import path from 'path';

const appDirectory = fs.realpathSync(process.cwd());
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

export const appPaths = {
  root: resolveApp('.'),
  src: resolveApp('src'),
  nodeModules: resolveApp('node_modules'),
  envDefaults: resolveApp('.env.defaults'),
  build: resolveApp('build'),
  public: resolveApp('public'),
  packageJson: resolveApp('package.json'),
  packageLockJson: resolveApp('package-lock.json'),
  tsConfig: resolveApp('tsconfig.json'),
};
