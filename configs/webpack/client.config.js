/* eslint-disable import/no-extraneous-dependencies */

import fs from 'fs';
import webpack from 'webpack';
import WebpackAssetsManifest from 'webpack-assets-manifest';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';
import common, {
  isDebug,
  isAnalyze,
  reStyle,
  commonStylesLoaders,
} from './common.config';
import { appPaths } from '../../utils/paths';
import { overrideWebpackRules } from '../../utils/override-webpack-rules';

// eslint-disable-next-line import/no-dynamic-require, @typescript-eslint/no-var-requires
const pkg = require(appPaths.packageJson);

export default {
  ...common,

  name: 'client',
  target: 'web',

  entry: {
    client: './src/client.tsx',
  },

  output: {
    ...common.output,
    path: `${appPaths.public}/assets`,
    filename: isDebug ? '[name].js' : '[name].[chunkhash:8].js',
    chunkFilename: isDebug
      ? '[name].chunk.js'
      : '[name].[chunkhash:8].chunk.js',
  },

  // Webpack мутирует resolve объект, клонируем чтобы избежать этого
  // https://github.com/webpack/webpack/issues/4817
  resolve: {
    ...common.resolve,
  },

  module: {
    ...common.module,
    rules: [
      ...overrideWebpackRules(common.module.rules, rule => {
        // Переопределение babel-preset-env конфигурации
        if (rule.loader === 'awesome-typescript-loader') {
          return {
            ...rule,
            options: {
              ...rule.options,
              babelOptions: {
                ...rule.options.babelOptions,
                presets: [
                  [
                    '@babel/preset-env',
                    {
                      modules: false,
                      corejs: 3,
                      targets: {
                        browsers: pkg.browserslist,
                      },
                      forceAllTransforms: !isDebug,
                      useBuiltIns: 'entry',
                    },
                  ],
                  ...(rule.options.babelOptions.presets
                    ? rule.options.babelOptions.presets
                    : []),
                ],
              },
            },
          };
        }

        return rule;
      }),
      {
        test: reStyle,
        rules: [
          ...(isDebug
            ? [
                {
                  loader: 'css-hot-loader',
                  options: { cssModule: true, reloadAll: true },
                },
              ]
            : []),
          { use: MiniCssExtractPlugin.loader },
          {
            include: [appPaths.src],
            loader: 'css-loader',
            options: {
              modules: {
                localIdentName: isDebug
                  ? '[path]-[local]-[hash:base64:5]'
                  : '[hash:base64:5]',
              },
              importLoaders: 2,
              sourceMap: true,
            },
          },
          ...commonStylesLoaders,
        ],
      },
    ],
  },

  // devtool
  ...(isDebug ? { devtool: 'inline-cheap-module-source-map' } : {}),

  plugins: [
    ...common.plugins,

    new webpack.DefinePlugin({
      'process.env.BROWSER': true,
      __SERVER__: false,
      __CLIENT__: true,
    }),

    // Создание файла манифеста с ассетами
    // https://github.com/webdeveric/webpack-assets-manifest#options
    new WebpackAssetsManifest({
      output: `${appPaths.build}/asset-manifest.json`,
      publicPath: true,
      writeToDisk: true,
      customize: entry => {
        // You can prevent adding items to the manifest by returning false.
        if (entry.key.toLowerCase().endsWith('.map')) return false;
        return { key: entry.key, value: entry.value };
      },
      done: (manifest, stats) => {
        // Write chunk-manifest.json.json
        const chunkFileName = `${appPaths.build}/chunk-manifest.json`;
        try {
          const fileFilter = file => !file.endsWith('.map');
          const addPath = file => manifest.getPublicPath(file);
          const chunkFiles = stats.compilation.chunkGroups.reduce((acc, c) => {
            acc[c.name] = [
              ...(acc[c.name] || []),
              ...c.chunks.reduce(
                (files, cc) => [
                  ...files,
                  ...cc.files.filter(fileFilter).map(addPath),
                ],
                [],
              ),
            ];
            return acc;
          }, Object.create(null));
          fs.writeFileSync(chunkFileName, JSON.stringify(chunkFiles, null, 2));
        } catch (err) {
          console.error(`ERROR: Cannot write ${chunkFileName}: `, err);
          if (!isDebug) process.exit(1);
        }
      },
    }),

    new MiniCssExtractPlugin({
      filename: isDebug ? '[name].css' : '[name].[contenthash:8].css',
      chunkFilename: isDebug
        ? '[name].chunk.css'
        : '[name].[contenthash:8].chunk.css',
    }),

    // Webpack Bundle Analyzer
    // https://github.com/th0r/webpack-bundle-analyzer
    ...(!isDebug && isAnalyze ? [new BundleAnalyzerPlugin()] : []),
  ],

  optimization: {
    runtimeChunk: {
      name: entrypoint => `runtime-${entrypoint.name}`,
    },
    // Создание общих чанков с переиспользуемым функционалом
    splitChunks: {
      cacheGroups: {
        commons: {
          chunks: 'initial',
          test: /[\\/]node_modules[\\/]/,
          name: 'vendors',
        },
      },
    },
  },

  // Некоторые библиотеки импортируют Node модули но не используют их в браузере
  // Подготавливаем для моки webpack
  // https://webpack.js.org/configuration/node/
  // https://github.com/webpack/node-libs-browser/tree/master/mock
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty',
  },
};
