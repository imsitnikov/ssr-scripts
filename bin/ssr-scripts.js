#!/usr/bin/env node

'use strict';

process.on('unhandledRejection', err => {
  throw err;
});

const { execSync } = require('child_process');

const args = process.argv.slice(2);

const binStartPath = require.resolve('../bin-start.js');

execSync('node ' + binStartPath + args.reduce((acc, arg) => {
  return acc + ' ' + arg;
}, ''));