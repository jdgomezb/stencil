// import type {Config} from 'karma';

// use the instance of chromium that is downloaded as a part of stencil's puppeteer dependency
process.env.CHROME_BIN = require('puppeteer').executablePath();

// local browsers to run the tests against
const localLaunchers = {
  ChromeHeadless: {
    base: 'ChromeHeadless',
    flags: [
      // run in headless mode (https://chromium.googlesource.com/chromium/src/+/lkgr/headless/README.md)
      '--headless',
      // use --disable-gpu to avoid an error from a missing Mesa library (https://chromium.googlesource.com/chromium/src/+/lkgr/headless/README.md)
      '--disable-gpu',
      // without a remote debugging port, Chrome exits immediately.
      '--remote-debugging-port=9333',
    ],
  },
};

/**
 * Export a function to configure Karma to run.
 *
 * For details on how to configure Karma, see http://karma-runner.github.io/6.3/config/configuration-file.html
 *
 * @param config the configuration object. this object will be updated/mutated with the settings necessary to run our
 * tests
 */
module.exports = function (config) {
  config.set({
    browsers: Object.keys(localLaunchers),
    colors: true,
    files: [
      { pattern: 'parcel-bundle-test/dist/index.html', nocache: true, included: false },
      {
        pattern: 'parcel-bundle-test/dist/**/*.js',
        included: false,
        nocache: true,
        type: 'module',
      },
      'parcel-bundle-test/parcel-bundle.spec.ts', // tells karma these are tests we need to serve & run
      { pattern: 'vite-bundle-test/dist/index.html', nocache: true, included: false },
      {
        pattern: 'vite-bundle-test/dist/**/*.js',
        included: false,
        nocache: true,
        type: 'module',
      },
      'vite-bundle-test/vite-bundle.spec.ts', // tells karma these are tests we need to serve & run
      'util.ts',
    ],
    // polyfill: ['Promise'],
    karmaTypescriptConfig: {
      exclude: ['./component-library'],
    },
    frameworks: ['jasmine', 'karma-typescript', 'polyfill'],
    logLevel: config.LOG_DEBUG,
    plugins: ['karma-chrome-launcher', 'karma-jasmine', 'karma-polyfill', 'karma-typescript'],
    proxies: {
      '/assets/': `/base/vite-bundle-test/dist/assets/`,
      // '/p-assets/': `/base/parcel-bundle-test/dist/p-assets/`,
    },
    preprocessors: {
      '**/*.ts': 'karma-typescript',
    },
    reporters: ['progress'],
    singleRun: false, // set this to false to leave the browser open to debug karma
    urlRoot: '/__karma__/',
  });
};
