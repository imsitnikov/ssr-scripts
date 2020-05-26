import { cleanDir } from '../_utils/fs';
import { appPaths } from '../_utils/app-paths';

const clean = () => {
  return Promise.all([
    cleanDir(`${appPaths.build}/*`, {
      nosort: true,
      dot: true,
      ignore: [`${appPaths.build}/.git`],
    }),
  ]);
};

export default clean;
