/* eslint-disable import/no-extraneous-dependencies */

import path from 'path';
import webpack from 'webpack';
import { appPaths } from '../../_utils/app-paths';

export const resolvePath = (...args) => path.resolve(appPaths.root, ...args);

const PUBLIC_PATH = '/static/assets/';

export const isDebug = !process.argv.includes('--release');
export const isVerbose = process.argv.includes('--verbose');
export const isAnalyze =
  process.argv.includes('--analyze') || process.argv.includes('--analyse');

export const reJavaScript = /\.(js)$/;
export const reTypeScript = /\.(ts|tsx)$/;
export const reStyle = /\.(css|scss|sass)$/;
export const reImage = /\.(gif|jpg|jpeg|png|svg)$/;
const staticAssetName = isDebug
  ? '[path][name].[ext]?[hash:8]'
  : '[hash:8].[ext]';

export const commonStylesLoaders = [
  {
    loader: 'postcss-loader',
    options: {
      sourceMap: true,
      config: {
        path: './ssr-scripts/configs/postcss.config.js',
      },
    },
  },
  {
    loader: 'sass-loader',
    options: { sourceMap: true },
  },
];

export default {
  context: appPaths.root,

  mode: isDebug ? 'development' : 'production',

  output: {
    publicPath: PUBLIC_PATH,
    devtoolModuleFilenameTemplate: info =>
      path.resolve(info.absoluteResourcePath).replace(/\\/g, '/'),
  },

  resolve: {
    // Нужно синхронизировать с .eslintrc
    alias: {
      '@': appPaths.src,
    },
    modules: ['node_modules'],
    extensions: ['.ts', '.tsx', '.js', '.json'],
  },

  module: {
    // Делаем несуществующие импорты ошибками в не ворнингами
    strictExportPresence: true,

    rules: [
      {
        test: reTypeScript,
        include: [appPaths.src],
        loader: 'awesome-typescript-loader',
        options: {
          reportFiles: [`${appPaths.src}/**/*.{ts,tsx}`],
          useCache: true,
          useBabel: true,
          babelOptions: {
            // https://babeljs.io/docs/usage/options/
            babelrc: false,
            configFile: false,

            plugins: [
              // Экспериментальные возможности ECMAScript
              '@babel/plugin-proposal-class-properties',
              '@babel/plugin-syntax-dynamic-import',
              '@babel/plugin-transform-exponentiation-operator',
              // https://github.com/babel/babel/tree/master/packages/babel-plugin-transform-react-constant-elements
              ...(isDebug
                ? []
                : ['@babel/plugin-transform-react-constant-elements']),
              // https://github.com/babel/babel/tree/master/packages/babel-plugin-transform-react-inline-elements
              ...(isDebug
                ? []
                : ['@babel/plugin-transform-react-inline-elements']),
            ],
          },
          babelCore: '@babel/core', // needed for Babel v7
        },
      },
      {
        test: reImage,
        oneOf: [
          // Инлайним маловесные изображения в CSS
          {
            issuer: reStyle,
            oneOf: [
              // Инлайним маловесные SVGs как UTF-8 закодированные строки
              {
                test: /\.svg$/,
                loader: 'svg-url-loader',
                options: {
                  name: staticAssetName,
                  limit: 4096, // 4kb
                },
              },

              // Инлайним маловесные изображения как Base64 закодированные строки
              {
                loader: 'url-loader',
                options: {
                  name: staticAssetName,
                  limit: 4096, // 4kb
                },
              },
            ],
          },

          // Или возвращем URL на ресурс
          {
            loader: 'file-loader',
            options: {
              name: staticAssetName,
            },
          },
        ],
      },

      // Конвертирование TXT в модуль
      {
        test: /\.txt$/,
        loader: 'raw-loader',
      },

      // Для всего основного возвращаем URL
      // НЕ ЗАБЫТЬ обновить `exclude` при добавлении нового модуля
      {
        exclude: [
          reJavaScript,
          reTypeScript,
          reStyle,
          reImage,
          /\.json$/,
          /\.txt$/,
          /\.md$/,
          /\.ejs$/,
        ],
        loader: 'file-loader',
        options: {
          name: staticAssetName,
        },
      },

      // Исключение dev модулей при production сборке
      ...(isDebug
        ? []
        : [
            {
              test: resolvePath(
                'node_modules/react-deep-force-update/lib/index.js',
              ),
              loader: 'null-loader',
            },
          ]),
    ],
  },

  bail: !isDebug,

  cache: isDebug,

  stats: {
    cached: isVerbose,
    cachedAssets: isVerbose,
    chunks: isVerbose,
    chunkModules: isVerbose,
    colors: true,
    hash: isVerbose,
    modules: isVerbose,
    reasons: isDebug,
    timings: true,
    version: isVerbose,
    // Скрываем ворнинги для mini-css-extract-plugin warnings о конфликтах в порядке стилей
    warningsFilter: warning =>
      /Conflicting order. Following module has been added/gm.test(warning),
    // Скрываем логи дочерних плагинов
    children: false,
  },

  plugins: [
    new webpack.DefinePlugin({
      __DEV__: isDebug,
      __TEST__: false,
    }),

    // Игнорирование лишних локалей moment.js
    new webpack.ContextReplacementPlugin(/moment[/\\]locale$/, /ru|en-gb/),
  ],
};
