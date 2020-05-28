import { cleanDir } from '../utils/fs';
import { appPaths } from '../utils/paths';

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
