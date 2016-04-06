"use strict";
const _ = require("lodash");
const webpackConf = require("./webpack.config");

const isTddMode = process.argv.indexOf("--tdd") > -1;

module.exports = config => {
  config.set({
    basePath: '',
    frameworks: ['mocha'],
    files: [ 'src/**/*.spec.{ts,tsx}' ],
    exclude: [],
    preprocessors: {
      'src/**/*.spec.{ts,tsx}': ['webpack', 'sourcemap']
    },
    webpack: webpackConf,
    reporters: ['progress'],
    port: 9876,
    colors: true,
    logLevel: config.LOG_INFO,
    autoWatch: isTddMode,
    browsers: isTddMode ? ['Chrome'] : [ 'PhantomJS' ],
    singleRun: !isTddMode,
    concurrency: Infinity
  });
};
