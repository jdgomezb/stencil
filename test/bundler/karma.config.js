process.env.CHROME_BIN = require('puppeteer').executablePath();
const path = require('path');
const localLaunchers = {
  ChromeHeadless: {
    base: 'ChromeHeadless',
    flags: [
      '--no-sandbox',
      // See https://chromium.googlesource.com/chromium/src/+/lkgr/headless/README.md
      '--headless',
      '--disable-gpu',
      // Without a remote debugging port, Google Chrome exits immediately.
      '--remote-debugging-port=9333',
    ],
  },
};

module.exports = function (config) {
  config.set({
    plugins: [
      'karma-chrome-launcher',
      'karma-jasmine',
      'karma-polyfill',
    ],
    browsers: Object.keys(localLaunchers),

    singleRun: true, // set this to false to leave the browser open

    frameworks: ['jasmine', 'polyfill'],

    polyfill: ['Promise'],

    urlRoot: '/__karma__/',
    files: [
      // 'parcel-bundle-test/dist/**',
      'vite-bundle-test/dist/index.html',
      // 'parcel-bundle-test/**/*.spec.js', // tells karma these are tests we need to serve & run
      'vite-bundle-test/vite-bundle.spec.js', // tells karma these are tests we need to serve & run
      // {
      //   pattern: path.join('test-output', 'vite', '/**/*'),
      //   watched: false,
      //   included: false,
      //   served: true,
      //   nocache: true,
      //   type: 'module',
      // },
    ],

    // proxies: {
    //   '/': `/base/${WWW_OUT_DIR}/`,
    // },

    colors: true,

    logLevel: config.LOG_DEBUG,

    reporters: ['progress'],
  });
};
