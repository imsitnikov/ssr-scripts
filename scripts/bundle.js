/* eslint-disable import/no-extraneous-dependencies */

import webpack from 'webpack';
import webpackConfig from '../configs/webpack';

const bundle = () => {
  return new Promise((resolve, reject) => {
    webpack(webpackConfig).run((err, stats) => {
      if (err) {
        return reject(err);
      }

      console.info(stats.toString(webpackConfig[0].stats));
      if (stats.hasErrors()) {
        return reject(new Error('Webpack compilation errors'));
      }

      return resolve();
    });
  });
};

export default bundle;
