/* eslint-disable import/no-extraneous-dependencies */
import fs from 'fs';
import path from 'path';

let appCwd = null;
process.argv.forEach(arg => {
  if (arg.indexOf('--app-cwd=') !== -1) {
    appCwd = arg.replace('--app-cwd=', '');
  }
});

// Пути в приложении
const appDirectory = fs.realpathSync(path.resolve(__dirname, '../'));
const resolveApp = relativePath => path.resolve(appDirectory, relativePath);

export const appPaths = {
  root: resolveApp('.'),
  src: resolveApp('src'),
  build: resolveApp('build'),
  public: resolveApp('public'),
  nodeModules: resolveApp('node_modules'),
  envDefaults: resolveApp('.env.defaults'),
  packageJson: resolveApp('package.json'),
  packageLockJson: resolveApp('package-lock.json'),
  tsConfig: resolveApp('tsconfig.json'),
};

// Путь в пакете сборки
const packageDirectory = fs.realpathSync(process.cwd());
const resolvePackage = relativePath => path.resolve(packageDirectory, relativePath);

export const packagePaths = {
  root: resolvePackage('.'),
  scripts: resolvePackage('scripts'),
  configs: resolvePackage('configs'),
  utils: resolvePackage('utils'),
  nodeModules: resolvePackage('node_modules'),
  packageJson: resolvePackage('package.json'),
};